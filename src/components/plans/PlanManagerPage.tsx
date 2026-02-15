import { useState } from 'react';
import { usePlans, usePlan } from '../../hooks/usePlans';
import { PlanList } from './PlanList';
import { PlanDetail } from './PlanDetail';
import { CreatePlanDialog } from './CreatePlanDialog';
import { AddSubPlanDialog } from './AddSubPlanDialog';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { Map, Plus, ChevronLeft } from 'lucide-react';

export function PlanManagerPage() {
  const { data: plans, isLoading } = usePlans();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showAddSubPlan, setShowAddSubPlan] = useState(false);
  const { data: selectedPlan } = usePlan(selectedPlanId);

  // Mobile drill-down
  const mobileView = !selectedPlanId ? 'list' : 'detail';

  if (isLoading) return <LoadingSpinner />;

  return (
    <>
      {/* Desktop: two-panel */}
      <div className="hidden md:flex h-[calc(100vh-8rem)] gap-0">
        <div className="w-72 shrink-0 flex flex-col border-r border-border card">
          <div className="shrink-0 flex items-center justify-between border-b border-border px-3 py-2.5">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Plans</h3>
            <button onClick={() => setShowCreate(true)} className="text-amber hover:text-amber/80">
              <Plus size={16} />
            </button>
          </div>
          <div className="flex-1 min-h-0">
            {plans && plans.length > 0 ? (
              <PlanList plans={plans} selectedId={selectedPlanId} onSelect={setSelectedPlanId} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                <Map size={24} className="mb-2 opacity-50" />
                <p className="text-sm">No plans yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0 card">
          {selectedPlanId ? (
            <PlanDetail planId={selectedPlanId} onAddSubPlan={() => setShowAddSubPlan(true)} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-text-secondary">
              <Map size={32} className="mb-3 opacity-50" />
              <p className="text-sm">Select a plan to view</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden h-[calc(100vh-7rem-4rem)]">
        {mobileView === 'list' && (
          <div className="card h-full flex flex-col">
            <div className="shrink-0 flex items-center justify-between border-b border-border px-3 py-2.5">
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Plans</h3>
              <button onClick={() => setShowCreate(true)} className="text-amber hover:text-amber/80">
                <Plus size={16} />
              </button>
            </div>
            <div className="flex-1 min-h-0">
              {plans && plans.length > 0 ? (
                <PlanList plans={plans} selectedId={null} onSelect={setSelectedPlanId} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                  <Map size={24} className="mb-2 opacity-50" />
                  <p className="text-sm">No plans yet</p>
                </div>
              )}
            </div>
          </div>
        )}
        {mobileView === 'detail' && selectedPlanId && (
          <div className="card h-full flex flex-col">
            <button
              onClick={() => setSelectedPlanId(null)}
              className="flex items-center gap-1 px-3 py-2 text-xs text-amber shrink-0"
            >
              <ChevronLeft size={14} /> Plans
            </button>
            <div className="flex-1 min-h-0">
              <PlanDetail planId={selectedPlanId} onAddSubPlan={() => setShowAddSubPlan(true)} />
            </div>
          </div>
        )}
      </div>

      {showCreate && (
        <CreatePlanDialog
          onClose={() => setShowCreate(false)}
          onCreated={(id) => { setSelectedPlanId(id); setShowCreate(false); }}
        />
      )}
      {showAddSubPlan && selectedPlan && (
        <AddSubPlanDialog plan={selectedPlan} onClose={() => setShowAddSubPlan(false)} />
      )}
    </>
  );
}
