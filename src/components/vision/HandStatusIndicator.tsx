interface HandStatusIndicatorProps {
  isLoading: boolean;
  isDetecting: boolean;
  isCalibrated: boolean;
  error?: string | null;
}

export function HandStatusIndicator({
  isLoading,
  isDetecting,
  isCalibrated,
  error,
}: HandStatusIndicatorProps) {
  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-400">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
        <span className="text-sm">Error: {error}</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-yellow-400">
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse" />
        <span className="text-sm">Loading hand detection...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            isDetecting ? 'bg-green-500' : 'bg-gray-500'
          }`}
        />
        <span className="text-sm text-gray-400">
          {isDetecting ? 'Hand detected' : 'No hand detected'}
        </span>
      </div>
      {!isCalibrated && (
        <span className="text-sm text-yellow-400">
          (Calibration required)
        </span>
      )}
    </div>
  );
}
