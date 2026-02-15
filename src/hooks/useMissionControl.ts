import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useMissionControl() {
  return useQuery({
    queryKey: ['mission-control'],
    queryFn: api.getMissionControl,
    refetchInterval: 15000,
  });
}
