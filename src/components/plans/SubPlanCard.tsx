import { useState } from 'react';
import type { SubPlan, PlanTask } from '../../lib/types';
import { useUpdateTask } from '../../hooks/usePlans';
import { ORG_HIERARCHY } from '../../lib/constants';
import type { OrgNode } from '../../lib/types';
import { ChevronDown, ChevronRight, CheckCircle, Circle, Loader, AlertTriangle, Plus } from 'lucide-react';

function findNode(node: OrgNode, id: string): OrgNode | undefined {
  if (node.id === id) return node;
  for (const child of node.children || []) {
    const found = findNode(child, id);
    if (found) return found;
  }
}

const deptColors: Record<string, string> = {
  engineering: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  revenue: 'bg-green-500/10 text-green-400 border-green-500/20',
  marketing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  hq: 'bg-amber/10 text-amber border-amber/20',
};

const taskIcons: Record<PlanTask['status'], typeof CheckCircle> = {
  completed: CheckCircle,
  'in-progress': Loader,
  pending: Circle,
  blocked: AlertTriangle,
};

const taskColors: Record<PlanTask['status'], string> = {
  completed: 'text-status-green',
  'in-progress': 'text-amber',
  pending: 'text-text-secondary',
  blocked: 'text-status-red',
};

const nextStatus: Record<PlanTask['status'], PlanTask['status']> = {
  pending: 'in-progress',
  'in-progress': 'completed',
  completed: 'pending',
  blocked: 'in-progress',
};

interface SubPlanCardProps {
  subPlan: SubPlan;
  planId: string;
}

export function SubPlanCard({ subPlan, planId }: SubPlanCardProps) {
  const [expanded, setExpanded] = useState(true);
  const updateTask = useUpdateTask();
  const creator = findNode(ORG_HIERARCHY, subPlan.createdBy);
  const completedCount = subPlan.tasks.filter(t => t.status === 'completed').length;
  const progress = subPlan.tasks.length > 0 ? Math.round((completedCount / subPlan.tasks.length) * 100) : 0;
  const deptClass = deptColors[subPlan.department] || deptColors.hq;

  const handleToggleTask = (task: PlanTask) => {
    updateTask.mutate({
      planId,
      subId: subPlan.id,
      taskId: task.id,
      data: { status: nextStatus[task.status] },
    });
  };

  return (
    <div className="card p-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 text-left"
      >
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{subPlan.title}</span>
            <span className={`badge text-[10px] border ${deptClass}`}>{subPlan.department}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-text-secondary">
              {creator?.emoji} {creator?.name || subPlan.createdByName}
            </span>
            <div className="flex-1 max-w-[120px] h-1 bg-page rounded-full overflow-hidden">
              <div className="h-full bg-amber rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[10px] text-text-secondary">{progress}%</span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="mt-3 space-y-1 pl-5">
          {subPlan.tasks.map(task => {
            const Icon = taskIcons[task.status];
            const color = taskColors[task.status];
            const assignee = findNode(ORG_HIERARCHY, task.assignedTo);
            return (
              <div key={task.id} className="flex items-center gap-2 py-1 group">
                <button
                  onClick={() => handleToggleTask(task)}
                  className={`shrink-0 ${color} hover:opacity-70 transition-opacity`}
                  title={`Click to change status (${task.status})`}
                >
                  <Icon size={14} />
                </button>
                <span className={`text-xs flex-1 ${task.status === 'completed' ? 'line-through text-text-secondary' : ''}`}>
                  {task.name}
                </span>
                <span className="text-[10px] text-text-secondary">
                  {assignee?.emoji} {assignee?.name || task.assignedToName}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
