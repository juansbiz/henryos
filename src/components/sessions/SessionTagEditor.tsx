import { useState } from 'react';
import { useTagSession } from '../../hooks/useSessionArchive';
import { X } from 'lucide-react';

interface SessionTagEditorProps {
  agentId: string;
  sessionId: string;
  tags: string[];
  onClose: () => void;
}

export function SessionTagEditor({ agentId, sessionId, tags: initialTags, onClose }: SessionTagEditorProps) {
  const [tags, setTags] = useState(initialTags);
  const [input, setInput] = useState('');
  const tagMutation = useTagSession();

  const addTag = () => {
    const tag = input.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      const next = [...tags, tag];
      setTags(next);
      tagMutation.mutate({ agentId, sessionId, tags: next });
    }
    setInput('');
  };

  const removeTag = (tag: string) => {
    const next = tags.filter(t => t !== tag);
    setTags(next);
    tagMutation.mutate({ agentId, sessionId, tags: next });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="card w-full max-w-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold">Edit Tags</h4>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X size={16} />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3 min-h-[28px]">
          {tags.map(tag => (
            <span key={tag} className="badge flex items-center gap-1 text-[10px]">
              {tag}
              <button onClick={() => removeTag(tag)} className="hover:text-status-red">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addTag(); }}
            placeholder="Add tag..."
            className="input flex-1 text-sm"
          />
          <button onClick={addTag} className="btn-primary text-xs px-3">Add</button>
        </div>
      </div>
    </div>
  );
}
