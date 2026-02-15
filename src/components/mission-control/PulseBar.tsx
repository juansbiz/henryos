import type { MissionControlData } from '../../lib/types';
import { Activity, Users, AlertTriangle, TrendingUp, AlertCircle } from 'lucide-react';

interface PulseBarProps {
  data: MissionControlData;
}

const healthColors = {
  green: 'text-status-green',
  yellow: 'text-status-yellow',
  red: 'text-status-red',
};

export function PulseBar({ data }: PulseBarProps) {
  const ceoBlockers = data.blockers.filter(b => b.requiresCeo).length;

  const pills = [
    {
      label: 'Health',
      value: data.overallHealth.toUpperCase(),
      icon: Activity,
      className: healthColors[data.overallHealth],
    },
    {
      label: 'Active',
      value: String(data.activeAgents),
      icon: Users,
      className: 'text-status-green',
    },
    {
      label: 'Blocked',
      value: String(data.blockedAgents),
      icon: AlertTriangle,
      className: data.blockedAgents > 0 ? 'text-status-red' : 'text-text-secondary',
    },
    {
      label: 'Plan',
      value: `${data.planProgress}%`,
      icon: TrendingUp,
      className: 'text-amber',
    },
    {
      label: 'CEO Items',
      value: String(ceoBlockers),
      icon: AlertCircle,
      className: ceoBlockers > 0 ? 'text-status-red' : 'text-text-secondary',
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {pills.map((pill) => (
        <div
          key={pill.label}
          className="card flex items-center gap-2 px-3 py-2 min-w-[120px]"
        >
          <pill.icon size={14} className={pill.className} />
          <div>
            <p className="text-[10px] text-text-secondary uppercase tracking-wider">{pill.label}</p>
            <p className={`text-sm font-semibold ${pill.className}`}>{pill.value}</p>
          </div>
        </div>
      ))}
      {data.currentPhase && (
        <div className="card flex items-center gap-2 px-3 py-2">
          <div>
            <p className="text-[10px] text-text-secondary uppercase tracking-wider">Phase</p>
            <p className="text-sm font-medium">{data.currentPhase}</p>
          </div>
        </div>
      )}
    </div>
  );
}
