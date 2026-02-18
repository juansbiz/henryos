import { ORG_HIERARCHY } from '../../lib/constants';
import { OrgNode } from './OrgNode';
import { BusinessUnit } from './BusinessUnit';
import { DepartmentGroup } from './DepartmentGroup';
import type { OrgNode as OrgNodeType } from '../../lib/types';

export function OrgTree() {
  return (
    <div className="flex flex-col items-center">
      {/* Henry at top */}
      <OrgNode node={ORG_HIERARCHY} />

      {/* Vertical connector from Henry */}
      <div className="h-8 w-px bg-border" />

      {/* Horizontal bar connecting business units / departments */}
      <div className="relative flex items-start justify-center gap-12">
        {/* Horizontal connector line */}
        <div className="absolute top-0 left-1/2 h-px -translate-x-1/2" style={{
          width: 'calc(100% - 120px)',
          backgroundColor: '#222222'
        }} />

        {/* Render business units or department groups based on tier */}
        {ORG_HIERARCHY.children?.map((child) =>
          child.tier === 'business' ? (
            <BusinessUnit key={child.id} node={child} />
          ) : (
            <DepartmentGroup key={child.id} node={child} />
          )
        )}
      </div>
    </div>
  );
}
