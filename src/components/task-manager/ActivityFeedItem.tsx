import { useNavigate } from 'react-router-dom';
import { AgentAvatar } from '../shared/AgentAvatar';
import { timeAgo, truncate } from '../../lib/utils';
import { SESSION_CATEGORIES, MODEL_TIERS } from '../../lib/constants';
import { ORG_HIERARCHY } from '../../lib/constants';
import { ChevronRight } from 'lucide-react';
import { useMissionControl } from '../../hooks/useMissionControl';
import type { SessionEntry, OrgNode } from '../../lib/types';

function findNode(node: OrgNode, id: string): OrgNode | undefined {
  if (node.id === id) return node;
  for (const child of node.children || []) {
    const found = findNode(child, id);
    if (found) return found;
  }
}

function formatTokens(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

interface ActivityFeedItemProps {
  session: SessionEntry;
}

export function ActivityFeedItem({ session }: ActivityFeedItemProps) {
  const navigate = useNavigate();
  const node = findNode(ORG_HIERARCHY, session.agentId);
  const agentName = node?.name || session.agentId;
  const emoji = node?.emoji;
  const cat = SESSION_CATEGORIES[session.category];
  const modelInfo = MODEL_TIERS[session.model] || session.model
    ? MODEL_TIERS[session.model] || { label: session.model.split('/').pop() || session.model, color: '#888' }
    : null;
  const { data: missionData } = useMissionControl();
  const agentIntel = missionData?.agents.find(a => a.id === session.agentId);

  const isRecent = Date.now() - session.updatedAt < 60 * 1000;

  return (
    <button
      onClick={() => navigate('/sessions')}
      className="w-full text-left flex items-center justify-between rounded-lg bg-page px-3 py-2.5 gap-3 transition-colors hover:bg-card-hover group cursor-pointer"
    >
      <div className="flex items-center gap-3 min-w-0">
        <AgentAvatar name={agentName} model={session.model} size="sm" emoji={emoji} />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{agentName}</span>
            {isRecent && (
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-status-green animate-pulse" />
            )}
            <span className={cat?.badgeClass || 'badge'}>{cat?.label || session.category}</span>
          </div>
          <p className="text-xs text-text-secondary truncate">
            {truncate(session.displayName, 60)}
          </p>
          {agentIntel?.planContext && (
            <p className="text-[10px] text-amber truncate mt-0.5">
              Plan: {agentIntel.planContext.phaseEmoji} {agentIntel.planContext.phaseName} {agentIntel.planContext.progress}%
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0 text-right">
        <div className="hidden sm:block">
          <p className="text-xs text-text-secondary">{formatTokens(session.totalTokens)} tokens</p>
          {modelInfo && (
            <p className="text-[10px] font-medium" style={{ color: modelInfo.color }}>
              {modelInfo.label}
            </p>
          )}
        </div>
        <span className="text-xs text-text-secondary whitespace-nowrap">
          {timeAgo(session.updatedAt)}
        </span>
        <ChevronRight size={14} className="text-text-secondary/0 group-hover:text-text-secondary transition-colors" />
      </div>
    </button>
  );
}
