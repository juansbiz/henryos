import { useMissionControl } from '../../hooks/useMissionControl';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { PulseBar } from './PulseBar';
import { PhaseSwimlane } from './PhaseSwimlane';
import { AgentIntelGrid } from './AgentIntelGrid';
import { BlockerPanel } from './BlockerPanel';
import { LiveTicker } from './LiveTicker';
import { Radar } from 'lucide-react';

export function MissionControlPage() {
  const { data, isLoading, error } = useMissionControl();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="p-8 text-center text-status-red text-sm">Failed to load mission data</div>;
  if (!data) return null;

  return (
    <div className="space-y-4 p-1">
      {/* Pulse Bar */}
      <PulseBar data={data} />

      {/* Phase Swimlane */}
      {data.phases.length > 0 && (
        <PhaseSwimlane phases={data.phases} planTitle="V5.0 Progress" />
      )}

      {/* Agent Intel Grid */}
      <AgentIntelGrid agents={data.agents} />

      {/* Bottom: Blockers + Ticker side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BlockerPanel blockers={data.blockers} />
        <LiveTicker events={data.ticker} />
      </div>
    </div>
  );
}
