import { useState } from 'react';
import { useCronJobs } from '../../hooks/useCronJobs';
import { CronStatsBar } from './CronStatsBar';
import { CronRunHistory } from './CronRunHistory';
import { StatusDot } from '../shared/StatusDot';
import { timeAgo } from '../../lib/utils';
import { Clock } from 'lucide-react';

export function CronMonitor() {
  const { data: jobs, isLoading, error } = useCronJobs();
  const [selectedJob, setSelectedJob] = useState<{ id: string; name: string } | null>(null);

  return (
    <div className="card p-5">
      <h3 className="mb-4 text-sm font-semibold text-text-secondary uppercase tracking-wider">Cron Monitor</h3>
      <CronStatsBar />
      {isLoading ? (
        <div className="py-8 text-center text-text-secondary text-sm">Loading...</div>
      ) : error ? (
        <div className="py-8 text-center text-status-red text-sm">Failed to load cron jobs</div>
      ) : (
        <div className="space-y-2">
          {(jobs || []).map((job: any) => {
            const status = job.state?.lastStatus === 'error'
              ? 'error'
              : job.state?.lastStatus === 'success'
                ? 'success'
                : 'idle';
            return (
              <button
                key={job.id}
                onClick={() => setSelectedJob({ id: job.id, name: job.name })}
                className="w-full text-left flex items-center justify-between rounded-lg bg-page px-3 py-2.5 transition-colors hover:bg-card-hover cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <StatusDot status={status} />
                  <div>
                    <p className="text-sm font-medium">{job.name}</p>
                    <p className="text-xs text-text-secondary">
                      {job.agentId} — {job.schedule?.expr}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {job.state?.consecutiveErrors > 0 && (
                    <span className="badge-red mr-2">{job.state.consecutiveErrors} errors</span>
                  )}
                  {job.state?.lastRunAtMs && (
                    <span className="text-xs text-text-secondary">
                      {timeAgo(job.state.lastRunAtMs)}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
          {(!jobs || jobs.length === 0) && (
            <div className="flex flex-col items-center py-8 text-text-secondary">
              <Clock size={24} className="mb-2 opacity-50" />
              <p className="text-sm">No cron jobs found</p>
            </div>
          )}
        </div>
      )}

      {selectedJob && (
        <CronRunHistory
          jobId={selectedJob.id}
          jobName={selectedJob.name}
          open={!!selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}
