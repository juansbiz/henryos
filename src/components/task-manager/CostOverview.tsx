import { useAnalytics } from '../../hooks/useAnalytics';
import { CostByAgentBar } from './CostByAgentBar';
import { MODEL_TIERS } from '../../lib/constants';
import { DollarSign, Hash, ScrollText } from 'lucide-react';

function formatCost(cost: number): string {
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  return `$${cost.toFixed(2)}`;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function CostOverview() {
  const { data, isLoading } = useAnalytics();

  if (isLoading || !data) return null;

  const { totals, byAgent, byModel } = data;

  const modelEntries = Object.entries(byModel)
    .sort(([, a], [, b]) => b.cost - a.cost);
  const totalModelCost = modelEntries.reduce((sum, [, d]) => sum + d.cost, 0) || 1;

  return (
    <div className="card p-5 space-y-5">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Cost Overview</h3>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-page p-3">
          <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-1">
            <DollarSign size={12} />
            Total Spend
          </div>
          <p className="text-lg font-semibold">{formatCost(totals.cost)}</p>
        </div>
        <div className="rounded-lg bg-page p-3">
          <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-1">
            <Hash size={12} />
            Total Tokens
          </div>
          <p className="text-lg font-semibold">{formatTokens(totals.tokens)}</p>
        </div>
        <div className="rounded-lg bg-page p-3">
          <div className="flex items-center gap-1.5 text-xs text-text-secondary mb-1">
            <ScrollText size={12} />
            Total Sessions
          </div>
          <p className="text-lg font-semibold">{totals.sessions}</p>
        </div>
      </div>

      {/* Per-agent bar chart */}
      <div>
        <p className="text-xs text-text-secondary mb-2">Spend by Agent</p>
        <CostByAgentBar byAgent={byAgent} />
      </div>

      {/* Model tier breakdown */}
      <div>
        <p className="text-xs text-text-secondary mb-2">Spend by Model</p>
        <div className="space-y-1.5">
          {modelEntries.map(([modelId, { cost }]) => {
            const info = MODEL_TIERS[modelId];
            const pct = (cost / totalModelCost) * 100;
            return (
              <div key={modelId} className="flex items-center gap-2">
                <span
                  className="text-xs font-medium w-28 truncate"
                  style={{ color: info?.color || '#888' }}
                >
                  {info?.label || modelId.split('/').pop()}
                </span>
                <div className="flex-1 h-3 bg-page rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(pct, 2)}%`,
                      backgroundColor: info?.color || '#888',
                      opacity: 0.4,
                    }}
                  />
                </div>
                <span className="w-16 text-right text-xs font-mono text-text-secondary">
                  ${cost.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
