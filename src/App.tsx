import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { MissionControlPage } from './components/mission-control/MissionControlPage';
import { PlanManagerPage } from './components/plans/PlanManagerPage';
import { TaskManagerPage } from './components/task-manager/TaskManagerPage';
import { OrgChartPage } from './components/org-chart/OrgChartPage';
import { StandupPage } from './components/standup/StandupPage';
import { WorkspacesPage } from './components/workspaces/WorkspacesPage';
import { DocsPage } from './components/docs/DocsPage';
import { SessionBrowserPage } from './components/sessions/SessionBrowserPage';
import { LoginPage } from './components/auth/LoginPage';

export default function App() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('henry-auth') === 'true');

  if (!authed) {
    return <LoginPage onSuccess={() => setAuthed(true)} />;
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<MissionControlPage />} />
        <Route path="/plans" element={<PlanManagerPage />} />
        <Route path="/tasks" element={<TaskManagerPage />} />
        <Route path="/sessions" element={<SessionBrowserPage />} />
        <Route path="/org" element={<OrgChartPage />} />
        <Route path="/standup" element={<StandupPage />} />
        <Route path="/workspaces" element={<WorkspacesPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/docs/:slug" element={<DocsPage />} />
      </Routes>
    </AppShell>
  );
}
