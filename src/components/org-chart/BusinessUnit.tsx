import { useState } from 'react';
import { ChevronDown, ChevronRight, Building2 } from 'lucide-react';
import { DepartmentGroup } from './DepartmentGroup';
import { DEPARTMENT_COLORS } from '../../lib/constants';
import type { OrgNode as OrgNodeType } from '../../lib/types';

interface BusinessUnitProps {
  node: OrgNodeType;
}

export function BusinessUnit({ node }: BusinessUnitProps) {
  const [expanded, setExpanded] = useState(true);
  const colorClass = DEPARTMENT_COLORS[node.business ?? ''] ?? 'text-text-secondary';
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      {/* Vertical connector from horizontal bar */}
      <div className="h-8 w-px bg-border" />

      {/* Business unit card */}
      <div className="relative">
        <button
          onClick={() => setExpanded(!expanded)}
          className="card-hover relative flex items-center gap-3 px-5 py-3 min-w-[180px] border-dashed border-2 border-border"
        >
          <div className={`flex h-8 w-8 items-center justify-center rounded-md bg-card text-lg`}>
            {node.emoji}
          </div>
          <div className="text-left">
            <p className={`text-sm font-bold ${colorClass}`}>{node.name}</p>
            <p className="text-[10px] text-text-secondary">{node.role}</p>
          </div>
          {hasChildren && (
            <span className="ml-auto text-text-secondary">
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          )}
          {!hasChildren && (
            <span className="ml-auto text-[10px] text-text-secondary italic">No agents</span>
          )}
        </button>
      </div>

      {/* Department groups within business */}
      {expanded && hasChildren && (
        <>
          <div className="h-6 w-px bg-border" />
          <div className="relative flex items-start justify-center gap-12">
            {node.children!.length > 1 && (
              <div className="absolute top-0 left-1/2 h-px -translate-x-1/2" style={{
                width: 'calc(100% - 120px)',
                backgroundColor: '#222222'
              }} />
            )}
            {node.children!.map((dept) => (
              <DepartmentGroup key={dept.id} node={dept} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
