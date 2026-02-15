import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { agentsRouter } from './routes/agents.js';
import { workspacesRouter } from './routes/workspaces.js';
import { configRouter } from './routes/config.js';
import { cronRouter } from './routes/cron.js';
import { gatewayRouter } from './routes/gateway.js';
import { standupsRouter } from './routes/standups.js';
import { docsRouter } from './routes/docs.js';
import { sessionsRouter } from './routes/sessions.js';
import { systemRouter } from './routes/system.js';
import { analyticsRouter } from './routes/analytics.js';
import { intelligenceRouter } from './routes/intelligence.js';
import { plansRouter } from './routes/plans.js';
import { errorHandler } from './middleware/error-handler.js';
import { gatewayClient } from './services/gateway-client.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || '7100', 10);
const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'https://hificopy.github.io'],
}));
app.use(express.json());

// API routes
app.use('/api/system', systemRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/workspaces', workspacesRouter);
app.use('/api/config', configRouter);
app.use('/api/cron', cronRouter);
app.use('/api/gateway', gatewayRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/standups', standupsRouter);
app.use('/api/docs', docsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/intelligence', intelligenceRouter);
app.use('/api/plans', plansRouter);

// Serve frontend in production (skip in dev — Vite serves on :5173)
const clientDist = path.join(__dirname, '../client');
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[henry-os] Server running on port ${PORT}`);
  gatewayClient.connect();
});
