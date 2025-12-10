import { motion } from 'framer-motion';
import { getTuningStatus, getTuningColor } from '../../utils/tuner';

interface TuningMeterProps {
  cents: number;        // -50 to +50 (clamped)
  isActive: boolean;    // Whether we have a valid reading
}

export function TuningMeter({ cents, isActive }: TuningMeterProps) {
  // Clamp cents to display range
  const clampedCents = Math.max(-50, Math.min(50, cents));

  // Convert cents to angle (-90 to +90 degrees, where 0 is center/up)
  const needleAngle = isActive ? (clampedCents / 50) * 45 : 0;

  const status = isActive ? getTuningStatus(cents) : null;
  const activeColor = status ? getTuningColor(status) : '#6b7280';

  return (
    <div className="relative w-64 h-36">
      {/* Semi-circular background */}
      <svg viewBox="0 0 200 110" className="w-full h-full">
        {/* Background arc */}
        <path
          d="M 10 100 A 90 90 0 0 1 190 100"
          fill="none"
          stroke="#374151"
          strokeWidth="20"
          strokeLinecap="round"
        />

        {/* Color zones - Red (flat) */}
        <path
          d="M 10 100 A 90 90 0 0 1 40 35"
          fill="none"
          stroke="#ef4444"
          strokeWidth="20"
          strokeLinecap="round"
          opacity="0.3"
        />

        {/* Color zones - Yellow (close flat) */}
        <path
          d="M 40 35 A 90 90 0 0 1 70 15"
          fill="none"
          stroke="#eab308"
          strokeWidth="20"
          opacity="0.3"
        />

        {/* Color zones - Green (in tune) */}
        <path
          d="M 70 15 A 90 90 0 0 1 130 15"
          fill="none"
          stroke="#22c55e"
          strokeWidth="20"
          opacity="0.3"
        />

        {/* Color zones - Yellow (close sharp) */}
        <path
          d="M 130 15 A 90 90 0 0 1 160 35"
          fill="none"
          stroke="#eab308"
          strokeWidth="20"
          opacity="0.3"
        />

        {/* Color zones - Red (sharp) */}
        <path
          d="M 160 35 A 90 90 0 0 1 190 100"
          fill="none"
          stroke="#ef4444"
          strokeWidth="20"
          strokeLinecap="round"
          opacity="0.3"
        />

        {/* Tick marks */}
        {[-50, -25, 0, 25, 50].map((tick) => {
          const angle = ((tick / 50) * 45 - 90) * (Math.PI / 180);
          const innerR = 65;
          const outerR = tick === 0 ? 85 : 75;
          const x1 = 100 + innerR * Math.cos(angle);
          const y1 = 100 + innerR * Math.sin(angle);
          const x2 = 100 + outerR * Math.cos(angle);
          const y2 = 100 + outerR * Math.sin(angle);

          return (
            <line
              key={tick}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={tick === 0 ? '#22c55e' : '#6b7280'}
              strokeWidth={tick === 0 ? 3 : 2}
            />
          );
        })}

        {/* Center point */}
        <circle cx="100" cy="100" r="8" fill="#1f2937" stroke="#374151" strokeWidth="2" />

        {/* Needle */}
        <motion.g
          animate={{ rotate: needleAngle }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          style={{ transformOrigin: '100px 100px' }}
        >
          <line
            x1="100"
            y1="100"
            x2="100"
            y2="25"
            stroke={activeColor}
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="100" cy="100" r="6" fill={activeColor} />
        </motion.g>

        {/* Labels */}
        <text x="20" y="108" fill="#9ca3af" fontSize="10" textAnchor="middle">-50</text>
        <text x="100" y="12" fill="#22c55e" fontSize="12" fontWeight="bold" textAnchor="middle">0</text>
        <text x="180" y="108" fill="#9ca3af" fontSize="10" textAnchor="middle">+50</text>
      </svg>

      {/* In-tune indicator */}
      {isActive && status === 'in-tune' && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold"
        >
          IN TUNE
        </motion.div>
      )}
    </div>
  );
}
