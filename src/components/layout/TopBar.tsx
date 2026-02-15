import { useLocation } from 'react-router-dom';
import { StatusIndicator } from './StatusIndicator';

const pageTitles: Record<string, string> = {
  '/': 'Mission Control',
  '/plans': 'Plan Manager',
  '/tasks': 'Task Manager',
  '/sessions': 'Sessions',
  '/org': 'Org Chart',
  '/standup': 'Standup',
  '/workspaces': 'Workspaces',
  '/docs': 'Documentation',
};

export function TopBar() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Henry OS';

  return (
    <header className="flex h-12 md:h-14 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <div className="flex items-center gap-2">
        <span className="md:hidden text-amber font-bold text-sm">H</span>
        <h2 className="text-base md:text-lg font-semibold truncate">{title}</h2>
      </div>
      <StatusIndicator />
    </header>
  );
}
