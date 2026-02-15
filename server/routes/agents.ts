import { Router } from 'express';
import { getAgents, getAgent } from '../services/openclaw-config.js';
import { gatewayClient } from '../services/gateway-client.js';
import { parseSessions } from '../services/session-parser.js';
import { getCronJobs } from '../services/cron-parser.js';

export const agentsRouter = Router();

agentsRouter.get('/', (_req, res) => {
  res.json(getAgents());
});

agentsRouter.get('/status', async (_req, res) => {
  try {
    const agents = getAgents();
    const cronJobs = getCronJobs();

    let sessions: any[] = [];
    if (gatewayClient.isConnected) {
      try {
        const raw = await gatewayClient.listSessions();
        sessions = parseSessions(Array.isArray(raw) ? raw : raw?.sessions || []);
      } catch { /* gateway unavailable */ }
    }

    const now = Date.now();
    const ACTIVE_THRESHOLD = 5 * 60 * 1000; // 5 minutes

    const statuses = agents.map((agent: any) => {
      const agentSessions = sessions.filter(s => s.agentId === agent.id);
      const agentCronJobs = cronJobs.filter((j: any) => j.agentId === agent.id);
      const hasErrors = agentCronJobs.some((j: any) => (j.state?.consecutiveErrors || 0) > 0);
      const mostRecent = agentSessions.length > 0
        ? Math.max(...agentSessions.map(s => s.updatedAt))
        : 0;

      let status: 'active' | 'idle' | 'error' | 'offline';
      if (hasErrors) {
        status = 'error';
      } else if (mostRecent > 0 && now - mostRecent < ACTIVE_THRESHOLD) {
        status = 'active';
      } else if (agentSessions.length > 0) {
        status = 'idle';
      } else {
        status = 'offline';
      }

      return {
        id: agent.id,
        name: agent.name || agent.id,
        status,
        lastActivity: mostRecent || null,
        sessionCount: agentSessions.length,
        cronErrors: agentCronJobs.reduce((sum: number, j: any) => sum + (j.state?.consecutiveErrors || 0), 0),
      };
    });

    res.json(statuses);
  } catch (err: any) {
    console.error('[agents] Error getting status:', err.message);
    res.status(500).json({ message: 'Failed to get agent statuses' });
  }
});

agentsRouter.get('/:id', (req, res) => {
  const agent = getAgent(req.params.id);
  if (!agent) return res.status(404).json({ message: 'Agent not found' });
  res.json(agent);
});
