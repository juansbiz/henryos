import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { MoreVertical, Archive, ArchiveRestore, Tag, FileText } from 'lucide-react';
import { useArchiveSession, useUnarchiveSession } from '../../hooks/useSessionArchive';

interface SessionActionsProps {
  agentId: string;
  sessionId: string;
  isArchived: boolean;
  onEditTags: () => void;
  onEditNote: () => void;
}

export function SessionActions({ agentId, sessionId, isArchived, onEditTags, onEditNote }: SessionActionsProps) {
  const archiveMutation = useArchiveSession();
  const unarchiveMutation = useUnarchiveSession();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="p-1 text-text-secondary hover:text-text-primary rounded transition-colors opacity-0 group-hover:opacity-100">
          <MoreVertical size={14} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="z-50 min-w-[140px] rounded-lg border border-border bg-card p-1 shadow-lg" sideOffset={4}>
          {isArchived ? (
            <DropdownMenu.Item
              className="flex items-center gap-2 rounded px-2 py-1.5 text-xs cursor-pointer outline-none hover:bg-card-hover"
              onSelect={() => unarchiveMutation.mutate({ agentId, sessionId })}
            >
              <ArchiveRestore size={12} /> Unarchive
            </DropdownMenu.Item>
          ) : (
            <DropdownMenu.Item
              className="flex items-center gap-2 rounded px-2 py-1.5 text-xs cursor-pointer outline-none hover:bg-card-hover"
              onSelect={() => archiveMutation.mutate({ agentId, sessionId })}
            >
              <Archive size={12} /> Archive
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Item
            className="flex items-center gap-2 rounded px-2 py-1.5 text-xs cursor-pointer outline-none hover:bg-card-hover"
            onSelect={onEditTags}
          >
            <Tag size={12} /> Edit Tags
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="flex items-center gap-2 rounded px-2 py-1.5 text-xs cursor-pointer outline-none hover:bg-card-hover"
            onSelect={onEditNote}
          >
            <FileText size={12} /> Edit Note
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
