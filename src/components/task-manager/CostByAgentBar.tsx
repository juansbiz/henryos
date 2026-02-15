import { ORG_HIERARCHY } from '../../lib/constants';
import type { OrgNode } from '../../lib/types';

function findNode(node: OrgNode, id: string): OrgNode | undefined {
  if (node.id === id) return node;
  for (const child of node.children || []) {
    const found = findNode(child, id);
    if (found) return found;
  }
}

interface CostByAgentBarProps {
  byAgent: Record<string, { cost: number; tokens: number; sessions: number }>;
}

export function CostByAgentBar({ byAgent }: CostByAgentBarProps) {
  const entries = Object.entries(byAgent)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.cost - a.cost);

  const maxCost = entries[0]?.cost || 1;

  return (
    <div className="space-y-2">
      {entries.map(({ id, cost, tokens, sessions }) => {
        const node = findNode(ORG_HIERARCHY, id);
        const name = node?.name || id;
        const emoji = node?.emoji || '';
        const pct = (cost / maxCost) * 100;

        return (
          <div key={id} className="flex items-center gap-3">
            <div className="w-24 shrink-0 flex items-center gap-1.5">
              {emoji && <span className="text-sm">{emoji}</span>}
              <span className="text-xs font-medium truncate">{name}</span>
            </div>
            <div className="flex-1 h-5 bg-page rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-amber/30 transition-all duration-500"
                style={{ width: `${Math.max(pct, 2)}%` }}
              />
            </div>
            <span className="w-16 text-right text-xs font-mono text-text-secondary">
              ${cost.toFixed(2)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
