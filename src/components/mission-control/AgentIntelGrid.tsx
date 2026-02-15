import { useState } from 'react';
import type { AgentIntelligence } from '../../lib/types';
import { AgentIntelCard } from './AgentIntelCard';
import { AgentIntelDetail } from './AgentIntelDetail';

interface AgentIntelGridProps {
  agents: AgentIntelligence[];
}

const DEPARTMENTS: { id: string; label: string; heads: string[] }[] = [
  { id: 'hq', label: 'HQ', heads: ['henry'] },
  { id: 'engineering', label: 'Engineering (Elon)', heads: ['elon', 'sales', 'marketing', 'tasks', 'reviewer'] },
  { id: 'revenue', label: 'Revenue (Warren)', heads: ['warren', 'scout', 'herald'] },
  { id: 'marketing', label: 'Marketing (Hormozi)', heads: ['hormozi', 'quill'] },
];

export function AgentIntelGrid({ agents }: AgentIntelGridProps) {
  const [selectedAgent, setSelectedAgent] = useState<AgentIntelligence | null>(null);

  return (
    <>
      <div className="space-y-4">
        {DEPARTMENTS.map(dept => {
          const deptAgents = dept.heads
            .map(id => agents.find(a => a.id === id))
            .filter(Boolean) as AgentIntelligence[];
          if (deptAgents.length === 0) return null;

          return (
            <div key={dept.id}>
              <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                {dept.label}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {deptAgents.map(agent => (
                  <AgentIntelCard
                    key={agent.id}
                    agent={agent}
                    onClick={() => setSelectedAgent(agent)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedAgent && (
        <AgentIntelDetail
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </>
  );
}
