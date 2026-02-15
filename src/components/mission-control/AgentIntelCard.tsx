import type { AgentIntelligence, ActivityStatus } from '../../lib/types';
import { ActivitySparkline } from './ActivitySparkline';
import { AlertTriangle } from 'lucide-react';
import { timeAgo } from '../../lib/utils';

interface AgentIntelCardProps {
  agent: AgentIntelligence;
  onClick: () => void;
}

const statusConfig: Record<ActivityStatus, { label: string; dot: string; bg: string }> = {
  executing: { label: 'Executing', dot: 'bg-status-green animate-pulse', bg: 'border-status-green/30' },
  blocked: { label: 'Blocked', dot: 'bg-status-red', bg: 'border-status-red/30' },
  waiting: { label: 'Waiting', dot: 'bg-status-yellow', bg: 'border-border' },
  idle: { label: 'Idle', dot: 'bg-text-secondary', bg: 'border-border' },
  offline: { label: 'Offline', dot: 'bg-text-secondary/50', bg: 'border-border opacity-60' },
  error: { label: 'Error', dot: 'bg-status-red animate-pulse', bg: 'border-status-red/30' },
};

export function AgentIntelCard({ agent, onClick }: AgentIntelCardProps) {
  const status = statusConfig[agent.activityStatus];

  return (
    <button
      onClick={onClick}
      className={`card-hover text-left p-4 min-w-[240px] border-l-2 ${status.bg} transition-all`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-base">{agent.emoji}</span>
          <span className="text-sm font-semibold">{agent.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${status.dot}`} />
          <span className="text-[10px] text-text-secondary">{status.label}</span>
        </div>
      </div>

      {/* Doing */}
      {agent.doing && (
        <div className="mb-2">
          <p className="text-[10px] text-text-secondary uppercase tracking-wider">Doing</p>
          <p className="text-xs text-text-primary leading-snug line-clamp-2">{agent.doing}</p>
          {agent.doingTimestamp && (
            <p className="text-[10px] text-text-secondary mt-0.5">{timeAgo(agent.doingTimestamp)}</p>
          )}
        </div>
      )}

      {/* Plan context */}
      {agent.planContext && (
        <div className="mb-2">
          <div className="flex items-center gap-1">
            <p className="text-[10px] text-text-secondary uppercase tracking-wider">Plan</p>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs">{agent.planContext.phaseEmoji} {agent.planContext.phaseName}</span>
            <div className="flex-1 h-1.5 bg-page rounded-full overflow-hidden">
              <div
                className="h-full bg-amber rounded-full"
                style={{ width: `${agent.planContext.progress}%` }}
              />
            </div>
            <span className="text-[10px] font-medium text-amber">{agent.planContext.progress}%</span>
          </div>
        </div>
      )}

      {/* Blockers */}
      {agent.blockers.length > 0 && (
        <div className="flex items-center gap-1 mb-2 text-status-red">
          <AlertTriangle size={11} />
          <span className="text-[10px] font-medium">{agent.blockers.length} blocker{agent.blockers.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Sparkline + runs */}
      <div className="flex items-center justify-between mt-1">
        <ActivitySparkline data={agent.activitySparkline} width={80} height={18} />
        <span className="text-[10px] text-text-secondary">{agent.runsToday} runs today</span>
      </div>
    </button>
  );
}
