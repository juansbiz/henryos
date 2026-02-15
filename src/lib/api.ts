import type { SessionFileMeta, ParsedSessionEvent, SessionTotals, CostAnalytics, CronRunEntry, CronJobStats, AgentStatusEntry, MissionControlData, AgentIntelligence, BlockerAlert, PlanSummary, Plan, SubPlan, PlanTask, EnrichedSessionFileMeta, SessionArchiveInfo } from './types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // System
  getHealth: () => fetchJSON<{ status: string; gateway: boolean; uptime: number }>('/system/health'),
  getStats: () => fetchJSON<{ agents: number; sessions: number; cronJobs: number }>('/system/stats'),

  // Agents
  getAgents: () => fetchJSON<any[]>('/agents'),
  getAgent: (id: string) => fetchJSON<any>(`/agents/${id}`),
  getAgentStatus: () => fetchJSON<AgentStatusEntry[]>('/agents/status'),

  // Workspaces
  getWorkspaceFiles: (agentId: string) => fetchJSON<string[]>(`/workspaces/${agentId}/files`),
  getWorkspaceFile: (agentId: string, filename: string) =>
    fetchJSON<{ content: string; filename: string }>(`/workspaces/${agentId}/files/${filename}`),
  saveWorkspaceFile: (agentId: string, filename: string, content: string) =>
    fetchJSON<{ success: boolean }>(`/workspaces/${agentId}/files/${filename}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }),

  // Config
  getConfig: () => fetchJSON<any>('/config'),
  getModels: () => fetchJSON<any>('/config/models'),

  // Cron
  getCronJobs: () => fetchJSON<any[]>('/cron/jobs'),
  getCronRuns: (jobId: string, limit?: number, offset?: number) => {
    const params = new URLSearchParams();
    if (limit) params.set('limit', String(limit));
    if (offset) params.set('offset', String(offset));
    const qs = params.toString();
    return fetchJSON<any>(`/cron/runs/${jobId}${qs ? `?${qs}` : ''}`);
  },
  getCronStats: () => fetchJSON<{
    totalJobs: number;
    totalRuns: number;
    overallSuccessRate: number;
    avgDurationMs: number;
    jobStats: Record<string, CronJobStats>;
  }>('/cron/stats'),

  // Gateway
  getGatewayStatus: () => fetchJSON<{ connected: boolean }>('/gateway/status'),
  sendAgentMessage: (agentId: string, message: string) =>
    fetchJSON<{ response: string }>(`/gateway/agent/${agentId}/message`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  // Standups
  getStandups: () => fetchJSON<any[]>('/standups'),
  getStandup: (id: string) => fetchJSON<any>(`/standups/${id}`),
  createStandup: (data: { title: string; participants: string[]; topic: string }) =>
    fetchJSON<any>('/standups', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  sendStandupMessage: (id: string, message: string) =>
    fetchJSON<any>(`/standups/${id}/message`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  // Sessions (live gateway sessions)
  getSessions: (params?: { category?: string; agent?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.agent) query.set('agent', params.agent);
    const qs = query.toString();
    return fetchJSON<any[]>(`/sessions${qs ? `?${qs}` : ''}`);
  },

  // Session Browser (JSONL file browsing)
  getAgentSessions: (agentId: string, page = 1, limit = 20, archived = false) =>
    fetchJSON<{ sessions: EnrichedSessionFileMeta[]; total: number }>(
      `/sessions/${agentId}/list?page=${page}&limit=${limit}&archived=${archived}`
    ),
  getSessionDetail: (agentId: string, sessionId: string, offset = 0, limit = 200) =>
    fetchJSON<{ session: any; events: ParsedSessionEvent[]; totals: SessionTotals; eventCount: number }>(
      `/sessions/${agentId}/${sessionId}?offset=${offset}&limit=${limit}`
    ),

  // Analytics
  getCostAnalytics: () => fetchJSON<CostAnalytics>('/analytics/cost'),

  // Docs
  getDoc: (slug: string) => fetchJSON<{ content: string; title: string }>(`/docs/${slug}`),

  // Intelligence
  getMissionControl: () => fetchJSON<MissionControlData>('/intelligence/mission-control'),
  getAgentIntel: (id: string) => fetchJSON<AgentIntelligence>(`/intelligence/agent/${id}`),
  getBlockers: () => fetchJSON<BlockerAlert[]>('/intelligence/blockers'),

  // Plans
  getPlans: () => fetchJSON<PlanSummary[]>('/plans'),
  getPlan: (id: string) => fetchJSON<Plan>('/plans/' + id),
  createPlan: (data: { title: string; description: string; targetDate: string; phases?: any[]; createdBy?: string; createdByName?: string }) =>
    fetchJSON<Plan>('/plans', { method: 'POST', body: JSON.stringify(data) }),
  updatePlan: (id: string, data: any) =>
    fetchJSON<Plan>(`/plans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  addSubPlan: (planId: string, data: { title: string; createdBy: string; createdByName: string; department: string; parentPhaseId: string; tasks?: any[] }) =>
    fetchJSON<SubPlan>(`/plans/${planId}/sub-plans`, { method: 'POST', body: JSON.stringify(data) }),
  updateSubPlan: (planId: string, subId: string, data: any) =>
    fetchJSON<SubPlan>(`/plans/${planId}/sub-plans/${subId}`, { method: 'PUT', body: JSON.stringify(data) }),
  updatePlanTask: (planId: string, subId: string, taskId: string, data: Partial<Pick<PlanTask, 'status' | 'notes'>>) =>
    fetchJSON<PlanTask>(`/plans/${planId}/sub-plans/${subId}/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  archivePlan: (id: string) =>
    fetchJSON<Plan>(`/plans/${id}/archive`, { method: 'POST' }),

  // Session Archive
  archiveSession: (agentId: string, sessionId: string, note?: string) =>
    fetchJSON<{ success: boolean }>(`/sessions/${agentId}/${sessionId}/archive`, { method: 'POST', body: JSON.stringify({ note }) }),
  unarchiveSession: (agentId: string, sessionId: string) =>
    fetchJSON<{ success: boolean }>(`/sessions/${agentId}/${sessionId}/unarchive`, { method: 'POST' }),
  bulkArchiveSessions: (sessions: { agentId: string; sessionId: string }[], note?: string) =>
    fetchJSON<{ success: boolean }>('/sessions/bulk-archive', { method: 'POST', body: JSON.stringify({ sessions, note }) }),
  tagSession: (agentId: string, sessionId: string, tags: string[]) =>
    fetchJSON<{ success: boolean }>(`/sessions/${agentId}/${sessionId}/tags`, { method: 'PUT', body: JSON.stringify({ tags }) }),
  noteSession: (agentId: string, sessionId: string, note: string) =>
    fetchJSON<{ success: boolean }>(`/sessions/${agentId}/${sessionId}/note`, { method: 'PUT', body: JSON.stringify({ note }) }),
};
