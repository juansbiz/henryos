import { useState } from 'react';
import { useNoteSession } from '../../hooks/useSessionArchive';
import { X } from 'lucide-react';

interface SessionNoteEditorProps {
  agentId: string;
  sessionId: string;
  note: string;
  onClose: () => void;
}

export function SessionNoteEditor({ agentId, sessionId, note: initialNote, onClose }: SessionNoteEditorProps) {
  const [note, setNote] = useState(initialNote);
  const noteMutation = useNoteSession();

  const handleSave = () => {
    noteMutation.mutate({ agentId, sessionId, note });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="card w-full max-w-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold">Session Note</h4>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X size={16} />
          </button>
        </div>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Add a note..."
          className="input min-h-[80px] resize-none text-sm w-full"
          rows={3}
        />
        <div className="flex justify-end gap-2 mt-3">
          <button onClick={onClose} className="btn-secondary text-xs">Cancel</button>
          <button onClick={handleSave} className="btn-primary text-xs">Save</button>
        </div>
      </div>
    </div>
  );
}
