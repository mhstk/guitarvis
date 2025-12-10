import type { ResolvedPosition } from '../../utils/positionResolver';
import { getStringName } from '../../utils/fretboard';

interface ResolvedDisplayProps {
  result: ResolvedPosition;
}

export function ResolvedDisplay({ result }: ResolvedDisplayProps) {
  const { position, confidence, reasoning } = result;

  const confidenceStyles = {
    high: 'text-green-500 bg-green-500/10 border-green-500/30',
    medium: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
    low: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
    none: 'text-gray-500 bg-gray-500/10 border-gray-500/30',
  };

  const confidenceLabels = {
    high: 'HIGH',
    medium: 'MEDIUM',
    low: 'LOW',
    none: 'NONE',
  };

  return (
    <div className="text-center">
      {position ? (
        <div>
          <div className="text-lg text-gray-400 mb-1">Resolved Position</div>
          <div className="text-3xl font-bold text-white mb-2">
            {getStringName(position.string)}, Fret {position.fret}
          </div>
        </div>
      ) : (
        <div>
          <div className="text-lg text-gray-400 mb-1">Resolved Position</div>
          <div className="text-2xl font-bold text-gray-500 mb-2">--</div>
        </div>
      )}

      <div className="flex items-center justify-center gap-3">
        <span className="text-sm text-gray-500">Confidence:</span>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium border ${confidenceStyles[confidence]}`}
        >
          {confidenceLabels[confidence]}
        </div>
      </div>

      <div className="text-xs text-gray-600 mt-2">{reasoning}</div>
    </div>
  );
}
