import type { PlanSummary } from '../../lib/types';
import { ORG_HIERARCHY } from '../../lib/constants';
import type { OrgNode } from '../../lib/types';
import { cn } from '../../lib/utils';

function findNode(node: OrgNode, id: string): OrgNode | undefined {
  if (node.id === id) return node;
  for (const child of node.children || []) {
    const found = findNode(child, id);
    if (found) return found;
  }
}

const statusBadges: Record<string, string> = {
  active: 'bg-status-green/10 text-status-green',
  draft: 'bg-text-secondary/10 text-text-secondary',
  completed: 'bg-amber/10 text-amber',
  archived: 'bg-text-secondary/10 text-text-secondary opacity-60',
};

interface PlanListProps {
  plans: PlanSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function PlanList({ plans, selectedId, onSelect }: PlanListProps) {
  const active = plans.filter(p => p.status !== 'archived');
  const archived = plans.filter(p => p.status === 'archived');

  const renderPlan = (plan: PlanSummary) => {
    const creator = findNode(ORG_HIERARCHY, plan.createdBy);
    return (
      <button
        key={plan.id}
        onClick={() => onSelect(plan.id)}
        className={cn(
          'w-full text-left px-3 py-3 border-b border-border transition-colors',
          selectedId === plan.id
            ? 'bg-amber/10 border-l-2 border-l-amber'
            : 'hover:bg-card-hover'
        )}
      >
        <p className="text-sm font-medium truncate">{plan.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-text-secondary">
            {creator?.emoji} {creator?.name || plan.createdByName}
          </span>
          <span className={`badge text-[10px] ${statusBadges[plan.status] || ''}`}>{plan.status}</span>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex-1 h-1.5 bg-page rounded-full overflow-hidden">
            <div className="h-full bg-amber rounded-full" style={{ width: `${plan.progress}%` }} />
          </div>
          <span className="text-[10px] font-medium text-text-secondary">{plan.progress}%</span>
        </div>
        {plan.targetDate && (
          <p className="text-[10px] text-text-secondary mt-1">Target: {plan.targetDate}</p>
        )}
      </button>
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        {active.map(renderPlan)}
        {archived.length > 0 && (
          <>
            <div className="px-3 py-2 text-[10px] text-text-secondary uppercase tracking-wider border-b border-border bg-page">
              Archived
            </div>
            {archived.map(renderPlan)}
          </>
        )}
      </div>
    </div>
  );
}
