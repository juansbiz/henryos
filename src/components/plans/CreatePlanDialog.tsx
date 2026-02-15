import { useState } from 'react';
import { useCreatePlan } from '../../hooks/usePlans';
import { X, Plus, Trash2 } from 'lucide-react';

interface CreatePlanDialogProps {
  onClose: () => void;
  onCreated: (id: string) => void;
}

export function CreatePlanDialog({ onClose, onCreated }: CreatePlanDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [phases, setPhases] = useState<{ name: string; emoji: string; priority: string }[]>([]);
  const createMutation = useCreatePlan();

  const addPhase = () => {
    setPhases([...phases, { name: '', emoji: '', priority: 'medium' }]);
  };

  const removePhase = (i: number) => {
    setPhases(phases.filter((_, idx) => idx !== i));
  };

  const updatePhase = (i: number, field: string, value: string) => {
    const updated = [...phases];
    (updated[i] as any)[field] = value;
    setPhases(updated);
  };

  const handleCreate = async () => {
    if (!title.trim() || !description.trim() || !targetDate) return;
    try {
      const result = await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        targetDate,
        phases: phases.filter(p => p.name.trim()).map((p, i) => ({
          id: `phase-${Date.now()}-${i}`,
          name: p.name.trim(),
          emoji: p.emoji || '',
          status: 'draft' as const,
          priority: p.priority as any,
        })),
        createdBy: 'ceo',
        createdByName: 'CEO',
      });
      onCreated(result.id);
    } catch (err) {
      console.error('Failed to create plan:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">New Plan</h3>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="V5.0 — Ship or Die" className="input" />
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What's the goal?" className="input min-h-[60px] resize-none" rows={2} />
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Target Date</label>
            <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="input" />
          </div>

          {/* Phases */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-text-secondary">Phases (optional)</label>
              <button onClick={addPhase} className="text-xs text-amber hover:text-amber/80 flex items-center gap-1">
                <Plus size={12} /> Add Phase
              </button>
            </div>
            <div className="space-y-2">
              {phases.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={p.emoji}
                    onChange={e => updatePhase(i, 'emoji', e.target.value)}
                    placeholder="emoji"
                    className="input w-14 text-center"
                  />
                  <input
                    value={p.name}
                    onChange={e => updatePhase(i, 'name', e.target.value)}
                    placeholder="Phase name"
                    className="input flex-1"
                  />
                  <select
                    value={p.priority}
                    onChange={e => updatePhase(i, 'priority', e.target.value)}
                    className="input w-24 text-xs"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  <button onClick={() => removePhase(i)} className="text-text-secondary hover:text-status-red">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="btn-secondary">Cancel</button>
            <button
              onClick={handleCreate}
              disabled={!title.trim() || !description.trim() || !targetDate || createMutation.isPending}
              className="btn-primary"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Plan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
