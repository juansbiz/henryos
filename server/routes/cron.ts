import { Router } from 'express';
import { getCronJobs, getCronRuns, getCronRunsPaginated, getCronStats } from '../services/cron-parser.js';

export const cronRouter = Router();

cronRouter.get('/jobs', (_req, res) => {
  res.json(getCronJobs());
});

cronRouter.get('/runs/:jobId', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 0;
  const offset = parseInt(req.query.offset as string) || 0;

  if (limit > 0) {
    res.json(getCronRunsPaginated(req.params.jobId, limit, offset));
  } else {
    res.json(getCronRuns(req.params.jobId));
  }
});

cronRouter.get('/stats', (_req, res) => {
  try {
    res.json(getCronStats());
  } catch (err: any) {
    console.error('[cron] Error getting stats:', err.message);
    res.status(500).json({ message: 'Failed to compute cron stats' });
  }
});
