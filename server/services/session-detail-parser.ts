import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import path from 'path';
import { openclawPath, validatePathWithinDir } from '../config.js';

const VALID_ID = /^[a-z0-9-]+$/;

function validateId(id: string): void {
  if (!VALID_ID.test(id)) throw new Error('Invalid ID format');
  if (id.includes('..')) throw new Error('Path traversal detected');
}

export interface SessionFileMeta {
  sessionId: string;
  agentId: string;
  timestamp: string;
  cwd: string;
  lineCount: number;
  sizeBytes: number;
  modifiedAt: number;
}

export interface ParsedSessionEvent {
  type: 'session_header' | 'model_change' | 'user_message' | 'assistant_message' | 'tool_call' | 'tool_result' | 'thinking';
  id: string;
  timestamp: string;
  data: any;
}

export interface SessionTotals {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  totalTokens: number;
  totalCost: number;
  messageCount: number;
  toolCallCount: number;
}

export function listAgentSessions(
  agentId: string,
  page = 1,
  limit = 20
): { sessions: SessionFileMeta[]; total: number } {
  validateId(agentId);
  const sessionsDir = openclawPath('agents', agentId, 'sessions');
  if (!validatePathWithinDir(sessionsDir, openclawPath('agents', agentId))) {
    throw new Error('Path traversal detected');
  }
  if (!existsSync(sessionsDir)) return { sessions: [], total: 0 };

  const files = readdirSync(sessionsDir)
    .filter(f => f.endsWith('.jsonl'))
    .map(f => {
      const fullPath = path.join(sessionsDir, f);
      const stat = statSync(fullPath);
      const sessionId = f.replace('.jsonl', '');

      let timestamp = '';
      let cwd = '';
      let lineCount = 0;

      try {
        const content = readFileSync(fullPath, 'utf-8');
        const lines = content.trim().split('\n').filter(Boolean);
        lineCount = lines.length;
        if (lines.length > 0) {
          const first = JSON.parse(lines[0]);
          if (first.type === 'session') {
            timestamp = first.timestamp || '';
            cwd = first.cwd || '';
          }
        }
      } catch {
        // Skip malformed files
      }

      return {
        sessionId,
        agentId,
        timestamp,
        cwd,
        lineCount,
        sizeBytes: stat.size,
        modifiedAt: stat.mtimeMs,
      } satisfies SessionFileMeta;
    })
    .sort((a, b) => b.modifiedAt - a.modifiedAt);

  const total = files.length;
  const start = (page - 1) * limit;
  return { sessions: files.slice(start, start + limit), total };
}

export function parseSessionFile(
  agentId: string,
  sessionId: string,
  offset = 0,
  limit = 200
): { session: any; events: ParsedSessionEvent[]; totals: SessionTotals; eventCount: number } {
  validateId(agentId);
  validateId(sessionId);

  const filePath = openclawPath('agents', agentId, 'sessions', `${sessionId}.jsonl`);
  if (!validatePathWithinDir(filePath, openclawPath('agents', agentId, 'sessions'))) {
    throw new Error('Path traversal detected');
  }
  if (!existsSync(filePath)) throw new Error('Session not found');

  const content = readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n').filter(Boolean);

  let session: any = null;
  const allEvents: ParsedSessionEvent[] = [];
  const totals: SessionTotals = {
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    totalTokens: 0,
    totalCost: 0,
    messageCount: 0,
    toolCallCount: 0,
  };

  for (const line of lines) {
    let parsed: any;
    try {
      parsed = JSON.parse(line);
    } catch {
      continue;
    }

    if (parsed.type === 'session') {
      session = {
        id: parsed.id,
        timestamp: parsed.timestamp,
        cwd: parsed.cwd,
        version: parsed.version,
      };
      continue;
    }

    if (parsed.type === 'model_change') {
      allEvents.push({
        type: 'model_change',
        id: parsed.id,
        timestamp: parsed.timestamp,
        data: { provider: parsed.provider, modelId: parsed.modelId },
      });
      continue;
    }

    // Skip non-message types
    if (parsed.type === 'custom' || parsed.type === 'compaction' || parsed.type === 'thinking_level_change') {
      continue;
    }

    if (parsed.type !== 'message' || !parsed.message) continue;

    const msg = parsed.message;

    if (msg.role === 'user') {
      const text = (msg.content || [])
        .filter((c: any) => c.type === 'text')
        .map((c: any) => c.text)
        .join('\n');
      allEvents.push({
        type: 'user_message',
        id: parsed.id,
        timestamp: parsed.timestamp,
        data: { text },
      });
      totals.messageCount++;
      continue;
    }

    if (msg.role === 'assistant') {
      // Extract usage if present
      if (msg.usage) {
        totals.inputTokens += msg.usage.input || 0;
        totals.outputTokens += msg.usage.output || 0;
        totals.cacheReadTokens += msg.usage.cacheRead || 0;
        totals.cacheWriteTokens += msg.usage.cacheWrite || 0;
        totals.totalTokens += msg.usage.totalTokens || 0;
        totals.totalCost += msg.usage.cost?.total || 0;
      }

      for (const block of msg.content || []) {
        if (block.type === 'text' && block.text?.trim()) {
          allEvents.push({
            type: 'assistant_message',
            id: `${parsed.id}-text`,
            timestamp: parsed.timestamp,
            data: {
              text: block.text,
              model: msg.model,
              provider: msg.provider,
              usage: msg.usage,
            },
          });
          totals.messageCount++;
        }

        if (block.type === 'toolCall') {
          allEvents.push({
            type: 'tool_call',
            id: block.id || `${parsed.id}-tool`,
            timestamp: parsed.timestamp,
            data: {
              name: block.name,
              arguments: block.arguments,
              toolCallId: block.id,
            },
          });
          totals.toolCallCount++;
        }

        if (block.type === 'thinking') {
          allEvents.push({
            type: 'thinking',
            id: `${parsed.id}-think`,
            timestamp: parsed.timestamp,
            data: {
              thinking: block.thinking,
            },
          });
        }
      }
      continue;
    }

    if (msg.role === 'toolResult') {
      const text = (msg.content || [])
        .filter((c: any) => c.type === 'text')
        .map((c: any) => c.text)
        .join('\n');
      allEvents.push({
        type: 'tool_result',
        id: parsed.id,
        timestamp: parsed.timestamp,
        data: {
          toolCallId: msg.toolCallId,
          toolName: msg.toolName,
          content: text,
          isError: msg.isError || false,
        },
      });
      continue;
    }
  }

  const eventCount = allEvents.length;
  const paged = allEvents.slice(offset, offset + limit);

  return { session, events: paged, totals, eventCount };
}
