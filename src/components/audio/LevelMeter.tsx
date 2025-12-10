interface LevelMeterProps {
  level: number; // 0-1
  isActive: boolean;
}

export function LevelMeter({ level, isActive }: LevelMeterProps) {
  const percentage = Math.round(level * 100);
  const barCount = 10;
  const activeBars = Math.ceil(level * barCount);

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-gray-500 w-6">{isActive ? `${percentage}%` : '--'}</span>
      <div className="flex gap-0.5">
        {Array.from({ length: barCount }, (_, i) => {
          const isBarActive = isActive && i < activeBars;
          let barColor = 'bg-gray-700';
          if (isBarActive) {
            if (i < 6) barColor = 'bg-green-500';
            else if (i < 8) barColor = 'bg-yellow-500';
            else barColor = 'bg-red-500';
          }
          return (
            <div
              key={i}
              className={`w-1.5 h-4 rounded-sm transition-colors ${barColor}`}
            />
          );
        })}
      </div>
    </div>
  );
}
