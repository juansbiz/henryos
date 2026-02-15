import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronDown, ChevronRight, Wrench, AlertCircle, CheckCircle2, Brain, ArrowRightLeft } from 'lucide-react';
import type { ParsedSessionEvent } from '../../lib/types';
import { cn } from '../../lib/utils';

interface SessionEventProps {
  event: ParsedSessionEvent;
}

export function SessionEvent({ event }: SessionEventProps) {
  const [expanded, setExpanded] = useState(false);

  if (event.type === 'user_message') {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-lg bg-page border border-border px-4 py-3">
          <p className="text-xs text-text-secondary mb-1">User</p>
          <div className="text-sm whitespace-pre-wrap">{event.data.text}</div>
        </div>
      </div>
    );
  }

  if (event.type === 'assistant_message') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-lg bg-card border border-amber/20 px-4 py-3">
          <p className="text-xs text-amber mb-1">Assistant</p>
          <div className="text-sm prose prose-invert prose-sm max-w-none [&_pre]:bg-page [&_pre]:border [&_pre]:border-border [&_pre]:rounded [&_code]:text-amber">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {event.data.text}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  if (event.type === 'tool_call') {
    return (
      <div className="ml-8">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary transition-colors"
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          <Wrench size={12} className="text-amber" />
          <span className="font-mono font-medium">{event.data.name}</span>
        </button>
        {expanded && event.data.arguments && (
          <pre className="mt-1 ml-6 rounded bg-page border border-border p-2 text-xs font-mono text-text-secondary overflow-x-auto max-h-64 overflow-y-auto">
            {typeof event.data.arguments === 'string'
              ? event.data.arguments
              : JSON.stringify(event.data.arguments, null, 2)}
          </pre>
        )}
      </div>
    );
  }

  if (event.type === 'tool_result') {
    const isError = event.data.isError;
    return (
      <div className="ml-8">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary transition-colors"
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          {isError
            ? <AlertCircle size={12} className="text-status-red" />
            : <CheckCircle2 size={12} className="text-status-green" />}
          <span className="font-mono">
            {event.data.toolName ? `${event.data.toolName} result` : 'Tool result'}
          </span>
          {isError && <span className="badge-red text-[10px]">error</span>}
        </button>
        {expanded && event.data.content && (
          <pre className={cn(
            'mt-1 ml-6 rounded border p-2 text-xs font-mono overflow-x-auto max-h-64 overflow-y-auto',
            isError
              ? 'bg-status-red/5 border-status-red/20 text-status-red'
              : 'bg-page border-border text-text-secondary'
          )}>
            {event.data.content}
          </pre>
        )}
      </div>
    );
  }

  if (event.type === 'thinking') {
    return (
      <div className="ml-8">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-xs text-text-secondary/60 hover:text-text-secondary transition-colors"
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          <Brain size={12} />
          <span className="italic">Thinking...</span>
        </button>
        {expanded && (
          <div className="mt-1 ml-6 rounded bg-page/50 border border-border/50 p-2 text-xs text-text-secondary/70 italic whitespace-pre-wrap max-h-64 overflow-y-auto">
            {event.data.thinking}
          </div>
        )}
      </div>
    );
  }

  if (event.type === 'model_change') {
    return (
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-3 py-1 text-[10px] text-text-secondary">
          <ArrowRightLeft size={10} />
          {event.data.provider}/{event.data.modelId}
        </span>
      </div>
    );
  }

  return null;
}
