import { readdirSync, readFileSync, existsSync, statSync } from 'fs';
import path from 'path';
import { openclawPath } from '../config.js';

interface CostEntry {
  agent: string;
  model: string;
  provider: string;
  day: string;
  cost: number;
  tokens: number;
}

interface CostAnalytics {
  totals: { cost: number; tokens: number; sessions: number };
  byAgent: Record<string, { cost: number; tokens: number; sessions: number }>;
  byModel: Record<string, { cost: number; tokens: number }>;
  byDay: Record<string, { cost: number; tokens: number }>;
  cachedAt: number;
}

let cache: CostAnalytics | null = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getCostAnalytics(): CostAnalytics {
  if (cache && Date.now() - cacheTime < CACHE_TTL) return cache;

  const agentsDir = openclawPath('agents');
  if (!existsSync(agentsDir)) {
    return { totals: { cost: 0, tokens: 0, sessions: 0 }, byAgent: {}, byModel: {}, byDay: {}, cachedAt: Date.now() };
  }

  const entries: CostEntry[] = [];
  let totalSessions = 0;
  const agentSessionCounts: Record<string, number> = {};

  const agentDirs = readdirSync(agentsDir).filter(d => {
    try { return statSync(path.join(agentsDir, d)).isDirectory(); } catch { return false; }
  });

  for (const agentId of agentDirs) {
    const sessionsDir = path.join(agentsDir, agentId, 'sessions');
    if (!existsSync(sessionsDir)) continue;

    const files = readdirSync(sessionsDir).filter(f => f.endsWith('.jsonl'));
    agentSessionCounts[agentId] = files.length;
    totalSessions += files.length;

    for (const file of files) {
      const filePath = path.join(sessionsDir, file);
      let content: string;
      try {
        content = readFileSync(filePath, 'utf-8');
      } catch {
        continue;
      }

      const lines = content.trim().split('\n').filter(Boolean);
      for (const line of lines) {
        let parsed: any;
        try {
          parsed = JSON.parse(line);
        } catch {
          continue;
        }

        if (parsed.type !== 'message' || parsed.message?.role !== 'assistant') continue;
        const msg = parsed.message;
        if (!msg.usage?.cost?.total) continue;

        const day = (parsed.timestamp || '').slice(0, 10); // YYYY-MM-DD
        entries.push({
          agent: agentId,
          model: msg.model || 'unknown',
          provider: msg.provider || msg.api || 'unknown',
          day,
          cost: msg.usage.cost.total,
          tokens: msg.usage.totalTokens || 0,
        });
      }
    }
  }

  const byAgent: Record<string, { cost: number; tokens: number; sessions: number }> = {};
  const byModel: Record<string, { cost: number; tokens: number }> = {};
  const byDay: Record<string, { cost: number; tokens: number }> = {};
  let totalCost = 0;
  let totalTokens = 0;

  for (const e of entries) {
    totalCost += e.cost;
    totalTokens += e.tokens;

    if (!byAgent[e.agent]) byAgent[e.agent] = { cost: 0, tokens: 0, sessions: 0 };
    byAgent[e.agent].cost += e.cost;
    byAgent[e.agent].tokens += e.tokens;

    const modelKey = e.model.includes('/') ? e.model : `${e.provider}/${e.model}`;
    if (!byModel[modelKey]) byModel[modelKey] = { cost: 0, tokens: 0 };
    byModel[modelKey].cost += e.cost;
    byModel[modelKey].tokens += e.tokens;

    if (e.day) {
      if (!byDay[e.day]) byDay[e.day] = { cost: 0, tokens: 0 };
      byDay[e.day].cost += e.cost;
      byDay[e.day].tokens += e.tokens;
    }
  }

  // Add session counts to byAgent
  for (const agentId of Object.keys(agentSessionCounts)) {
    if (!byAgent[agentId]) byAgent[agentId] = { cost: 0, tokens: 0, sessions: 0 };
    byAgent[agentId].sessions = agentSessionCounts[agentId];
  }

  cache = {
    totals: { cost: totalCost, tokens: totalTokens, sessions: totalSessions },
    byAgent,
    byModel,
    byDay,
    cachedAt: Date.now(),
  };
  cacheTime = Date.now();

  return cache;
}
