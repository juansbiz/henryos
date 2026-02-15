import { useState } from 'react';
import { useAddSubPlan } from '../../hooks/usePlans';
import type { Plan } from '../../lib/types';
import { X, Plus, Trash2 } from 'lucide-react';

interface AddSubPlanDialogProps {
  plan: Plan;
  onClose: () => void;
}

const DEPARTMENTS = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'hq', label: 'HQ' },
];

const AGENTS = [
  { id: 'henry', name: 'Henry' },
  { id: 'elon', name: 'Elon' },
  { id: 'warren', name: 'Warren' },
  { id: 'hormozi', name: 'Hormozi' },
  { id: 'sales', name: 'Sales' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'tasks', name: 'Tasks' },
  { id: 'reviewer', name: 'Reviewer' },
  { id: 'scout', name: 'Scout' },
  { id: 'herald', name: 'Herald' },
  { id: 'quill', name: 'Quill' },
];

export function AddSubPlanDialog({ plan, onClose }: AddSubPlanDialogProps) {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('engineering');
  const [createdBy, setCreatedBy] = useState('elon');
  const [parentPhaseId, setParentPhaseId] = useState(plan.phases[0]?.id || '');
  const [tasks, setTasks] = useState<{ name: string; assignedTo: string }[]>([]);
  const addSubPlan = useAddSubPlan();

  const addTask = () => setTasks([...tasks, { name: '', assignedTo: 'sales' }]);
  const removeTask = (i: number) => setTasks(tasks.filter((_, idx) => idx !== i));

  const handleCreate = async () => {
    if (!title.trim() || !parentPhaseId) return;
    const creator = AGENTS.find(a => a.id === createdBy);
    try {
      await addSubPlan.mutateAsync({
        planId: plan.id,
        data: {
          title: title.trim(),
          createdBy,
          createdByName: creator?.name || createdBy,
          department,
          parentPhaseId,
          tasks: tasks.filter(t => t.name.trim()).map((t, i) => {
            const assignee = AGENTS.find(a => a.id === t.assignedTo);
            return {
              id: `task-${Date.now()}-${i}`,
              name: t.name.trim(),
              assignedTo: t.assignedTo,
              assignedToName: assignee?.name || t.assignedTo,
              status: 'pending' as const,
            };
          }),
        },
      });
      onClose();
    } catch (err) {
      console.error('Failed to add sub-plan:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add Sub-Plan</h3>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Engineering — Security Sprint" className="input" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">Department</label>
              <select value={department} onChange={e => setDepartment(e.target.value)} className="input text-sm">
                {DEPARTMENTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1.5">Created By</label>
              <select value={createdBy} onChange={e => setCreatedBy(e.target.value)} className="input text-sm">
                {AGENTS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-text-secondary mb-1.5">Phase</label>
            <select value={parentPhaseId} onChange={e => setParentPhaseId(e.target.value)} className="input text-sm">
              {plan.phases.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
            </select>
          </div>

          {/* Tasks */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-text-secondary">Tasks</label>
              <button onClick={addTask} className="text-xs text-amber hover:text-amber/80 flex items-center gap-1">
                <Plus size={12} /> Add Task
              </button>
            </div>
            <div className="space-y-2">
              {tasks.map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={t.name}
                    onChange={e => { const u = [...tasks]; u[i].name = e.target.value; setTasks(u); }}
                    placeholder="Task name"
                    className="input flex-1"
                  />
                  <select
                    value={t.assignedTo}
                    onChange={e => { const u = [...tasks]; u[i].assignedTo = e.target.value; setTasks(u); }}
                    className="input w-28 text-xs"
                  >
                    {AGENTS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                  <button onClick={() => removeTask(i)} className="text-text-secondary hover:text-status-red">
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
              disabled={!title.trim() || !parentPhaseId || addSubPlan.isPending}
              className="btn-primary"
            >
              {addSubPlan.isPending ? 'Adding...' : 'Add Sub-Plan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
