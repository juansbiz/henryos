import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useCronRuns(jobId: string | null, limit = 30, offset = 0) {
  return useQuery({
    queryKey: ['cron-runs', jobId, limit, offset],
    queryFn: () => api.getCronRuns(jobId!, limit, offset),
    enabled: !!jobId,
    refetchInterval: 60000,
  });
}

export function useCronStats() {
  return useQuery({
    queryKey: ['cron-stats'],
    queryFn: api.getCronStats,
    refetchInterval: 60000,
  });
}
