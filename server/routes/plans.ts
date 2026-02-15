import { Router } from 'express';
import * as planService from '../services/plan-service.js';

export const plansRouter = Router();

// List all plans
plansRouter.get('/', (_req, res) => {
  res.json(planService.listPlans());
});

// Get single plan
plansRouter.get('/:id', (req, res) => {
  const plan = planService.getPlan(req.params.id);
  if (!plan) return res.status(404).json({ message: 'Plan not found' });
  res.json(plan);
});

// Create plan
plansRouter.post('/', (req, res) => {
  const { title, description, targetDate, phases, createdBy, createdByName } = req.body;
  if (!title || !description || !targetDate) {
    return res.status(400).json({ message: 'title, description, and targetDate are required' });
  }
  const plan = planService.createPlan({ title, description, targetDate, phases, createdBy, createdByName });
  res.json(plan);
});

// Update plan
plansRouter.put('/:id', (req, res) => {
  const plan = planService.updatePlan(req.params.id, req.body);
  if (!plan) return res.status(404).json({ message: 'Plan not found' });
  res.json(plan);
});

// Add sub-plan
plansRouter.post('/:id/sub-plans', (req, res) => {
  const { title, createdBy, createdByName, department, parentPhaseId, tasks } = req.body;
  if (!title || !createdBy || !department || !parentPhaseId) {
    return res.status(400).json({ message: 'title, createdBy, department, and parentPhaseId are required' });
  }
  const subPlan = planService.addSubPlan(req.params.id, { title, createdBy, createdByName: createdByName || createdBy, department, parentPhaseId, tasks });
  if (!subPlan) return res.status(404).json({ message: 'Plan not found' });
  res.json(subPlan);
});

// Update sub-plan
plansRouter.put('/:id/sub-plans/:subId', (req, res) => {
  const sub = planService.updateSubPlan(req.params.id, req.params.subId, req.body);
  if (!sub) return res.status(404).json({ message: 'Plan or sub-plan not found' });
  res.json(sub);
});

// Update task
plansRouter.patch('/:id/sub-plans/:subId/tasks/:taskId', (req, res) => {
  const task = planService.updateTask(req.params.id, req.params.subId, req.params.taskId, req.body);
  if (!task) return res.status(404).json({ message: 'Plan, sub-plan, or task not found' });
  res.json(task);
});

// Archive plan
plansRouter.post('/:id/archive', (req, res) => {
  const plan = planService.archivePlan(req.params.id);
  if (!plan) return res.status(404).json({ message: 'Plan not found' });
  res.json(plan);
});
