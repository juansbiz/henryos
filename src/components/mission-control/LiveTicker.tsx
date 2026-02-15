import { useRef, useState, useEffect } from 'react';
import type { TickerEvent } from '../../lib/types';
import { timeAgo } from '../../lib/utils';

interface LiveTickerProps {
  events: TickerEvent[];
}

export function LiveTicker({ events }: LiveTickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!paused && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [events, paused]);

  return (
    <div className="card p-4">
      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Live Feed</h3>
      <div
        ref={scrollRef}
        className="space-y-1.5 max-h-[300px] overflow-y-auto"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {events.length === 0 ? (
          <p className="text-sm text-text-secondary">No recent activity</p>
        ) : (
          events.map((e, i) => (
            <div key={`${e.ts}-${i}`} className="flex items-start gap-2 text-xs py-1">
              <span className="shrink-0 w-5 text-center">{e.emoji}</span>
              <span className="text-text-secondary shrink-0 w-14 text-right">{timeAgo(e.ts)}</span>
              <span className={`flex-1 truncate ${e.type === 'cron-error' ? 'text-status-red' : ''}`}>
                {e.summary || 'No summary'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
