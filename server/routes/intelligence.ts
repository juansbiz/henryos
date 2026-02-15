import { Router } from 'express';
import { getMissionControl, getAgentIntel, getBlockers } from '../services/activity-intelligence.js';

export const intelligenceRouter = Router();

intelligenceRouter.get('/mission-control', async (_req, res) => {
  try {
    const data = await getMissionControl();
    res.json(data);
  } catch (err: any) {
    console.error('[intelligence] Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

intelligenceRouter.get('/agent/:id', async (req, res) => {
  try {
    const agentId = req.params.id;
    if (!/^[a-z0-9-]+$/.test(agentId)) {
      return res.status(400).json({ message: 'Invalid agent ID' });
    }
    const data = await getAgentIntel(agentId);
    if (!data) return res.status(404).json({ message: 'Agent not found' });
    res.json(data);
  } catch (err: any) {
    console.error('[intelligence] Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

intelligenceRouter.get('/blockers', async (_req, res) => {
  try {
    const data = await getBlockers();
    res.json(data);
  } catch (err: any) {
    console.error('[intelligence] Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});
