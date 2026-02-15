import * as Dialog from '@radix-ui/react-dialog';
import { useCronRuns } from '../../hooks/useCronRuns';
import { X, CheckCircle2, AlertCircle, Timer } from 'lucide-react';
import { timeAgo, formatDateTime } from '../../lib/utils';
import type { CronRunEntry } from '../../lib/types';

interface CronRunHistoryProps {
  jobId: string;
  jobName: string;
  open: boolean;
  onClose: () => void;
}

export function CronRunHistory({ jobId, jobName, open, onClose }: CronRunHistoryProps) {
  const { data, isLoading } = useCronRuns(open ? jobId : null, 30, 0);

  const runs: CronRunEntry[] = data?.runs || (Array.isArray(data) ? data : []);
  const stats = data?.stats;

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-0 shadow-xl max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <Dialog.Title className="text-sm font-semibold">{jobName}</Dialog.Title>
              <p className="text-xs text-text-secondary mt-0.5">{jobId}</p>
            </div>
            <Dialog.Close className="p-1 text-text-secondary hover:text-text-primary">
              <X size={16} />
            </Dialog.Close>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-3 gap-2 px-5 py-3 border-b border-border">
              <div className="text-center">
                <p className="text-lg font-semibold">{stats.successRate}%</p>
                <p className="text-[10px] text-text-secondary">Success Rate</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">{stats.totalRuns}</p>
                <p className="text-[10px] text-text-secondary">Total Runs</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">
                  {stats.avgDurationMs > 60000
                    ? `${(stats.avgDurationMs / 60000).toFixed(1)}m`
                    : `${(stats.avgDurationMs / 1000).toFixed(1)}s`}
                </p>
                <p className="text-[10px] text-text-secondary">Avg Duration</p>
              </div>
            </div>
          )}

          {/* Timeline dots */}
          {runs.length > 0 && (
            <div className="flex items-center gap-0.5 px-5 py-3 border-b border-border overflow-x-auto">
              {runs.slice(0, 30).map((run: CronRunEntry, i: number) => (
                <div
                  key={i}
                  className={`h-3 w-3 shrink-0 rounded-full ${
                    run.status === 'ok' ? 'bg-status-green' : 'bg-status-red'
                  }`}
                  title={`${run.status} — ${run.summary || ''}`}
                />
              ))}
            </div>
          )}

          {/* Run list */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="py-8 text-center text-text-secondary text-sm">Loading...</div>
            ) : runs.length === 0 ? (
              <div className="py-8 text-center text-text-secondary text-sm">No runs found</div>
            ) : (
              <div className="divide-y divide-border">
                {runs.map((run: CronRunEntry, i: number) => (
                  <div key={i} className="px-5 py-3 flex items-start gap-3">
                    {run.status === 'ok'
                      ? <CheckCircle2 size={14} className="text-status-green mt-0.5 shrink-0" />
                      : <AlertCircle size={14} className="text-status-red mt-0.5 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">
                          {run.status === 'ok' ? 'Success' : 'Error'}
                        </span>
                        <span className="text-[10px] text-text-secondary">
                          {run.ts ? timeAgo(run.ts) : run.runAtMs ? timeAgo(run.runAtMs) : ''}
                        </span>
                      </div>
                      {run.summary && (
                        <p className="text-xs text-text-secondary mt-0.5 truncate">{run.summary}</p>
                      )}
                      {run.error && (
                        <p className="text-xs text-status-red mt-0.5 truncate">{run.error}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-text-secondary shrink-0">
                      <Timer size={10} />
                      {run.durationMs > 60000
                        ? `${(run.durationMs / 60000).toFixed(1)}m`
                        : `${(run.durationMs / 1000).toFixed(1)}s`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
