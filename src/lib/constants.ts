import type { OrgNode, SessionCategory } from './types';

export const NAV_ITEMS = [
  { path: '/', label: 'Mission Control', icon: 'Radar' },
  { path: '/plans', label: 'Plans', icon: 'Map' },
  { path: '/tasks', label: 'Task Manager', icon: 'LayoutDashboard' },
  { path: '/sessions', label: 'Sessions', icon: 'ScrollText' },
  { path: '/org', label: 'Org Chart', icon: 'Network' },
  { path: '/standup', label: 'Standup', icon: 'MessageSquare' },
  { path: '/workspaces', label: 'Workspaces', icon: 'FolderOpen' },
  { path: '/docs', label: 'Docs', icon: 'BookOpen' },
] as const;

export const DEPARTMENT_COLORS: Record<string, string> = {
  engineering: 'text-blue-400',
  revenue: 'text-green-400',
  marketing: 'text-purple-400',
  hq: 'text-amber',
};

export const ORG_HIERARCHY: OrgNode = {
  id: 'henry',
  name: 'Henry',
  role: 'Orchestrator',
  model: 'anthropic/claude-opus-4-6',
  tier: 'orchestrator',
  emoji: '🏗️',
  children: [
    {
      id: 'warren',
      name: 'Warren',
      role: 'CRO — Revenue Ops',
      model: 'anthropic/claude-opus-4-6',
      tier: 'chief',
      emoji: '📊',
      children: [
        { id: 'scout', name: 'Scout', role: 'Product Intelligence', model: 'zai/glm-5', tier: 'agent', emoji: '🔭' },
        { id: 'herald', name: 'Herald', role: 'Product Launches', model: 'zai/glm-5', tier: 'agent', emoji: '📢' },
      ],
    },
    {
      id: 'hormozi',
      name: 'Hormozi',
      role: 'CMO — Marketing',
      model: 'anthropic/claude-opus-4-6',
      tier: 'chief',
      emoji: '💰',
      children: [
        { id: 'quill', name: 'Quill', role: 'Content Writer', model: 'zai/glm-5', tier: 'agent', emoji: '✍️' },
      ],
    },
    {
      id: 'elon',
      name: 'Elon',
      role: 'CTO — Engineering',
      model: 'anthropic/claude-opus-4-6',
      tier: 'chief',
      emoji: '🚀',
      children: [
        { id: 'sales', name: 'Sales', role: 'Sr. Dev — Pipeline', model: 'zai/glm-5', tier: 'agent', emoji: '💼' },
        { id: 'marketing', name: 'Marketing', role: 'Sr. Dev — Campaigns', model: 'zai/glm-5', tier: 'agent', emoji: '📧' },
        { id: 'tasks', name: 'Tasks', role: 'Sr. Dev — Workflows', model: 'zai/glm-5', tier: 'agent', emoji: '📋' },
        { id: 'reviewer', name: 'Reviewer', role: 'Code Review', model: 'zai/glm-4.7-flash', tier: 'agent', emoji: '🔍' },
      ],
    },
  ],
};

export const MODEL_TIERS: Record<string, { label: string; color: string }> = {
  'anthropic/claude-opus-4-6': { label: 'Opus 4.6', color: '#d4a843' },
  'zai/glm-5': { label: 'GLM-5', color: '#22c55e' },
  'zai/glm-4.7-flash': { label: 'GLM-4.7-Flash', color: '#eab308' },
};

export const SESSION_CATEGORIES: Record<SessionCategory, { label: string; badgeClass: string }> = {
  'cron-run': { label: 'Cron Run', badgeClass: 'badge-yellow' },
  'cron': { label: 'Cron Job', badgeClass: 'badge-yellow' },
  'discord': { label: 'Discord', badgeClass: 'badge-green' },
  'conversation': { label: 'Conversation', badgeClass: 'badge-amber' },
  'henry-os': { label: 'Henry OS', badgeClass: 'badge-amber' },
  'other': { label: 'Other', badgeClass: 'badge-red' },
};

export const WORKSPACE_FILES = [
  'SOUL.md',
  'IDENTITY.md',
  'USER.md',
  'AGENTS.md',
  'TOOLS.md',
  'MEMORY.md',
  'HEARTBEAT.md',
] as const;

export const DOCS_NAV = [
  { slug: 'overview', label: 'Overview' },
  { slug: 'task-manager', label: 'Task Manager' },
  { slug: 'org-chart', label: 'Org Chart' },
  { slug: 'workspaces', label: 'Workspaces' },
  { slug: 'standups', label: 'Standups' },
  { slug: 'agent-architecture', label: 'Agent Architecture' },
  { slug: 'gateway', label: 'Gateway' },
  { slug: 'memory', label: 'Memory Architecture' },
  { slug: 'safety', label: 'Safety Rules' },
] as const;
