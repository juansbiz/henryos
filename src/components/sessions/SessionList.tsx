import { useState } from 'react';
import { useAgentSessions } from '../../hooks/useSessionDetail';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { formatDateTime } from '../../lib/utils';
import { ScrollText, ChevronLeft, ChevronRight, Archive } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SessionActions } from './SessionActions';
import { SessionTagEditor } from './SessionTagEditor';
import { SessionNoteEditor } from './SessionNoteEditor';
import type { EnrichedSessionFileMeta } from '../../lib/types';

interface SessionListProps {
  agentId: string;
  selectedSessionId: string | null;
  onSelect: (sessionId: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  showArchived?: boolean;
  bulkMode?: boolean;
  selectedSessions?: Set<string>;
  onToggleSelect?: (sessionId: string) => void;
}

export function SessionList({
  agentId, selectedSessionId, onSelect, page, onPageChange,
  showArchived = false, bulkMode = false, selectedSessions, onToggleSelect,
}: SessionListProps) {
  const { data, isLoading, error } = useAgentSessions(agentId, page, 20, showArchived);
  const [tagEditor, setTagEditor] = useState<{ sessionId: string; tags: string[] } | null>(null);
  const [noteEditor, setNoteEditor] = useState<{ sessionId: string; note: string } | null>(null);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="p-4 text-center text-status-red text-sm">Failed to load sessions</div>;

  const sessions = (data?.sessions || []) as EnrichedSessionFileMeta[];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
        <ScrollText size={24} className="mb-2 opacity-50" />
        <p className="text-sm">No sessions found</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        {sessions.map((s) => (
          <div
            key={s.sessionId}
            className={cn(
              'w-full text-left px-3 py-2.5 border-b border-border transition-colors group relative',
              selectedSessionId === s.sessionId
                ? 'bg-amber/10 border-l-2 border-l-amber'
                : 'hover:bg-card-hover',
              s.isArchived && 'opacity-50'
            )}
          >
            <div className="flex items-start gap-2">
              {bulkMode && (
                <input
                  type="checkbox"
                  checked={selectedSessions?.has(s.sessionId) || false}
                  onChange={() => onToggleSelect?.(s.sessionId)}
                  className="mt-1 shrink-0"
                />
              )}
              <button
                onClick={() => onSelect(s.sessionId)}
                className="flex-1 text-left min-w-0"
              >
                <div className="flex items-center gap-2">
                  <p className="text-xs font-mono text-text-secondary truncate">{s.sessionId.slice(0, 8)}...</p>
                  {s.isArchived && (
                    <span className="badge text-[10px] bg-text-secondary/10 text-text-secondary">
                      <Archive size={8} className="inline mr-0.5" />Archived
                    </span>
                  )}
                </div>
                {s.tags && s.tags.length > 0 && (
                  <div className="flex gap-1 mt-0.5">
                    {s.tags.map(t => (
                      <span key={t} className="badge text-[9px]">{t}</span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-text-secondary mt-0.5">
                  {s.timestamp ? formatDateTime(new Date(s.timestamp).getTime()) : 'Unknown date'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-text-secondary">{s.lineCount} lines</span>
                  <span className="text-[10px] text-text-secondary">
                    {s.sizeBytes > 1024 * 1024
                      ? `${(s.sizeBytes / (1024 * 1024)).toFixed(1)}MB`
                      : `${(s.sizeBytes / 1024).toFixed(0)}KB`}
                  </span>
                </div>
              </button>
              <SessionActions
                agentId={agentId}
                sessionId={s.sessionId}
                isArchived={s.isArchived || false}
                onEditTags={() => setTagEditor({ sessionId: s.sessionId, tags: s.tags || [] })}
                onEditNote={() => setNoteEditor({ sessionId: s.sessionId, note: s.note || '' })}
              />
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="shrink-0 flex items-center justify-between border-t border-border px-3 py-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-1 text-text-secondary hover:text-text-primary disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-[10px] text-text-secondary">{page} / {totalPages}</span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-1 text-text-secondary hover:text-text-primary disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {tagEditor && (
        <SessionTagEditor
          agentId={agentId}
          sessionId={tagEditor.sessionId}
          tags={tagEditor.tags}
          onClose={() => setTagEditor(null)}
        />
      )}
      {noteEditor && (
        <SessionNoteEditor
          agentId={agentId}
          sessionId={noteEditor.sessionId}
          note={noteEditor.note}
          onClose={() => setNoteEditor(null)}
        />
      )}
    </div>
  );
}
