import { useGatewayStatus } from '../../hooks/useGatewayStatus';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { AlertCircle } from 'lucide-react';

export function StatusIndicator() {
  const { data } = useGatewayStatus();
  const connected = data?.connected ?? false;

  const { data: blockers } = useQuery({
    queryKey: ['blockers-count'],
    queryFn: api.getBlockers,
    refetchInterval: 30000,
  });

  const ceoBlockers = (blockers || []).filter(b => b.requiresCeo).length;

  return (
    <div className="flex items-center gap-3 text-sm text-text-secondary">
      {ceoBlockers > 0 && (
        <div className="flex items-center gap-1 text-status-red">
          <AlertCircle size={14} />
          <span className="text-xs font-semibold">{ceoBlockers}</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <span>Gateway</span>
        <div
          className={`h-2 w-2 rounded-full ${
            connected ? 'bg-status-green' : 'bg-status-red'
          }`}
        />
      </div>
    </div>
  );
}
