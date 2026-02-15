import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useAgentSessions(agentId: string | null, page = 1, limit = 20, archived = false) {
  return useQuery({
    queryKey: ['agent-sessions', agentId, page, limit, archived],
    queryFn: () => api.getAgentSessions(agentId!, page, limit, archived),
    enabled: !!agentId,
  });
}

export function useSessionDetail(agentId: string | null, sessionId: string | null, offset = 0, limit = 200) {
  return useQuery({
    queryKey: ['session-detail', agentId, sessionId, offset, limit],
    queryFn: () => api.getSessionDetail(agentId!, sessionId!, offset, limit),
    enabled: !!agentId && !!sessionId,
  });
}
