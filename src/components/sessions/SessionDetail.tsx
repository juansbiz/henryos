import { useState } from 'react';
import { useSessionDetail } from '../../hooks/useSessionDetail';
import { SessionEvent } from './SessionEvent';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { formatDateTime } from '../../lib/utils';
import { DollarSign, MessageSquare, Wrench, Hash, Archive, ArchiveRestore, Tag, FileText } from 'lucide-react';
import { useArchiveSession, useUnarchiveSession } from '../../hooks/useSessionArchive';
import { SessionTagEditor } from './SessionTagEditor';
import { SessionNoteEditor } from './SessionNoteEditor';

interface SessionDetailProps {
  agentId: string;
  sessionId: string;
}

function formatCost(cost: number): string {
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  return `$${cost.toFixed(2)}`;
}

function formatTokenCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function SessionDetail({ agentId, sessionId }: SessionDetailProps) {
  const { data, isLoading, error } = useSessionDetail(agentId, sessionId);
  const archiveMutation = useArchiveSession();
  const unarchiveMutation = useUnarchiveSession();
  const [showTags, setShowTags] = useState(false);
  const [showNote, setShowNote] = useState(false);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="p-8 text-center text-status-red text-sm">Failed to load session</div>;
  if (!data) return null;

  const { session, events, totals, eventCount } = data;
  const meta = (data as any).archiveMeta;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold truncate">{sessionId}</p>
            {session?.timestamp && (
              <p className="text-xs text-text-secondary">{formatDateTime(new Date(session.timestamp).getTime())}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {meta?.isArchived ? (
              <button
                onClick={() => unarchiveMutation.mutate({ agentId, sessionId })}
                className="btn-secondary text-[10px] px-2 py-1 flex items-center gap-1"
              >
                <ArchiveRestore size={11} /> Unarchive
              </button>
            ) : (
              <button
                onClick={() => archiveMutation.mutate({ agentId, sessionId })}
                className="btn-secondary text-[10px] px-2 py-1 flex items-center gap-1"
              >
                <Archive size={11} /> Archive
              </button>
            )}
            <button
              onClick={() => setShowTags(true)}
              className="btn-secondary text-[10px] px-2 py-1 flex items-center gap-1"
            >
              <Tag size={11} /> Tags
            </button>
            <button
              onClick={() => setShowNote(true)}
              className="btn-secondary text-[10px] px-2 py-1 flex items-center gap-1"
            >
              <FileText size={11} /> Note
            </button>
          </div>
        </div>

        {/* Tags + Note display */}
        {meta?.tags?.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {meta.tags.map((t: string) => (
              <span key={t} className="badge text-[10px]">{t}</span>
            ))}
          </div>
        )}
        {meta?.note && (
          <p className="text-xs text-text-secondary italic">{meta.note}</p>
        )}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="flex items-center gap-1.5 text-xs">
            <DollarSign size={12} className="text-amber" />
            <span className="text-text-secondary">Cost:</span>
            <span className="font-medium">{formatCost(totals.totalCost)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Hash size={12} className="text-status-green" />
            <span className="text-text-secondary">Tokens:</span>
            <span className="font-medium">{formatTokenCount(totals.totalTokens)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <MessageSquare size={12} className="text-status-yellow" />
            <span className="text-text-secondary">Messages:</span>
            <span className="font-medium">{totals.messageCount}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Wrench size={12} className="text-text-secondary" />
            <span className="text-text-secondary">Tools:</span>
            <span className="font-medium">{totals.toolCallCount}</span>
          </div>
        </div>
      </div>

      {/* Events */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {events.map((event) => (
          <SessionEvent key={event.id} event={event} />
        ))}
        {eventCount > events.length && (
          <p className="text-center text-xs text-text-secondary py-2">
            Showing {events.length} of {eventCount} events
          </p>
        )}
      </div>

      {showTags && (
        <SessionTagEditor
          agentId={agentId}
          sessionId={sessionId}
          tags={meta?.tags || []}
          onClose={() => setShowTags(false)}
        />
      )}
      {showNote && (
        <SessionNoteEditor
          agentId={agentId}
          sessionId={sessionId}
          note={meta?.note || ''}
          onClose={() => setShowNote(false)}
        />
      )}
    </div>
  );
}
