import type { ChangelogEntry } from '../../lib/types';
import { ORG_HIERARCHY } from '../../lib/constants';
import type { OrgNode } from '../../lib/types';
import { formatDateTime } from '../../lib/utils';

function findNode(node: OrgNode, id: string): OrgNode | undefined {
  if (node.id === id) return node;
  for (const child of node.children || []) {
    const found = findNode(child, id);
    if (found) return found;
  }
}

interface PlanChangelogProps {
  entries: ChangelogEntry[];
}

export function PlanChangelog({ entries }: PlanChangelogProps) {
  const sorted = [...entries].sort((a, b) => b.ts - a.ts);

  return (
    <div>
      <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Changelog</h4>
      <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
        {sorted.map((entry, i) => {
          const agent = findNode(ORG_HIERARCHY, entry.by);
          return (
            <div key={i} className="flex items-start gap-2 text-xs py-1">
              <span className="shrink-0 w-5 text-center">{agent?.emoji || entry.by.charAt(0).toUpperCase()}</span>
              <span className="text-text-secondary shrink-0">{formatDateTime(entry.ts)}</span>
              <span className="flex-1">{entry.action}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
