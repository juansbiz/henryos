# Henry OS

Henry OS is a self-hosted web dashboard for managing OpenClaw AI agents powering the juansbiz LLC portfolio (Axolop, Inbox EQ, Yally.TV). It provides a unified interface for monitoring agent activity, editing agent configurations, running standups, and visualizing the organizational hierarchy.

**Axolop** is the open-source, AI-native ecommerce CRM that replaces your entire tech stack — built for Shopify/WooCommerce founders doing $20K-$1M/mo. Model: n8n (self-hosted free, cloud paid).

## Key Features

- **Task Manager** — Dashboard showing agent stats, model fleet usage, and cron job monitoring
- **Org Chart** — Visual hierarchy of all agents organized by department
- **Standup** — Orchestrated multi-agent conversations for team coordination
- **Workspaces** — Direct file editor for agent SOUL.md and identity files
- **Docs** — This documentation wiki

## Architecture

Henry OS reads and writes directly to OpenClaw configuration files on the filesystem. There is no database — all state lives in:

- `~/.openclaw/openclaw.json` — Master agent configuration
- `~/.openclaw/workspaces/{agentId}/` — Per-agent workspace files
- `~/.openclaw/cron/jobs.json` — Cron job definitions and state
- `data/standups/` — Standup conversation archives (JSON)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Radix UI |
| Backend | Express.js, TypeScript |
| State | React Query (server), Zustand (client) |
| Gateway | WebSocket client (OpenClaw gateway protocol) |
| Storage | Filesystem (no database) |

## Running

```bash
# Development
npm run dev          # Start backend on :7100
npm run dev:frontend # Start Vite dev server on :5173

# Production
npm run build        # Build frontend + backend
npm run preview      # Serve production build
```

The app runs on port **7100** by default.
