import { Router } from 'express';
import { getCostAnalytics } from '../services/analytics.js';

export const analyticsRouter = Router();

analyticsRouter.get('/cost', (_req, res) => {
  try {
    const data = getCostAnalytics();
    res.json(data);
  } catch (err: any) {
    console.error('[analytics] Error:', err.message);
    res.status(500).json({ message: 'Failed to compute analytics' });
  }
});
