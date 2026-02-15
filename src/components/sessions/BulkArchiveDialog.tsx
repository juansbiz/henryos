import { useState } from 'react';
import { useBulkArchive } from '../../hooks/useSessionArchive';
import { X } from 'lucide-react';

interface BulkArchiveDialogProps {
  sessions: { agentId: string; sessionId: string }[];
  onClose: () => void;
}

export function BulkArchiveDialog({ sessions, onClose }: BulkArchiveDialogProps) {
  const [note, setNote] = useState('');
  const bulkMutation = useBulkArchive();

  const handleArchive = async () => {
    await bulkMutation.mutateAsync({ sessions, note: note.trim() || undefined });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="card w-full max-w-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold">Archive {sessions.length} Sessions</h4>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X size={16} />
          </button>
        </div>
        <p className="text-xs text-text-secondary mb-3">
          This will archive {sessions.length} selected session{sessions.length !== 1 ? 's' : ''}. You can unarchive them later.
        </p>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Optional note..."
          className="input min-h-[60px] resize-none text-sm w-full"
          rows={2}
        />
        <div className="flex justify-end gap-2 mt-3">
          <button onClick={onClose} className="btn-secondary text-xs">Cancel</button>
          <button
            onClick={handleArchive}
            disabled={bulkMutation.isPending}
            className="btn-primary text-xs"
          >
            {bulkMutation.isPending ? 'Archiving...' : 'Archive All'}
          </button>
        </div>
      </div>
    </div>
  );
}
