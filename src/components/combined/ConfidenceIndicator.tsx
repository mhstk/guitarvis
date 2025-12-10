import type { ConfidenceLevel } from '../../utils/positionResolver';

interface ConfidenceIndicatorProps {
  confidence: ConfidenceLevel;
}

export function ConfidenceIndicator({ confidence }: ConfidenceIndicatorProps) {
  const bars = 10;
  const activeBars =
    confidence === 'high'
      ? 10
      : confidence === 'medium'
      ? 6
      : confidence === 'low'
      ? 3
      : 0;

  const getBarColor = (_index: number, active: boolean) => {
    if (!active) return 'bg-gray-700';
    if (confidence === 'high') return 'bg-green-500';
    if (confidence === 'medium') return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const labels = {
    high: 'HIGH',
    medium: 'MEDIUM',
    low: 'LOW',
    none: 'NONE',
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-0.5">
        {Array.from({ length: bars }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-5 rounded-sm transition-colors ${getBarColor(
              i,
              i < activeBars
            )}`}
          />
        ))}
      </div>
      <span
        className={`text-sm font-medium ${
          confidence === 'high'
            ? 'text-green-500'
            : confidence === 'medium'
            ? 'text-yellow-500'
            : 'text-gray-500'
        }`}
      >
        {labels[confidence]}
      </span>
    </div>
  );
}
