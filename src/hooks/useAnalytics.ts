import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics-cost'],
    queryFn: api.getCostAnalytics,
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
}
