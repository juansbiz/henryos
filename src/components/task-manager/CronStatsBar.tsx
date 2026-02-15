import { useCronStats } from '../../hooks/useCronRuns';
import { Timer, CheckCircle2, BarChart3 } from 'lucide-react';

export function CronStatsBar() {
  const { data } = useCronStats();

  if (!data) return null;

  return (
    <div className="grid grid-cols-3 gap-2 mb-3">
      <div className="flex items-center gap-1.5 rounded-lg bg-page px-2.5 py-2">
        <BarChart3 size={12} className="text-text-secondary" />
        <span className="text-[10px] text-text-secondary">Runs:</span>
        <span className="text-xs font-medium">{data.totalRuns}</span>
      </div>
      <div className="flex items-center gap-1.5 rounded-lg bg-page px-2.5 py-2">
        <CheckCircle2 size={12} className="text-status-green" />
        <span className="text-[10px] text-text-secondary">Success:</span>
        <span className="text-xs font-medium">{data.overallSuccessRate}%</span>
      </div>
      <div className="flex items-center gap-1.5 rounded-lg bg-page px-2.5 py-2">
        <Timer size={12} className="text-text-secondary" />
        <span className="text-[10px] text-text-secondary">Avg:</span>
        <span className="text-xs font-medium">
          {data.avgDurationMs > 60000
            ? `${(data.avgDurationMs / 60000).toFixed(1)}m`
            : `${(data.avgDurationMs / 1000).toFixed(1)}s`}
        </span>
      </div>
    </div>
  );
}
