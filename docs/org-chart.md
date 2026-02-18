# Org Chart

The Org Chart page visualizes the agent hierarchy as a department-based organizational tree.

## Hierarchy

```
Henry (Orchestrator/COO, Opus 4.6)
├── Warren (CRO, Sonnet 4.6)
│   ├── Scout (Product Intelligence, GLM-4.7-Flash)
│   └── Herald (Product Launches, GLM-4.7-Flash)
├── Hormozi (CMO, Sonnet 4.6)
│   ├── Pen (Copywriter, GLM-4.7-Flash)
│   ├── Spark (Creative Director, GLM-4.7-Flash)
│   ├── Funnel (Funnel Builder, GLM-4.7-Flash)
│   ├── Megaphone (Ads & Distribution, GLM-4.7-Flash)
│   └── Quill (Content Writer, GLM-4.7-Flash)
└── Elon (CTO, Sonnet 4.6)
    ├── Sales (Sr. Dev — Pipeline, GLM-4.7-Flash)
    ├── Marketing (Sr. Dev — Campaigns, GLM-4.7-Flash)
    ├── Tasks (Sr. Dev — Workflows, GLM-4.7-Flash)
    ├── Backend (Sr. Dev — Infra, GLM-4.7-Flash)
    └── Reviewer (Code Review, GLM-4.7-Flash)
```

## Agent Tiers

| Tier | Model | Role |
|------|-------|------|
| Orchestrator | Opus 4.6 | Henry — COO, routes, plans, approves/rejects |
| Chief | Sonnet 4.6 | Warren, Hormozi, Elon — department leaders |
| Agent | GLM-4.7-Flash (fallback: GLM-5, OpenRouter) | Specialized workers |

## Stats Bar

- **Chiefs** — Number of department heads (3)
- **Total in Org** — All agents in the hierarchy (11)
- **Registered** — Agents currently in openclaw.json
- **Pending Setup** — Agents in the org chart not yet registered

## Interactions

- Click any node to navigate to that agent's workspace
- Expand/collapse departments using the chevron button
- Nodes show model badge with tier-appropriate coloring
