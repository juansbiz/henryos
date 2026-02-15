import type { BlockerAlert } from '../../lib/types';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { ORG_HIERARCHY } from '../../lib/constants';
import type { OrgNode } from '../../lib/types';

function findNode(node: OrgNode, id: string): OrgNode | undefined {
  if (node.id === id) return node;
  for (const child of node.children || []) {
    const found = findNode(child, id);
    if (found) return found;
  }
}

interface BlockerPanelProps {
  blockers: BlockerAlert[];
}

export function BlockerPanel({ blockers }: BlockerPanelProps) {
  if (blockers.length === 0) {
    return (
      <div className="card p-4">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Blockers</h3>
        <p className="text-sm text-text-secondary">No active blockers</p>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
        Blockers ({blockers.length})
      </h3>
      <div className="space-y-2">
        {blockers.map((b, i) => {
          const reporter = findNode(ORG_HIERARCHY, b.reportedBy);
          return (
            <div
              key={i}
              className={`rounded-lg px-3 py-2.5 text-xs ${
                b.requiresCeo
                  ? 'bg-status-red/10 border-l-2 border-status-red'
                  : 'bg-status-yellow/10 border-l-2 border-status-yellow'
              }`}
            >
              <div className="flex items-start gap-2">
                {b.severity === 'critical' ? (
                  <AlertCircle size={12} className="text-status-red mt-0.5 shrink-0" />
                ) : (
                  <AlertTriangle size={12} className="text-status-yellow mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="font-medium">{b.summary}</p>
                  <p className="text-text-secondary mt-0.5">
                    {reporter?.emoji} {reporter?.name || b.reportedBy}
                    {b.requiresCeo && <span className="ml-2 text-status-red font-semibold">CEO ACTION</span>}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
