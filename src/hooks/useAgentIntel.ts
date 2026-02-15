import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useAgentIntel(id: string | null) {
  return useQuery({
    queryKey: ['agent-intel', id],
    queryFn: () => api.getAgentIntel(id!),
    enabled: !!id,
    refetchInterval: 15000,
  });
}
