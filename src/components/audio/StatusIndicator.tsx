import type { ConnectionStatus } from '../../hooks/usePitchDetection';

interface StatusIndicatorProps {
  status: ConnectionStatus;
}

const statusConfig: Record<ConnectionStatus, { color: string; label: string }> = {
  idle: { color: 'bg-gray-500', label: 'Idle' },
  connecting: { color: 'bg-yellow-500 animate-pulse', label: 'Connecting...' },
  listening: { color: 'bg-green-500', label: 'Listening' },
  error: { color: 'bg-red-500', label: 'Error' },
};

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2.5 h-2.5 rounded-full ${config.color}`} />
      <span className="text-sm text-gray-400">{config.label}</span>
    </div>
  );
}
