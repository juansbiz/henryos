import { NavLink } from 'react-router-dom';
import { Radar, Map, LayoutDashboard, Network, MessageSquare, FolderOpen, BookOpen, ScrollText } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Mission Control', icon: Radar },
  { path: '/plans', label: 'Plans', icon: Map },
  { path: '/tasks', label: 'Task Manager', icon: LayoutDashboard },
  { path: '/sessions', label: 'Sessions', icon: ScrollText },
  { path: '/org', label: 'Org Chart', icon: Network },
  { path: '/standup', label: 'Standup', icon: MessageSquare },
  { path: '/workspaces', label: 'Workspaces', icon: FolderOpen },
  { path: '/docs', label: 'Docs', icon: BookOpen },
];

export function Sidebar() {
  return (
    <aside className="flex w-56 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber/10 text-amber font-bold text-sm">
          H
        </div>
        <div>
          <h1 className="text-sm font-semibold text-text-primary">Henry OS</h1>
          <p className="text-[10px] text-text-secondary">juansbiz LLC</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              isActive ? 'sidebar-link-active' : 'sidebar-link'
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <div className="text-[10px] text-text-secondary">
          v1.1.0 — Port 7100
        </div>
      </div>
    </aside>
  );
}
