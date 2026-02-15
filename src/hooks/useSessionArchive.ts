import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useArchiveSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ agentId, sessionId, note }: { agentId: string; sessionId: string; note?: string }) =>
      api.archiveSession(agentId, sessionId, note),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['agent-sessions'] }); },
  });
}

export function useUnarchiveSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ agentId, sessionId }: { agentId: string; sessionId: string }) =>
      api.unarchiveSession(agentId, sessionId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['agent-sessions'] }); },
  });
}

export function useBulkArchive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessions, note }: { sessions: { agentId: string; sessionId: string }[]; note?: string }) =>
      api.bulkArchiveSessions(sessions, note),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['agent-sessions'] }); },
  });
}

export function useTagSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ agentId, sessionId, tags }: { agentId: string; sessionId: string; tags: string[] }) =>
      api.tagSession(agentId, sessionId, tags),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['agent-sessions'] }); },
  });
}

export function useNoteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ agentId, sessionId, note }: { agentId: string; sessionId: string; note: string }) =>
      api.noteSession(agentId, sessionId, note),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['agent-sessions'] }); },
  });
}
