interface SparklineProps {
  data: { ts: number; status: string; durationMs: number }[];
  width?: number;
  height?: number;
}

export function ActivitySparkline({ data, width = 96, height = 24 }: SparklineProps) {
  if (data.length === 0) return null;

  const barWidth = Math.max(2, (width - (data.length - 1)) / data.length);
  const maxDuration = Math.max(...data.map(d => d.durationMs), 1);

  return (
    <svg width={width} height={height} className="shrink-0">
      {data.map((d, i) => {
        const barHeight = Math.max(2, (d.durationMs / maxDuration) * height);
        return (
          <rect
            key={i}
            x={i * (barWidth + 1)}
            y={height - barHeight}
            width={barWidth}
            height={barHeight}
            rx={1}
            className={d.status === 'ok' ? 'fill-status-green' : 'fill-status-red'}
            opacity={0.8}
          />
        );
      })}
    </svg>
  );
}
