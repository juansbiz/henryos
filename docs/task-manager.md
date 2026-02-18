# Task Manager

The Task Manager is the dashboard home page, providing an at-a-glance view of agent operations.

## Stats Cards

Top-level metrics displayed as cards:

- **Total Agents** — Number of registered agents in `openclaw.json`
- **Active Sessions** — Currently running agent sessions (via gateway)
- **Cron Jobs** — Total number of scheduled cron jobs
- **Gateway** — Connection status to the OpenClaw gateway

## Model Fleet

Shows each AI model in use with:

- Model name and provider ID
- Number of agents using that model as primary
- Visual color coding by tier:
  - **Gold** — Opus 4.6 (Henry only — COO/Orchestrator)
  - **Blue** — Sonnet 4.6 (BRAIN tier — department heads: Warren, Hormozi, Elon)
  - **Green** — GLM-4.7-Flash (MUSCLE tier, all worker agents — primary model)
  - **Yellow** — GLM-5 / OpenRouter (MUSCLE fallbacks)

## Cron Monitor

Real-time view of all cron jobs from `~/.openclaw/cron/jobs.json`:

- Job name and assigned agent
- Cron expression and timezone
- Status indicator (green/red/gray)
- Last run time and consecutive error count
- Last error message (if any)

The cron monitor refreshes every 60 seconds.

## Data Sources

| Endpoint | Source |
|----------|--------|
| `GET /api/system/stats` | Computed from openclaw.json + jobs.json |
| `GET /api/agents` | Parsed from openclaw.json (keys stripped) |
| `GET /api/cron/jobs` | Parsed from cron/jobs.json |
| `GET /api/gateway/status` | WebSocket connection state |
