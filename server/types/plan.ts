export interface PlanPhase {
  id: string;
  name: string;
  emoji: string;
  status: 'draft' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface PlanTask {
  id: string;
  name: string;
  assignedTo: string;
  assignedToName: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  completedAt?: number;
  linkedSessionIds?: string[];
  notes?: string;
}

export interface SubPlan {
  id: string;
  title: string;
  createdBy: string;
  createdByName: string;
  department: string;
  parentPhaseId: string;
  status: 'draft' | 'in-progress' | 'completed' | 'archived';
  createdAt: number;
  tasks: PlanTask[];
}

export interface CronCategory {
  category: string;
  label: string;
  relatedPhaseId?: string;
}

export interface ChangelogEntry {
  ts: number;
  by: string;
  action: string;
}

export interface Plan {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdByName: string;
  createdAt: number;
  updatedAt: number;
  targetDate: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  phases: PlanPhase[];
  subPlans: SubPlan[];
  cronCategories: Record<string, CronCategory>;
  changelog: ChangelogEntry[];
}

export interface PlanProgress {
  total: number;
  completed: number;
  blocked: number;
  inProgress: number;
  pending: number;
  progress: number;
}
