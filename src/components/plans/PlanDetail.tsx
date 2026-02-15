import { usePlan } from '../../hooks/usePlans';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { SubPlanCard } from './SubPlanCard';
import { PlanChangelog } from './PlanChangelog';
import { ORG_HIERARCHY } from '../../lib/constants';
import type { OrgNode } from '../../lib/types';
import { formatDate } from '../../lib/utils';
import { Map } from 'lucide-react';

function findNode(node: OrgNode, id: string): OrgNode | undefined {
  if (node.id === id) return node;
  for (const child of node.children || []) {
    const found = findNode(child, id);
    if (found) return found;
  }
}

interface PlanDetailProps {
  planId: string;
  onAddSubPlan: () => void;
}

export function PlanDetail({ planId, onAddSubPlan }: PlanDetailProps) {
  const { data: plan, isLoading, error } = usePlan(planId);

  if (isLoading) return <LoadingSpinner />;
  if (error || !plan) return <div className="p-8 text-center text-status-red text-sm">Failed to load plan</div>;

  const creator = findNode(ORG_HIERARCHY, plan.createdBy);
  const progress = plan.progress;

  return (
    <div className="flex h-full flex-col overflow-y-auto p-4 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">{plan.title}</h2>
        <div className="flex items-center gap-3 mt-1 text-xs text-text-secondary">
          <span>{creator?.emoji} {creator?.name || plan.createdByName}</span>
          <span>&middot;</span>
          <span>{formatDate(plan.createdAt)}</span>
          <span>&middot;</span>
          <span>Target: {plan.targetDate}</span>
          <span className="badge text-[10px] bg-status-green/10 text-status-green">{plan.status}</span>
        </div>
        <p className="text-sm text-text-secondary mt-2">{plan.description}</p>
      </div>

      {/* Overall progress */}
      {progress && (
        <div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2.5 bg-page rounded-full overflow-hidden">
              <div className="h-full bg-amber rounded-full transition-all" style={{ width: `${progress.progress}%` }} />
            </div>
            <span className="text-sm font-semibold text-amber">{progress.progress}%</span>
          </div>
          <p className="text-[10px] text-text-secondary mt-0.5">
            {progress.completed}/{progress.total} tasks completed
            {progress.blocked > 0 && <span className="text-status-red"> &middot; {progress.blocked} blocked</span>}
          </p>
        </div>
      )}

      {/* Phases */}
      {plan.phases.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Phases</h3>
          <div className="space-y-2">
            {plan.phases.map(phase => {
              const phaseSubs = plan.subPlans.filter(sp => sp.parentPhaseId === phase.id);
              const phaseTasks = phaseSubs.flatMap(sp => sp.tasks);
              const completed = phaseTasks.filter(t => t.status === 'completed').length;
              const total = phaseTasks.length;
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
              return (
                <div key={phase.id} className="flex items-center gap-3">
                  <span className="text-base w-6 text-center">{phase.emoji}</span>
                  <span className="text-sm font-medium w-32 truncate">{phase.name}</span>
                  <div className="flex-1 h-1.5 bg-page rounded-full overflow-hidden">
                    <div className="h-full bg-amber rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-text-secondary w-10 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-plans */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Sub-Plans</h3>
          <button onClick={onAddSubPlan} className="btn-secondary text-[10px] px-2 py-1">+ Add Sub-Plan</button>
        </div>
        <div className="space-y-3">
          {plan.subPlans.map(sp => (
            <SubPlanCard key={sp.id} subPlan={sp} planId={plan.id} />
          ))}
          {plan.subPlans.length === 0 && (
            <p className="text-sm text-text-secondary">No sub-plans yet</p>
          )}
        </div>
      </div>

      {/* Changelog */}
      {plan.changelog.length > 0 && (
        <PlanChangelog entries={plan.changelog} />
      )}
    </div>
  );
}
