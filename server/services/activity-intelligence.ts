import { existsSync, readFileSync, readdirSync } from 'fs';
import path from 'path';
import { openclawPath } from '../config.js';
import { gatewayClient } from './gateway-client.js';
import { parseSessions } from './session-parser.js';
import * as planService from './plan-service.js';

// -- Types --

export interface AgentIntelligence {
  id: string;
  name: string;
  emoji: string;
  department: string;
  activityStatus: 'executing' | 'blocked' | 'waiting' | 'idle' | 'offline' | 'error';
  doing: string | null;
  doingTimestamp: number | null;
  planContext: {
    planId: string;
    planTitle: string;
    phaseName: string;
    phaseEmoji: string;
    subPlanTitle: string;
    taskName: string;
    progress: number;
  } | null;
  activeGoals: string[];
  completedGoals: string[];
  blockers: string[];
  lastActivityMs: number | null;
  runsToday: number;
  successRate24h: number;
  activitySparkline: { ts: number; status: string; durationMs: number }[];
}

export interface BlockerAlert {
  severity: 'warning' | 'critical';
  summary: string;
  affectedAgents: string[];
  requiresCeo: boolean;
  firstSeenMs: number;
  reportedBy: string;
}

export interface TickerEvent {
  ts: number;
  agentId: string;
  agentName: string;
  emoji: string;
  type: string;
  summary: string;
}

export interface MissionControlData {
  overallHealth: 'green' | 'yellow' | 'red';
  activeAgents: number;
  blockedAgents: number;
  planProgress: number;
  currentPhase: string;
  agents: AgentIntelligence[];
  blockers: BlockerAlert[];
  ticker: TickerEvent[];
  phases: {
    id: string;
    name: string;
    emoji: string;
    status: string;
    progress: number;
    taskCount: number;
    completedCount: number;
    blockedCount: number;
    agents: string[];
  }[];
}

// -- Agent registry --

const AGENTS: { id: string; name: string; emoji: string; department: string }[] = [
  { id: 'henry', name: 'Henry', emoji: '\ud83c\udfd7\ufe0f', department: 'hq' },
  { id: 'warren', name: 'Warren', emoji: '\ud83d\udcca', department: 'revenue' },
  { id: 'hormozi', name: 'Hormozi', emoji: '\ud83d\udcb0', department: 'marketing' },
  { id: 'elon', name: 'Elon', emoji: '\ud83d\ude80', department: 'engineering' },
  { id: 'sales', name: 'Sales', emoji: '\ud83d\udcbc', department: 'engineering' },
  { id: 'marketing', name: 'Marketing', emoji: '\ud83d\udce7', department: 'engineering' },
  { id: 'tasks', name: 'Tasks', emoji: '\ud83d\udccb', department: 'engineering' },
  { id: 'reviewer', name: 'Reviewer', emoji: '\ud83d\udd0d', department: 'engineering' },
  { id: 'scout', name: 'Scout', emoji: '\ud83d\udd2d', department: 'revenue' },
  { id: 'herald', name: 'Herald', emoji: '\ud83d\udce2', department: 'revenue' },
  { id: 'quill', name: 'Quill', emoji: '\u270d\ufe0f', department: 'marketing' },
];

// -- Cache --

let missionCache: MissionControlData | null = null;
let missionCacheTs = 0;
const CACHE_TTL = 30_000;

// -- Cron run reading --

function getLatestCronRun(jobId: string): any | null {
  const logPath = openclawPath('cron', 'runs', `${jobId}.jsonl`);
  if (!existsSync(logPath)) return null;
  const content = readFileSync(logPath, 'utf-8').trim();
  const lines = content.split('\n').filter(Boolean);
  if (lines.length === 0) return null;
  try { return JSON.parse(lines[lines.length - 1]); }
  catch { return null; }
}

function getRecentCronRuns(jobId: string, count: number): any[] {
  const logPath = openclawPath('cron', 'runs', `${jobId}.jsonl`);
  if (!existsSync(logPath)) return [];
  const content = readFileSync(logPath, 'utf-8').trim();
  const lines = content.split('\n').filter(Boolean);
  return lines.slice(-count).map(line => {
    try { return JSON.parse(line); }
    catch { return null; }
  }).filter(Boolean);
}

function getAllCronJobIds(): string[] {
  const runsDir = openclawPath('cron', 'runs');
  if (!existsSync(runsDir)) return [];
  return readdirSync(runsDir).filter(f => f.endsWith('.jsonl')).map(f => f.replace('.jsonl', ''));
}

function getAgentCronJobIds(agentId: string): string[] {
  return getAllCronJobIds().filter(id => id.startsWith(agentId + '-') || id === agentId);
}

// -- Goals.md parsing --

function parseGoalsFile(agentId: string): { active: string[]; completed: string[]; blockers: string[] } {
  const brainDir = process.env.BRAIN_CONTEXT_DIR || path.join(process.env.HOME || '/home/juansbiz', 'Desktop/CODE/1. AXOLOP /1. AXOLOP-BRAIN/4. Context/agents');
  const goalsPath = path.join(brainDir, agentId, 'goals.md');
  if (!existsSync(goalsPath)) return { active: [], completed: [], blockers: [] };

  const content = readFileSync(goalsPath, 'utf-8');
  const active: string[] = [];
  const completed: string[] = [];
  const blockers: string[] = [];

  let inBlockers = false;
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (/^##\s*blockers?/i.test(trimmed)) {
      inBlockers = true;
      continue;
    }
    if (/^##\s/.test(trimmed) && inBlockers) {
      inBlockers = false;
    }
    if (inBlockers && /^[-*]\s/.test(trimmed)) {
      blockers.push(trimmed.replace(/^[-*]\s+/, ''));
      continue;
    }
    const checkMatch = trimmed.match(/^-\s*\[([ x])\]\s*(.*)/i);
    if (checkMatch) {
      if (checkMatch[1].toLowerCase() === 'x') {
        completed.push(checkMatch[2]);
      } else {
        active.push(checkMatch[2]);
      }
    }
  }
  return { active, completed, blockers };
}

// -- "Doing" extraction from cron --

function extractDoing(agentId: string): { doing: string | null; doingTimestamp: number | null } {
  const jobIds = getAgentCronJobIds(agentId);
  let latest: any = null;

  for (const jid of jobIds) {
    const run = getLatestCronRun(jid);
    if (run && (!latest || (run.ts || run.runAtMs) > (latest.ts || latest.runAtMs))) {
      latest = run;
    }
  }

  if (!latest || !latest.summary) return { doing: null, doingTimestamp: null };

  let summary = latest.summary;
  summary = summary.replace(/\*\*/g, '').trim();
  const firstLine = summary.split('\n')[0];
  const doing = firstLine.length > 200 ? firstLine.slice(0, 200) + '...' : firstLine;
  return { doing, doingTimestamp: latest.ts || latest.runAtMs || null };
}

// -- Sparkline data --

function getSparkline(agentId: string): { ts: number; status: string; durationMs: number }[] {
  const jobIds = getAgentCronJobIds(agentId);
  const allRuns: any[] = [];
  for (const jid of jobIds) {
    allRuns.push(...getRecentCronRuns(jid, 24));
  }
  allRuns.sort((a, b) => (a.ts || a.runAtMs) - (b.ts || b.runAtMs));
  return allRuns.slice(-24).map(r => ({
    ts: r.ts || r.runAtMs,
    status: r.status === 'ok' ? 'ok' : 'error',
    durationMs: r.durationMs || 0,
  }));
}

// -- Blocker extraction --

function extractBlockers(): BlockerAlert[] {
  const blockers: BlockerAlert[] = [];

  // Check Henry heartbeat for CEO items
  const henryRun = getLatestCronRun('henry-heartbeat');
  if (henryRun?.summary) {
    const lines = henryRun.summary.split('\n');
    for (const line of lines) {
      if (/CEO\s*Input\s*Needed/i.test(line) || /BLOCKED:/i.test(line)) {
        blockers.push({
          severity: 'critical',
          summary: line.replace(/\*\*/g, '').trim(),
          affectedAgents: ['henry'],
          requiresCeo: true,
          firstSeenMs: henryRun.ts || henryRun.runAtMs || Date.now(),
          reportedBy: 'henry',
        });
      }
    }
  }

  // Check all agents' goals for blockers
  for (const agent of AGENTS) {
    const goals = parseGoalsFile(agent.id);
    for (const b of goals.blockers) {
      blockers.push({
        severity: 'warning',
        summary: b,
        affectedAgents: [agent.id],
        requiresCeo: /ceo|juan|boss/i.test(b),
        firstSeenMs: Date.now(),
        reportedBy: agent.id,
      });
    }
  }

  return blockers;
}

// -- Ticker --

function buildTicker(): TickerEvent[] {
  const events: TickerEvent[] = [];
  const allJobIds = getAllCronJobIds();

  for (const jid of allJobIds) {
    const runs = getRecentCronRuns(jid, 5);
    const agent = AGENTS.find(a => jid.startsWith(a.id + '-') || jid === a.id);
    for (const run of runs) {
      events.push({
        ts: run.ts || run.runAtMs || 0,
        agentId: agent?.id || jid.split('-')[0],
        agentName: agent?.name || jid.split('-')[0],
        emoji: agent?.emoji || '',
        type: run.status === 'ok' ? 'cron-ok' : 'cron-error',
        summary: (run.summary || '').replace(/\*\*/g, '').split('\n')[0].slice(0, 120),
      });
    }
  }

  events.sort((a, b) => b.ts - a.ts);
  return events.slice(0, 30);
}

// -- Activity status derivation --

function deriveStatus(
  agentId: string,
  hasBlockers: boolean,
  lastActivityMs: number | null,
  hasActiveSessions: boolean,
): AgentIntelligence['activityStatus'] {
  if (hasActiveSessions && lastActivityMs && Date.now() - lastActivityMs < 5 * 60 * 1000) {
    return 'executing';
  }
  if (hasBlockers) return 'blocked';
  if (lastActivityMs && Date.now() - lastActivityMs < 30 * 60 * 1000) return 'waiting';
  if (lastActivityMs) return 'idle';
  return 'offline';
}

// -- Main aggregation --

export async function getMissionControl(): Promise<MissionControlData> {
  const now = Date.now();
  if (missionCache && now - missionCacheTs < CACHE_TTL) return missionCache;

  // Get active sessions from gateway
  let activeSessions: Set<string> = new Set();
  let sessionUpdatedAt: Record<string, number> = {};
  try {
    if (gatewayClient.isConnected) {
      const raw = await gatewayClient.listSessions();
      const sessions = parseSessions(Array.isArray(raw) ? raw : raw?.sessions || []);
      for (const s of sessions) {
        activeSessions.add(s.agentId);
        const prev = sessionUpdatedAt[s.agentId] || 0;
        if (s.updatedAt > prev) sessionUpdatedAt[s.agentId] = s.updatedAt;
      }
    }
  } catch { /* gateway offline */ }

  // Build agent intelligence
  const agents: AgentIntelligence[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  for (const a of AGENTS) {
    const { doing, doingTimestamp } = extractDoing(a.id);
    const goals = parseGoalsFile(a.id);
    const planCtx = planService.getAgentPlanContext(a.id);
    const sparkline = getSparkline(a.id);
    const jobIds = getAgentCronJobIds(a.id);

    // Count today's runs
    let runsToday = 0;
    let successCount24h = 0;
    let totalCount24h = 0;
    for (const jid of jobIds) {
      const runs = getRecentCronRuns(jid, 50);
      for (const r of runs) {
        const ts = r.ts || r.runAtMs;
        if (ts >= todayMs) runsToday++;
        if (ts >= now - 86400_000) {
          totalCount24h++;
          if (r.status === 'ok') successCount24h++;
        }
      }
    }

    const lastActivityMs = sessionUpdatedAt[a.id] || doingTimestamp || null;
    const hasBlockers = goals.blockers.length > 0;
    const hasActiveSess = activeSessions.has(a.id);
    const status = deriveStatus(a.id, hasBlockers, lastActivityMs, hasActiveSess);

    agents.push({
      id: a.id,
      name: a.name,
      emoji: a.emoji,
      department: a.department,
      activityStatus: status,
      doing,
      doingTimestamp,
      planContext: planCtx,
      activeGoals: goals.active.slice(0, 5),
      completedGoals: goals.completed.slice(0, 5),
      blockers: goals.blockers,
      lastActivityMs,
      runsToday,
      successRate24h: totalCount24h > 0 ? Math.round((successCount24h / totalCount24h) * 100) : 100,
      activitySparkline: sparkline,
    });
  }

  // Blockers
  const blockers = extractBlockers();

  // Ticker
  const ticker = buildTicker();

  // Plan-level data
  const plans = planService.listPlans();
  const activePlan = plans.find(p => p.status === 'active');
  let planProgress = 0;
  let currentPhase = '';
  let phases: MissionControlData['phases'] = [];

  if (activePlan) {
    const fullPlan = planService.getPlan(activePlan.id);
    if (fullPlan) {
      planProgress = fullPlan.progress.progress;
      const activePhase = fullPlan.phases.find(p => p.status === 'in-progress');
      currentPhase = activePhase ? `${activePhase.emoji} ${activePhase.name}` : '';

      phases = fullPlan.phases.map(p => {
        const phaseProgress = planService.computePhaseProgress(fullPlan, p.id);
        const phaseSubs = fullPlan.subPlans.filter(sp => sp.parentPhaseId === p.id);
        const agentIds = [...new Set(phaseSubs.flatMap(sp => sp.tasks.map(t => t.assignedTo)))];
        return {
          id: p.id,
          name: p.name,
          emoji: p.emoji,
          status: p.status,
          progress: phaseProgress.progress,
          taskCount: phaseProgress.total,
          completedCount: phaseProgress.completed,
          blockedCount: phaseProgress.blocked,
          agents: agentIds,
        };
      });
    }
  }

  // Overall health
  const blockedCount = agents.filter(a => a.activityStatus === 'blocked' || a.activityStatus === 'error').length;
  const activeCount = agents.filter(a => a.activityStatus === 'executing' || a.activityStatus === 'waiting').length;
  const overallHealth = blockedCount > 2 ? 'red' : blockedCount > 0 ? 'yellow' : 'green';

  const data: MissionControlData = {
    overallHealth,
    activeAgents: activeCount,
    blockedAgents: blockedCount,
    planProgress,
    currentPhase,
    agents,
    blockers,
    ticker,
    phases,
  };

  missionCache = data;
  missionCacheTs = now;
  return data;
}

export async function getAgentIntel(agentId: string): Promise<AgentIntelligence | null> {
  const data = await getMissionControl();
  return data.agents.find(a => a.id === agentId) || null;
}

export async function getBlockers(): Promise<BlockerAlert[]> {
  const data = await getMissionControl();
  return data.blockers;
}
