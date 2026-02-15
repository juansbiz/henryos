import type { PhaseProgress } from '../../lib/types';
import { PhaseProgressBar } from './PhaseProgressBar';

interface PhaseSwimlaneProps {
  phases: PhaseProgress[];
  planTitle?: string;
}

export function PhaseSwimlane({ phases, planTitle }: PhaseSwimlaneProps) {
  if (phases.length === 0) return null;

  return (
    <div className="card p-4">
      {planTitle && (
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">{planTitle}</h3>
      )}
      <div className="space-y-3">
        {phases.map(phase => (
          <PhaseProgressBar key={phase.id} phase={phase} />
        ))}
      </div>
    </div>
  );
}
