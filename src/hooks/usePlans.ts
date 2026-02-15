import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: api.getPlans,
    refetchInterval: 30000,
  });
}

export function usePlan(id: string | null) {
  return useQuery({
    queryKey: ['plan', id],
    queryFn: () => api.getPlan(id!),
    enabled: !!id,
  });
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createPlan,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['plans'] }); },
  });
}

export function useUpdatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updatePlan(id, data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['plans'] });
      qc.invalidateQueries({ queryKey: ['plan', vars.id] });
    },
  });
}

export function useAddSubPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, data }: { planId: string; data: Parameters<typeof api.addSubPlan>[1] }) =>
      api.addSubPlan(planId, data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['plans'] });
      qc.invalidateQueries({ queryKey: ['plan', vars.planId] });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, subId, taskId, data }: { planId: string; subId: string; taskId: string; data: any }) =>
      api.updatePlanTask(planId, subId, taskId, data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['plans'] });
      qc.invalidateQueries({ queryKey: ['plan', vars.planId] });
      qc.invalidateQueries({ queryKey: ['mission-control'] });
    },
  });
}

export function useArchivePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.archivePlan,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['plans'] }); },
  });
}
