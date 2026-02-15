import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useAgentStatus() {
  return useQuery({
    queryKey: ['agent-status'],
    queryFn: api.getAgentStatus,
    refetchInterval: 15000,
  });
}
