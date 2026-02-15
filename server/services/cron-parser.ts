import { readJSON } from './filesystem.js';
import { openclawPath } from '../config.js';
import { existsSync, readFileSync, readdirSync } from 'fs';

export function getCronJobs(): any[] {
  const cronPath = openclawPath('cron', 'jobs.json');
  if (!existsSync(cronPath)) return [];
  const data = readJSON(cronPath);
  return data.jobs || [];
}

export function getCronRuns(jobId: string): any[] {
  // Cron run logs are JSONL files named by job ID
  const logPath = openclawPath('cron', 'runs', `${jobId}.jsonl`);
  if (!existsSync(logPath)) return [];

  const lines = readFileSync(logPath, 'utf-8').trim().split('\n').filter(Boolean);
  return lines.map(line => {
    try { return JSON.parse(line); }
    catch { return null; }
  }).filter(Boolean).reverse().slice(0, 50); // Last 50 runs
}

export function getCronRunsPaginated(
  jobId: string,
  limit = 50,
  offset = 0
): { runs: any[]; total: number; stats: { totalRuns: number; successCount: number; errorCount: number; avgDurationMs: number; successRate: number } } {
  const logPath = openclawPath('cron', 'runs', `${jobId}.jsonl`);
  if (!existsSync(logPath)) {
    return { runs: [], total: 0, stats: { totalRuns: 0, successCount: 0, errorCount: 0, avgDurationMs: 0, successRate: 0 } };
  }

  const lines = readFileSync(logPath, 'utf-8').trim().split('\n').filter(Boolean);
  const allRuns = lines.map(line => {
    try { return JSON.parse(line); }
    catch { return null; }
  }).filter(Boolean).reverse();

  const total = allRuns.length;
  const successCount = allRuns.filter((r: any) => r.status === 'ok').length;
  const errorCount = allRuns.filter((r: any) => r.status === 'error').length;
  const durations = allRuns.filter((r: any) => r.durationMs).map((r: any) => r.durationMs);
  const avgDurationMs = durations.length > 0 ? Math.round(durations.reduce((a: number, b: number) => a + b, 0) / durations.length) : 0;
  const successRate = total > 0 ? Math.round((successCount / total) * 100) : 0;

  return {
    runs: allRuns.slice(offset, offset + limit),
    total,
    stats: { totalRuns: total, successCount, errorCount, avgDurationMs, successRate },
  };
}

export function getCronStats(): {
  totalJobs: number;
  totalRuns: number;
  overallSuccessRate: number;
  avgDurationMs: number;
  jobStats: Record<string, { totalRuns: number; successCount: number; errorCount: number; avgDurationMs: number; successRate: number }>;
} {
  const runsDir = openclawPath('cron', 'runs');
  if (!existsSync(runsDir)) {
    return { totalJobs: 0, totalRuns: 0, overallSuccessRate: 0, avgDurationMs: 0, jobStats: {} };
  }

  const files = readdirSync(runsDir).filter(f => f.endsWith('.jsonl'));
  let totalRuns = 0;
  let totalSuccess = 0;
  const allDurations: number[] = [];
  const jobStats: Record<string, any> = {};

  for (const file of files) {
    const jobId = file.replace('.jsonl', '');
    const result = getCronRunsPaginated(jobId, 0, 0); // Just get stats
    jobStats[jobId] = result.stats;
    totalRuns += result.stats.totalRuns;
    totalSuccess += result.stats.successCount;
    if (result.stats.avgDurationMs > 0) allDurations.push(result.stats.avgDurationMs);
  }

  return {
    totalJobs: files.length,
    totalRuns,
    overallSuccessRate: totalRuns > 0 ? Math.round((totalSuccess / totalRuns) * 100) : 0,
    avgDurationMs: allDurations.length > 0 ? Math.round(allDurations.reduce((a, b) => a + b, 0) / allDurations.length) : 0,
    jobStats,
  };
}
