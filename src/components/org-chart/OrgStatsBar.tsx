import { useAgents } from '../../hooks/useAgents';
import { useAgentStatus } from '../../hooks/useAgentStatus';
import { ORG_HIERARCHY } from '../../lib/constants';

function countNodes(node: any): number {
  let count = 1;
  if (node.children) {
    for (const child of node.children) {
      count += countNodes(child);
    }
  }
  return count;
}

export function OrgStatsBar() {
  const { data: agents } = useAgents();
  const { data: statuses } = useAgentStatus();
  const totalInOrg = countNodes(ORG_HIERARCHY);
  const registered = agents?.length || 0;

  const activeCount = statuses?.filter(s => s.status === 'active').length || 0;
  const idleCount = statuses?.filter(s => s.status === 'idle').length || 0;
  const errorCount = statuses?.filter(s => s.status === 'error').length || 0;

  const stats = [
    { label: 'Active', value: activeCount, color: 'text-status-green' },
    { label: 'Idle', value: idleCount, color: 'text-status-yellow' },
    { label: 'Errors', value: errorCount, color: errorCount > 0 ? 'text-status-red' : undefined },
    { label: 'Registered', value: registered },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map(({ label, value, color }) => (
        <div key={label} className="card p-4">
          <p className="text-xs text-text-secondary">{label}</p>
          <p className={`mt-1 text-2xl font-semibold ${color || ''}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}
