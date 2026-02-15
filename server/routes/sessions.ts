import { Router } from 'express';
import { gatewayClient } from '../services/gateway-client.js';
import { parseSessions } from '../services/session-parser.js';
import { listAgentSessions, parseSessionFile } from '../services/session-detail-parser.js';
import * as archive from '../services/session-archive.js';
import type { SessionCategory } from '../services/session-parser.js';

export const sessionsRouter = Router();

sessionsRouter.get('/', async (req, res) => {
  if (!gatewayClient.isConnected) {
    return res.json([]);
  }

  try {
    const raw = await gatewayClient.listSessions();
    const sessions = parseSessions(Array.isArray(raw) ? raw : raw?.sessions || []);

    // Sort by most recent activity first
    sessions.sort((a, b) => b.updatedAt - a.updatedAt);

    // Optional filters
    const category = req.query.category as string | undefined;
    const agent = req.query.agent as string | undefined;

    const filtered = sessions.filter((s) => {
      if (category && s.category !== category) return false;
      if (agent && s.agentId !== agent) return false;
      return true;
    });

    res.json(filtered);
  } catch (err: any) {
    console.error('[sessions] Error fetching sessions:', err.message);
    res.json([]);
  }
});

// List session files for an agent (with archive filter)
sessionsRouter.get('/:agentId/list', (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const showArchived = req.query.archived === 'true';
    const result = listAgentSessions(req.params.agentId, page, limit);

    // Enrich with archive metadata and filter
    const archiveData = archive.getArchiveData();
    const enriched = result.sessions.map((s: any) => {
      const key = `${req.params.agentId}:${s.sessionId}`;
      return {
        ...s,
        isArchived: !!archiveData.archived[key],
        tags: archiveData.tags[key] || [],
        note: archiveData.notes[key],
      };
    });

    const filtered = showArchived ? enriched : enriched.filter((s: any) => !s.isArchived);
    res.json({ sessions: filtered, total: filtered.length });
  } catch (err: any) {
    console.error('[sessions] Error listing sessions:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// Archive a session
sessionsRouter.post('/:agentId/:sessionId/archive', (req, res) => {
  archive.archiveSession(req.params.agentId, req.params.sessionId, req.body.note);
  res.json({ success: true });
});

// Unarchive a session
sessionsRouter.post('/:agentId/:sessionId/unarchive', (req, res) => {
  archive.unarchiveSession(req.params.agentId, req.params.sessionId);
  res.json({ success: true });
});

// Set tags on a session
sessionsRouter.put('/:agentId/:sessionId/tags', (req, res) => {
  const { tags } = req.body;
  if (!Array.isArray(tags)) return res.status(400).json({ message: 'tags must be an array' });
  archive.tagSession(req.params.agentId, req.params.sessionId, tags);
  res.json({ success: true });
});

// Set note on a session
sessionsRouter.put('/:agentId/:sessionId/note', (req, res) => {
  const { note } = req.body;
  if (typeof note !== 'string') return res.status(400).json({ message: 'note must be a string' });
  archive.noteSession(req.params.agentId, req.params.sessionId, note);
  res.json({ success: true });
});

// Bulk archive
sessionsRouter.post('/bulk-archive', (req, res) => {
  const { sessions, note } = req.body;
  if (!Array.isArray(sessions)) return res.status(400).json({ message: 'sessions must be an array' });
  archive.bulkArchive(sessions, note);
  res.json({ success: true });
});

// Get parsed session detail (must be last due to :sessionId param)
sessionsRouter.get('/:agentId/:sessionId', (req, res) => {
  try {
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = Math.min(parseInt(req.query.limit as string) || 200, 500);
    const result = parseSessionFile(req.params.agentId, req.params.sessionId, offset, limit);
    const meta = archive.getSessionMeta(req.params.agentId, req.params.sessionId);
    res.json({ ...result, archiveMeta: meta });
  } catch (err: any) {
    console.error('[sessions] Error parsing session:', err.message);
    res.status(err.message === 'Session not found' ? 404 : 400).json({ message: err.message });
  }
});
