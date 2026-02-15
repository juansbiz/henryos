import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dataPath } from '../config.js';

interface ArchiveEntry {
  archivedAt: number;
  archivedBy: string;
  note?: string;
}

interface ArchiveData {
  archived: Record<string, ArchiveEntry>;
  tags: Record<string, string[]>;
  notes: Record<string, string>;
}

const archivePath = dataPath('session-archive.json');

let cache: ArchiveData | null = null;
let cacheTs = 0;
const CACHE_TTL = 10_000;

function makeKey(agentId: string, sessionId: string): string {
  return `${agentId}:${sessionId}`;
}

function load(): ArchiveData {
  const now = Date.now();
  if (cache && now - cacheTs < CACHE_TTL) return cache;
  if (!existsSync(archivePath)) {
    cache = { archived: {}, tags: {}, notes: {} };
    cacheTs = now;
    return cache;
  }
  cache = JSON.parse(readFileSync(archivePath, 'utf-8'));
  cacheTs = now;
  return cache!;
}

function save(data: ArchiveData): void {
  writeFileSync(archivePath, JSON.stringify(data, null, 2));
  cache = data;
  cacheTs = Date.now();
}

export function getArchiveData(): ArchiveData {
  return load();
}

export function archiveSession(agentId: string, sessionId: string, note?: string): void {
  const data = load();
  const key = makeKey(agentId, sessionId);
  data.archived[key] = { archivedAt: Date.now(), archivedBy: 'ceo', note };
  save(data);
}

export function unarchiveSession(agentId: string, sessionId: string): void {
  const data = load();
  const key = makeKey(agentId, sessionId);
  delete data.archived[key];
  save(data);
}

export function bulkArchive(sessions: { agentId: string; sessionId: string }[], note?: string): void {
  const data = load();
  for (const s of sessions) {
    const key = makeKey(s.agentId, s.sessionId);
    data.archived[key] = { archivedAt: Date.now(), archivedBy: 'ceo', note };
  }
  save(data);
}

export function tagSession(agentId: string, sessionId: string, tags: string[]): void {
  const data = load();
  const key = makeKey(agentId, sessionId);
  data.tags[key] = tags;
  save(data);
}

export function noteSession(agentId: string, sessionId: string, note: string): void {
  const data = load();
  const key = makeKey(agentId, sessionId);
  data.notes[key] = note;
  save(data);
}

export function isArchived(agentId: string, sessionId: string): boolean {
  const data = load();
  return !!data.archived[makeKey(agentId, sessionId)];
}

export function getSessionMeta(agentId: string, sessionId: string): {
  isArchived: boolean;
  archivedAt?: number;
  tags: string[];
  note?: string;
} {
  const data = load();
  const key = makeKey(agentId, sessionId);
  const archived = data.archived[key];
  return {
    isArchived: !!archived,
    archivedAt: archived?.archivedAt,
    tags: data.tags[key] || [],
    note: data.notes[key],
  };
}
