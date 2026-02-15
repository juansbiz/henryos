export interface Agent {
  id: string;
  name: string;
  model: {
    primary: string;
    fallbacks: string[];
  };
  workspace: string;
  tools: {
    profile?: string;
    allow: string[];
  };
  status?: 'active' | 'idle' | 'error';
}

export interface CronJob {
  id: string;
  agentId: string;
  name: string;
  enabled: boolean;
  schedule: {
    kind: string;
    expr: string;
    tz: string;
  };
  payload: {
    kind: string;
    message: string;
    timeoutSeconds: number;
  };
  state: {
    nextRunAtMs?: number;
    lastRunAtMs?: number;
    lastStatus?: string;
    lastError?: string;
    lastDurationMs?: number;
    consecutiveErrors?: number;
  };
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  agentCount: number;
  cost: { input: number; output: number };
}

export interface StandupMessage {
  id: string;
  agentId: string;
  agentName: string;
  content: string;
  timestamp: number;
  role: 'agent' | 'human';
}

export interface Standup {
  id: string;
  title: string;
  topic: string;
  participants: string[];
  messages: StandupMessage[];
  status: 'active' | 'completed';
  createdAt: number;
  completedAt?: number;
}

export type SessionCategory = 'cron-run' | 'cron' | 'discord' | 'conversation' | 'henry-os' | 'other';

export interface SessionEntry {
  key: string;
  agentId: string;
  category: SessionCategory;
  categoryLabel: string;
  updatedAt: number;
  displayName: string;
  totalTokens: number;
  model: string;
  modelProvider: string;
  abortedLastRun: boolean;
}

export type OrgRole = 'orchestrator' | 'chief' | 'agent';

export interface OrgNode {
  id: string;
  name: string;
  role: string;
  model: string;
  tier: OrgRole;
  children?: OrgNode[];
  emoji?: string;
}

// Session Browser types
export interface SessionFileMeta {
  sessionId: string;
  agentId: string;
  timestamp: string;
  cwd: string;
  lineCount: number;
  sizeBytes: number;
  modifiedAt: number;
}

export interface ParsedSessionEvent {
  type: 'session_header' | 'model_change' | 'user_message' | 'assistant_message' | 'tool_call' | 'tool_result' | 'thinking';
  id: string;
  timestamp: string;
  data: any;
}

export interface TokenUsage {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  totalTokens: number;
  cost: {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
    total: number;
  };
}

export interface SessionTotals {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  totalTokens: number;
  totalCost: number;
  messageCount: number;
  toolCallCount: number;
}

// Cost Analytics types
export interface CostAnalytics {
  totals: { cost: number; tokens: number; sessions: number };
  byAgent: Record<string, { cost: number; tokens: number; sessions: number }>;
  byModel: Record<string, { cost: number; tokens: number }>;
  byDay: Record<string, { cost: number; tokens: number }>;
  cachedAt: number;
}

// Cron types
export interface CronRunEntry {
  ts: number;
  jobId: string;
  action: string;
  status: string;
  summary: string;
  sessionId?: string;
  sessionKey?: string;
  runAtMs: number;
  durationMs: number;
  nextRunAtMs?: number;
  error?: string;
}

export interface CronJobStats {
  totalRuns: number;
  successCount: number;
  errorCount: number;
  avgDurationMs: number;
  successRate: number;
}

// Agent status types
export type AgentLiveStatus = 'active' | 'idle' | 'error' | 'offline';

export interface AgentStatusEntry {
  id: string;
  name: string;
  status: AgentLiveStatus;
  lastActivity: number | null;
  sessionCount: number;
  cronErrors: number;
}

// Mission Control types
export type ActivityStatus = 'executing' | 'blocked' | 'waiting' | 'idle' | 'offline' | 'error';

export interface AgentIntelligence {
  id: string;
  name: string;
  emoji: string;
  department: string;
  activityStatus: ActivityStatus;
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

export interface PhaseProgress {
  id: string;
  name: string;
  emoji: string;
  status: string;
  progress: number;
  taskCount: number;
  completedCount: number;
  blockedCount: number;
  agents: string[];
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
  phases: PhaseProgress[];
}

// Plan Management types
export interface PlanPhase {
  id: string;
  name: string;
  emoji: string;
  status: 'draft' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface PlanTask {
  id: string;
  name: string;
  assignedTo: string;
  assignedToName: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  completedAt?: number;
  linkedSessionIds?: string[];
  notes?: string;
}

export interface SubPlan {
  id: string;
  title: string;
  createdBy: string;
  createdByName: string;
  department: string;
  parentPhaseId: string;
  status: 'draft' | 'in-progress' | 'completed' | 'archived';
  createdAt: number;
  tasks: PlanTask[];
}

export interface ChangelogEntry {
  ts: number;
  by: string;
  action: string;
}

export interface Plan {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdByName: string;
  createdAt: number;
  updatedAt: number;
  targetDate: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  phases: PlanPhase[];
  subPlans: SubPlan[];
  cronCategories: Record<string, { category: string; label: string; relatedPhaseId?: string }>;
  changelog: ChangelogEntry[];
  progress?: { total: number; completed: number; blocked: number; inProgress: number; pending: number; progress: number };
}

export interface PlanSummary {
  id: string;
  title: string;
  createdBy: string;
  createdByName: string;
  status: string;
  targetDate: string;
  updatedAt: number;
  progress: number;
  taskCount: number;
  completedCount: number;
}

// Session Archive types
export interface SessionArchiveInfo {
  isArchived: boolean;
  archivedAt?: number;
  tags: string[];
  note?: string;
}

export interface EnrichedSessionFileMeta extends SessionFileMeta {
  isArchived: boolean;
  tags: string[];
  note?: string;
}
