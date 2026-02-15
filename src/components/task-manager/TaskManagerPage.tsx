import { StatsCards } from './StatsCards';
import { CostOverview } from './CostOverview';
import { ActivityFeed } from './ActivityFeed';
import { ModelFleetGrid } from './ModelFleetGrid';
import { CronMonitor } from './CronMonitor';

export function TaskManagerPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <StatsCards />
      <CostOverview />
      <ActivityFeed />
      <div className="grid grid-cols-1 gap-4 md:gap-6 xl:grid-cols-2">
        <ModelFleetGrid />
        <CronMonitor />
      </div>
    </div>
  );
}
