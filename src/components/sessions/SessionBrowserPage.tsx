import { useState } from 'react';
import { useAgents } from '../../hooks/useAgents';
import { SessionList } from './SessionList';
import { SessionDetail } from './SessionDetail';
import { BulkArchiveDialog } from './BulkArchiveDialog';
import { ScrollText, ChevronLeft, Archive } from 'lucide-react';

export function SessionBrowserPage() {
  const { data: agents } = useAgents();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [showArchived, setShowArchived] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
  const [showBulkArchive, setShowBulkArchive] = useState(false);

  const mobileView = !selectedAgent ? 'agents' : !selectedSession ? 'list' : 'detail';

  const handleAgentChange = (agentId: string) => {
    setSelectedAgent(agentId);
    setSelectedSession(null);
    setPage(1);
    setBulkMode(false);
    setSelectedSessions(new Set());
  };

  const toggleSelect = (sessionId: string) => {
    const next = new Set(selectedSessions);
    if (next.has(sessionId)) next.delete(sessionId);
    else next.add(sessionId);
    setSelectedSessions(next);
  };

  return (
    <>
      {/* Desktop: two-panel layout */}
      <div className="hidden md:flex h-[calc(100vh-8rem)] gap-0">
        <div className="w-72 shrink-0 flex flex-col border-r border-border card">
          <div className="shrink-0 border-b border-border p-3 space-y-2">
            <select
              value={selectedAgent || ''}
              onChange={(e) => handleAgentChange(e.target.value)}
              className="input text-sm"
            >
              <option value="">Select agent...</option>
              {(agents || []).map((a: any) => (
                <option key={a.id} value={a.id}>{a.name || a.id}</option>
              ))}
            </select>
            {selectedAgent && (
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-[10px] text-text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showArchived}
                    onChange={(e) => setShowArchived(e.target.checked)}
                  />
                  Show Archived
                </label>
                <button
                  onClick={() => { setBulkMode(!bulkMode); setSelectedSessions(new Set()); }}
                  className={`text-[10px] px-2 py-0.5 rounded ${bulkMode ? 'bg-amber/10 text-amber' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  {bulkMode ? 'Cancel Bulk' : 'Bulk Select'}
                </button>
                {bulkMode && selectedSessions.size > 0 && (
                  <button
                    onClick={() => setShowBulkArchive(true)}
                    className="text-[10px] px-2 py-0.5 rounded bg-status-red/10 text-status-red flex items-center gap-1"
                  >
                    <Archive size={10} /> Archive ({selectedSessions.size})
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="flex-1 min-h-0">
            {selectedAgent ? (
              <SessionList
                agentId={selectedAgent}
                selectedSessionId={selectedSession}
                onSelect={setSelectedSession}
                page={page}
                onPageChange={setPage}
                showArchived={showArchived}
                bulkMode={bulkMode}
                selectedSessions={selectedSessions}
                onToggleSelect={toggleSelect}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                <ScrollText size={24} className="mb-2 opacity-50" />
                <p className="text-sm">Select an agent</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0 card">
          {selectedAgent && selectedSession ? (
            <SessionDetail agentId={selectedAgent} sessionId={selectedSession} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-text-secondary">
              <ScrollText size={32} className="mb-3 opacity-50" />
              <p className="text-sm">Select a session to view</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden h-[calc(100vh-7rem-4rem)]">
        {mobileView === 'agents' && (
          <div className="card p-4 space-y-2">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Select Agent</h2>
            {(agents || []).map((a: any) => (
              <button
                key={a.id}
                onClick={() => handleAgentChange(a.id)}
                className="w-full text-left card-hover px-4 py-3 rounded-lg"
              >
                <p className="text-sm font-medium">{a.name || a.id}</p>
                <p className="text-xs text-text-secondary">{a.id}</p>
              </button>
            ))}
          </div>
        )}
        {mobileView === 'list' && selectedAgent && (
          <div className="flex h-full flex-col card">
            <div className="flex items-center justify-between px-3 py-2 shrink-0">
              <button
                onClick={() => setSelectedAgent(null)}
                className="flex items-center gap-1 text-xs text-amber"
              >
                <ChevronLeft size={14} /> Agents
              </button>
              <label className="flex items-center gap-1.5 text-[10px] text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                />
                Archived
              </label>
            </div>
            <div className="flex-1 min-h-0">
              <SessionList
                agentId={selectedAgent}
                selectedSessionId={selectedSession}
                onSelect={setSelectedSession}
                page={page}
                onPageChange={setPage}
                showArchived={showArchived}
              />
            </div>
          </div>
        )}
        {mobileView === 'detail' && selectedAgent && selectedSession && (
          <div className="flex h-full flex-col card">
            <button
              onClick={() => setSelectedSession(null)}
              className="flex items-center gap-1 px-3 py-2 text-xs text-amber shrink-0"
            >
              <ChevronLeft size={14} /> Sessions
            </button>
            <div className="flex-1 min-h-0">
              <SessionDetail agentId={selectedAgent} sessionId={selectedSession} />
            </div>
          </div>
        )}
      </div>

      {showBulkArchive && selectedAgent && (
        <BulkArchiveDialog
          sessions={[...selectedSessions].map(sid => ({ agentId: selectedAgent, sessionId: sid }))}
          onClose={() => { setShowBulkArchive(false); setBulkMode(false); setSelectedSessions(new Set()); }}
        />
      )}
    </>
  );
}
