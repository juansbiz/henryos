import { useNavigate } from 'react-router-dom';
import * as Tooltip from '@radix-ui/react-tooltip';
import { AgentAvatar } from '../shared/AgentAvatar';
import { MODEL_TIERS } from '../../lib/constants';
import { useAgentStatus } from '../../hooks/useAgentStatus';
import { useMissionControl } from '../../hooks/useMissionControl';
import type { OrgNode as OrgNodeType, AgentLiveStatus } from '../../lib/types';

interface OrgNodeProps {
  node: OrgNodeType;
}

const statusColors: Record<AgentLiveStatus, string> = {
  active: 'bg-status-green',
  idle: 'bg-status-yellow',
  error: 'bg-status-red',
  offline: 'bg-text-secondary',
};

export function OrgNode({ node }: OrgNodeProps) {
  const navigate = useNavigate();
  const { data: statuses } = useAgentStatus();
  const { data: missionData } = useMissionControl();
  const modelInfo = MODEL_TIERS[node.model];
  const agentStatus = statuses?.find(s => s.id === node.id);
  const agentIntel = missionData?.agents.find(a => a.id === node.id);

  const tierStyles = {
    orchestrator: 'border-amber ring-1 ring-amber/20',
    chief: 'border-amber/50',
    agent: 'border-border',
  };

  const tooltipContent = agentIntel ? (
    <div className="max-w-[220px] space-y-1">
      {agentIntel.doing && (
        <div>
          <p className="text-[10px] text-text-secondary uppercase">Doing</p>
          <p className="text-xs">{agentIntel.doing}</p>
        </div>
      )}
      {agentIntel.planContext && (
        <div>
          <p className="text-[10px] text-text-secondary uppercase">Plan</p>
          <p className="text-xs">{agentIntel.planContext.phaseEmoji} {agentIntel.planContext.phaseName} — {agentIntel.planContext.progress}%</p>
        </div>
      )}
      {!agentIntel.doing && !agentIntel.planContext && (
        <p className="text-xs text-text-secondary">No recent activity</p>
      )}
    </div>
  ) : null;

  const card = (
    <button
      onClick={() => navigate('/workspaces')}
      className={`card-hover relative flex flex-col items-center gap-2 px-5 py-4 min-w-[140px] ${tierStyles[node.tier]}`}
    >
      {agentStatus && (
        <span
          className={`absolute top-2 right-2 h-2.5 w-2.5 rounded-full ${statusColors[agentStatus.status]}${
            agentStatus.status === 'active' ? ' animate-pulse' : ''
          }`}
        />
      )}
      <AgentAvatar name={node.name} model={node.model} emoji={node.emoji} size="md" />
      <div className="text-center">
        <p className="text-sm font-semibold">{node.name}</p>
        <p className="text-[11px] text-text-secondary leading-tight">{node.role}</p>
      </div>
      {modelInfo && (
        <span
          className="badge text-[10px]"
          style={{ backgroundColor: `${modelInfo.color}15`, color: modelInfo.color }}
        >
          {modelInfo.label}
        </span>
      )}
    </button>
  );

  if (!tooltipContent) return card;

  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          {card}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="z-50 rounded-lg border border-border bg-card p-3 shadow-lg"
            sideOffset={8}
          >
            {tooltipContent}
            <Tooltip.Arrow className="fill-card" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
