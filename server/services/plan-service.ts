import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { dataPath } from '../config.js';
import type { Plan, SubPlan, PlanTask, ChangelogEntry, PlanProgress } from '../types/plan.js';

const plansDir = dataPath('plans');
if (!existsSync(plansDir)) mkdirSync(plansDir, { recursive: true });

function loadPlan(id: string): Plan | null {
  const filePath = path.join(plansDir, `${id}.json`);
  if (!existsSync(filePath)) return null;
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}

function savePlan(plan: Plan): void {
  writeFileSync(path.join(plansDir, `${plan.id}.json`), JSON.stringify(plan, null, 2));
}

export function computeSubPlanProgress(subPlan: SubPlan): PlanProgress {
  const tasks = subPlan.tasks;
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const blocked = tasks.filter(t => t.status === 'blocked').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  return {
    total,
    completed,
    blocked,
    inProgress,
    pending,
    progress: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

export function computePlanProgress(plan: Plan): PlanProgress {
  const allTasks = plan.subPlans.flatMap(sp => sp.tasks);
  const total = allTasks.length;
  const completed = allTasks.filter(t => t.status === 'completed').length;
  const blocked = allTasks.filter(t => t.status === 'blocked').length;
  const inProgress = allTasks.filter(t => t.status === 'in-progress').length;
  const pending = allTasks.filter(t => t.status === 'pending').length;
  return {
    total,
    completed,
    blocked,
    inProgress,
    pending,
    progress: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

export function computePhaseProgress(plan: Plan, phaseId: string): PlanProgress {
  const phaseSubs = plan.subPlans.filter(sp => sp.parentPhaseId === phaseId);
  const allTasks = phaseSubs.flatMap(sp => sp.tasks);
  const total = allTasks.length;
  const completed = allTasks.filter(t => t.status === 'completed').length;
  const blocked = allTasks.filter(t => t.status === 'blocked').length;
  const inProgress = allTasks.filter(t => t.status === 'in-progress').length;
  const pending = allTasks.filter(t => t.status === 'pending').length;
  return {
    total,
    completed,
    blocked,
    inProgress,
    pending,
    progress: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

export function listPlans(): any[] {
  if (!existsSync(plansDir)) return [];
  const files = readdirSync(plansDir).filter(f => f.endsWith('.json'));
  return files.map(f => {
    const plan: Plan = JSON.parse(readFileSync(path.join(plansDir, f), 'utf-8'));
    const progress = computePlanProgress(plan);
    return {
      id: plan.id,
      title: plan.title,
      createdBy: plan.createdBy,
      createdByName: plan.createdByName,
      status: plan.status,
      targetDate: plan.targetDate,
      updatedAt: plan.updatedAt,
      progress: progress.progress,
      taskCount: progress.total,
      completedCount: progress.completed,
    };
  }).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getPlan(id: string): (Plan & { progress: PlanProgress }) | null {
  const plan = loadPlan(id);
  if (!plan) return null;
  return { ...plan, progress: computePlanProgress(plan) };
}

export function createPlan(data: {
  title: string;
  description: string;
  targetDate: string;
  phases?: Plan['phases'];
  createdBy?: string;
  createdByName?: string;
}): Plan {
  const id = `plan-${Date.now()}`;
  const now = Date.now();
  const plan: Plan = {
    id,
    title: data.title,
    description: data.description,
    createdBy: data.createdBy || 'ceo',
    createdByName: data.createdByName || 'CEO',
    createdAt: now,
    updatedAt: now,
    targetDate: data.targetDate,
    status: 'active',
    phases: data.phases || [],
    subPlans: [],
    cronCategories: {},
    changelog: [{ ts: now, by: data.createdBy || 'ceo', action: 'Plan created' }],
  };
  savePlan(plan);
  return plan;
}

export function updatePlan(id: string, data: Partial<Pick<Plan, 'title' | 'description' | 'targetDate' | 'status' | 'phases' | 'cronCategories'>>): Plan | null {
  const plan = loadPlan(id);
  if (!plan) return null;
  if (data.title !== undefined) plan.title = data.title;
  if (data.description !== undefined) plan.description = data.description;
  if (data.targetDate !== undefined) plan.targetDate = data.targetDate;
  if (data.status !== undefined) plan.status = data.status;
  if (data.phases !== undefined) plan.phases = data.phases;
  if (data.cronCategories !== undefined) plan.cronCategories = data.cronCategories;
  plan.updatedAt = Date.now();
  savePlan(plan);
  return plan;
}

export function addSubPlan(planId: string, data: {
  title: string;
  createdBy: string;
  createdByName: string;
  department: string;
  parentPhaseId: string;
  tasks?: PlanTask[];
}): SubPlan | null {
  const plan = loadPlan(planId);
  if (!plan) return null;
  const subPlan: SubPlan = {
    id: `sub-${Date.now()}`,
    title: data.title,
    createdBy: data.createdBy,
    createdByName: data.createdByName,
    department: data.department,
    parentPhaseId: data.parentPhaseId,
    status: 'draft',
    createdAt: Date.now(),
    tasks: data.tasks || [],
  };
  plan.subPlans.push(subPlan);
  plan.updatedAt = Date.now();
  plan.changelog.push({ ts: Date.now(), by: data.createdBy, action: `Added sub-plan: ${data.title}` });
  savePlan(plan);
  return subPlan;
}

export function updateSubPlan(planId: string, subPlanId: string, data: Partial<Pick<SubPlan, 'title' | 'status' | 'department'>>): SubPlan | null {
  const plan = loadPlan(planId);
  if (!plan) return null;
  const sub = plan.subPlans.find(s => s.id === subPlanId);
  if (!sub) return null;
  if (data.title !== undefined) sub.title = data.title;
  if (data.status !== undefined) sub.status = data.status;
  if (data.department !== undefined) sub.department = data.department;
  plan.updatedAt = Date.now();
  savePlan(plan);
  return sub;
}

export function updateTask(planId: string, subPlanId: string, taskId: string, data: Partial<Pick<PlanTask, 'status' | 'notes' | 'linkedSessionIds'>>): PlanTask | null {
  const plan = loadPlan(planId);
  if (!plan) return null;
  const sub = plan.subPlans.find(s => s.id === subPlanId);
  if (!sub) return null;
  const task = sub.tasks.find(t => t.id === taskId);
  if (!task) return null;
  if (data.status !== undefined) {
    task.status = data.status;
    if (data.status === 'completed') task.completedAt = Date.now();
    else task.completedAt = undefined;
  }
  if (data.notes !== undefined) task.notes = data.notes;
  if (data.linkedSessionIds !== undefined) task.linkedSessionIds = data.linkedSessionIds;
  plan.updatedAt = Date.now();
  plan.changelog.push({ ts: Date.now(), by: task.assignedTo, action: `Task "${task.name}" -> ${task.status}` });
  savePlan(plan);
  return task;
}

export function addChangelog(planId: string, entry: ChangelogEntry): boolean {
  const plan = loadPlan(planId);
  if (!plan) return false;
  plan.changelog.push(entry);
  plan.updatedAt = Date.now();
  savePlan(plan);
  return true;
}

export function archivePlan(id: string): Plan | null {
  return updatePlan(id, { status: 'archived' });
}

export function getAgentPlanContext(agentId: string): {
  planId: string;
  planTitle: string;
  phaseName: string;
  phaseEmoji: string;
  subPlanTitle: string;
  taskName: string;
  progress: number;
} | null {
  if (!existsSync(plansDir)) return null;
  const files = readdirSync(plansDir).filter(f => f.endsWith('.json'));

  for (const f of files) {
    const plan: Plan = JSON.parse(readFileSync(path.join(plansDir, f), 'utf-8'));
    if (plan.status !== 'active') continue;

    for (const sub of plan.subPlans) {
      for (const task of sub.tasks) {
        if (task.assignedTo === agentId && (task.status === 'in-progress' || task.status === 'pending')) {
          const phase = plan.phases.find(p => p.id === sub.parentPhaseId);
          const progress = computePlanProgress(plan);
          return {
            planId: plan.id,
            planTitle: plan.title,
            phaseName: phase?.name || 'Unknown',
            phaseEmoji: phase?.emoji || '',
            subPlanTitle: sub.title,
            taskName: task.name,
            progress: progress.progress,
          };
        }
      }
    }
  }
  return null;
}
