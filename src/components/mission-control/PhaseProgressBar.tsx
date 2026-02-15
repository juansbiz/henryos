import type { PhaseProgress } from '../../lib/types';
import { ORG_HIERARCHY } from '../../lib/constants';
import type { OrgNode } from '../../lib/types';

function findNode(node: OrgNode, id: string): OrgNode | undefined {
  if (node.id === id) return node;
  for (const child of node.children || []) {
    const found = findNode(child, id);
    if (found) return found;
  }
}

interface PhaseProgressBarProps {
  phase: PhaseProgress;
}

export function PhaseProgressBar({ phase }: PhaseProgressBarProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-base shrink-0 w-6 text-center">{phase.emoji}</span>
      <span className="text-sm font-medium w-36 truncate">{phase.name}</span>
      <div className="flex-1 h-2.5 bg-page rounded-full overflow-hidden">
        <div
          className="h-full bg-amber rounded-full transition-all duration-500"
          style={{ width: `${phase.progress}%` }}
        />
      </div>
      <span className="text-xs font-medium text-text-secondary w-10 text-right">{phase.progress}%</span>
      <div className="flex -space-x-1.5 shrink-0">
        {phase.agents.slice(0, 4).map(id => {
          const node = findNode(ORG_HIERARCHY, id);
          return (
            <div
              key={id}
              className="h-5 w-5 rounded-full bg-card-hover border border-card flex items-center justify-center text-[10px]"
              title={node?.name || id}
            >
              {node?.emoji || id.charAt(0).toUpperCase()}
            </div>
          );
        })}
      </div>
      <span className="text-[10px] text-text-secondary w-16 text-right">
        {phase.completedCount}/{phase.taskCount}
      </span>
    </div>
  );
}
