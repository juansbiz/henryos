import * as Dialog from '@radix-ui/react-dialog';
import type { AgentIntelligence } from '../../lib/types';
import { ActivitySparkline } from './ActivitySparkline';
import { X, CheckCircle, Circle, AlertTriangle, Target } from 'lucide-react';
import { timeAgo } from '../../lib/utils';

interface AgentIntelDetailProps {
  agent: AgentIntelligence;
  onClose: () => void;
}

export function AgentIntelDetail({ agent, onClose }: AgentIntelDetailProps) {
  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="fixed inset-y-4 right-4 z-50 w-full max-w-md card overflow-y-auto p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{agent.emoji}</span>
              <div>
                <Dialog.Title className="text-lg font-semibold">{agent.name}</Dialog.Title>
                <p className="text-xs text-text-secondary capitalize">{agent.department}</p>
              </div>
            </div>
            <Dialog.Close asChild>
              <button className="text-text-secondary hover:text-text-primary">
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          {/* Status + Doing */}
          <div className="space-y-4">
            {agent.doing && (
              <div>
                <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Currently Doing</h4>
                <p className="text-sm">{agent.doing}</p>
                {agent.doingTimestamp && (
                  <p className="text-[10px] text-text-secondary mt-0.5">{timeAgo(agent.doingTimestamp)}</p>
                )}
              </div>
            )}

            {/* Plan context */}
            {agent.planContext && (
              <div>
                <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Plan Assignment</h4>
                <div className="card p-3 space-y-1">
                  <p className="text-sm font-medium">{agent.planContext.planTitle}</p>
                  <p className="text-xs text-text-secondary">
                    {agent.planContext.phaseEmoji} {agent.planContext.phaseName} &middot; {agent.planContext.subPlanTitle}
                  </p>
                  <div className="flex items-center gap-2">
                    <Target size={12} className="text-amber" />
                    <span className="text-xs">{agent.planContext.taskName}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-page rounded-full overflow-hidden">
                      <div className="h-full bg-amber rounded-full" style={{ width: `${agent.planContext.progress}%` }} />
                    </div>
                    <span className="text-xs font-medium text-amber">{agent.planContext.progress}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Active goals */}
            {agent.activeGoals.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Active Goals</h4>
                <ul className="space-y-1">
                  {agent.activeGoals.map((g, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs">
                      <Circle size={12} className="text-text-secondary mt-0.5 shrink-0" />
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Completed goals */}
            {agent.completedGoals.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Completed</h4>
                <ul className="space-y-1">
                  {agent.completedGoals.map((g, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                      <CheckCircle size={12} className="text-status-green mt-0.5 shrink-0" />
                      <span className="line-through">{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Blockers */}
            {agent.blockers.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-status-red uppercase tracking-wider mb-1">Blockers</h4>
                <ul className="space-y-1">
                  {agent.blockers.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-status-red">
                      <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Activity stats */}
            <div>
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Activity (24h)</h4>
              <ActivitySparkline data={agent.activitySparkline} width={320} height={32} />
              <div className="flex gap-4 mt-2 text-xs text-text-secondary">
                <span>{agent.runsToday} runs today</span>
                <span>{agent.successRate24h}% success rate</span>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
