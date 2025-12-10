import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FretPosition } from '../../utils/fretboard';
import type { ConfidenceLevel } from '../../utils/positionResolver';
import type { ScalePosition } from '../../utils/scales';
import {
  GUITAR_STRINGS,
  DISPLAY_FRETS,
  SINGLE_DOT_FRETS,
  DOUBLE_DOT_FRETS,
} from '../../utils/fretboard';

interface FretboardProps {
  resolvedPosition: FretPosition | null;
  allPositions: FretPosition[];
  handRegion: { min: number; max: number } | null;
  confidence: ConfidenceLevel;
  showAllPositions?: boolean;
  showHandRegion?: boolean;
  // Practice mode props
  scalePositions?: ScalePosition[];
  showNoteLabels?: boolean;
  showRootHints?: boolean;
}

// Layout constants
const PADDING_LEFT = 50;
const PADDING_RIGHT = 20;
const PADDING_TOP = 25;
const PADDING_BOTTOM = 40;
const STRING_SPACING = 28;
const NUT_WIDTH = 8;

export function Fretboard({
  resolvedPosition,
  allPositions,
  handRegion,
  confidence,
  showAllPositions = true,
  showHandRegion = true,
  scalePositions,
  showNoteLabels = true,
  showRootHints = true,
}: FretboardProps) {
  const fretCount = DISPLAY_FRETS;
  const fretboardHeight = STRING_SPACING * 5 + PADDING_TOP + PADDING_BOTTOM;
  const viewBoxWidth = 1400;

  // Calculate fret positions
  const fretPositions = useMemo(() => {
    const positions: number[] = [PADDING_LEFT];
    const availableWidth = viewBoxWidth - PADDING_LEFT - PADDING_RIGHT - NUT_WIDTH;

    for (let i = 1; i <= fretCount; i++) {
      const x = PADDING_LEFT + NUT_WIDTH + (availableWidth * i) / fretCount;
      positions.push(x);
    }
    return positions;
  }, [fretCount]);

  // Get Y position for a string (1 = top, 6 = bottom)
  const getStringY = (stringNum: number): number => {
    return PADDING_TOP + (stringNum - 1) * STRING_SPACING;
  };

  // Get X position for a fret (center of the fret space for note indicators)
  const getFretX = (fret: number): number => {
    if (fret === 0) {
      return PADDING_LEFT - 15;
    }
    if (fret > fretCount) {
      // Extrapolate beyond displayed frets
      const availableWidth = viewBoxWidth - PADDING_LEFT - PADDING_RIGHT - NUT_WIDTH;
      return PADDING_LEFT + NUT_WIDTH + (availableWidth * fret) / fretCount;
    }
    return (fretPositions[fret] + fretPositions[fret - 1]) / 2;
  };


  // Filter displayed frets
  const visibleSingleDots = SINGLE_DOT_FRETS.filter(f => f <= fretCount);
  const visibleDoubleDots = DOUBLE_DOT_FRETS.filter(f => f <= fretCount);

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${fretboardHeight}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Hand region overlay */}
        {showHandRegion && handRegion && handRegion.min >= 0 && (
          <rect
            x={getFretX(handRegion.min) - 20}
            y={PADDING_TOP - 15}
            width={getFretX(handRegion.max) - getFretX(handRegion.min) + 40}
            height={STRING_SPACING * 5 + 30}
            fill="rgba(59, 130, 246, 0.15)"
            stroke="rgba(59, 130, 246, 0.4)"
            strokeWidth={2}
            strokeDasharray="8 4"
            rx={8}
          />
        )}

        {/* Fretboard background */}
        <rect
          x={PADDING_LEFT}
          y={PADDING_TOP - 10}
          width={viewBoxWidth - PADDING_LEFT - PADDING_RIGHT}
          height={STRING_SPACING * 5 + 20}
          fill="#3d2914"
          rx={4}
        />

        {/* Nut */}
        <rect
          x={PADDING_LEFT}
          y={PADDING_TOP - 10}
          width={NUT_WIDTH}
          height={STRING_SPACING * 5 + 20}
          fill="#f5f5dc"
          rx={2}
        />

        {/* Frets */}
        {Array.from({ length: fretCount }, (_, i) => i + 1).map((fret) => (
          <rect
            key={`fret-${fret}`}
            x={fretPositions[fret] - 1.5}
            y={PADDING_TOP - 5}
            width={3}
            height={STRING_SPACING * 5 + 10}
            fill="#d4a574"
            rx={1}
          />
        ))}

        {/* Fret markers (single dots) */}
        {visibleSingleDots.map((fret) => (
          <circle
            key={`marker-${fret}`}
            cx={getFretX(fret)}
            cy={fretboardHeight - PADDING_BOTTOM + 20}
            r={6}
            fill="#6b7280"
          />
        ))}

        {/* Fret markers (double dots) */}
        {visibleDoubleDots.map((fret) => (
          <g key={`double-marker-${fret}`}>
            <circle
              cx={getFretX(fret) - 15}
              cy={fretboardHeight - PADDING_BOTTOM + 20}
              r={6}
              fill="#6b7280"
            />
            <circle
              cx={getFretX(fret) + 15}
              cy={fretboardHeight - PADDING_BOTTOM + 20}
              r={6}
              fill="#6b7280"
            />
          </g>
        ))}

        {/* Strings */}
        {GUITAR_STRINGS.map((guitarString) => {
          const thickness = 1 + (guitarString.string - 1) * 0.4;
          return (
            <line
              key={`string-${guitarString.string}`}
              x1={PADDING_LEFT - 15}
              y1={getStringY(guitarString.string)}
              x2={viewBoxWidth - PADDING_RIGHT}
              y2={getStringY(guitarString.string)}
              stroke="#b0b0b0"
              strokeWidth={thickness}
            />
          );
        })}

        {/* String labels */}
        {GUITAR_STRINGS.map((guitarString) => (
          <text
            key={`label-${guitarString.string}`}
            x={PADDING_LEFT - 35}
            y={getStringY(guitarString.string) + 5}
            fill="#9ca3af"
            fontSize="14"
            textAnchor="middle"
          >
            {guitarString.openNote}
          </text>
        ))}

        {/* Fret numbers */}
        {Array.from({ length: fretCount }, (_, i) => i + 1).map((fret) => (
          <text
            key={`fret-num-${fret}`}
            x={getFretX(fret)}
            y={PADDING_TOP - 25}
            fill="#6b7280"
            fontSize="12"
            textAnchor="middle"
          >
            {fret}
          </text>
        ))}

        {/* Scale positions (practice mode) */}
        {scalePositions && scalePositions.map((pos) => {
          const isRoot = showRootHints && pos.isRoot;
          const radius = isRoot ? 8 : 6;
          const fillColor = isRoot ? '#f97316' : '#6366f1'; // orange for root, indigo for scale
          const opacity = isRoot ? 0.85 : 0.7;

          return (
            <g key={`scale-${pos.string}-${pos.fret}`}>
              <circle
                cx={getFretX(pos.fret)}
                cy={getStringY(pos.string)}
                r={radius}
                fill={fillColor}
                opacity={opacity}
              />
              {showNoteLabels && (
                <text
                  x={getFretX(pos.fret)}
                  y={getStringY(pos.string) + 3.5}
                  fill="white"
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                  style={{ pointerEvents: 'none' }}
                >
                  {pos.noteName}
                </text>
              )}
            </g>
          );
        })}

        {/* All possible positions (dimmed) */}
        {showAllPositions && (
          <AnimatePresence mode="sync">
            {allPositions
              .filter(
                (pos) =>
                  !resolvedPosition ||
                  pos.string !== resolvedPosition.string ||
                  pos.fret !== resolvedPosition.fret
              )
              .map((pos) => (
                <motion.circle
                  key={`possible-${pos.string}-${pos.fret}`}
                  cx={getFretX(pos.fret)}
                  cy={getStringY(pos.string)}
                  r={10}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 0.4, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.15 }}
                  fill="#6b7280"
                  stroke="#4b5563"
                  strokeWidth={2}
                />
              ))}
          </AnimatePresence>
        )}

        {/* Resolved position (highlighted) */}
        <AnimatePresence mode="sync">
          {resolvedPosition && (
            <motion.g
              key={`resolved-${resolvedPosition.string}-${resolvedPosition.fret}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* Glow effect */}
              <motion.circle
                cx={getFretX(resolvedPosition.fret)}
                cy={getStringY(resolvedPosition.string)}
                r={14}
                animate={{
                  opacity: [0.3, 0.5, 0.3],
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                fill={confidence === 'high' ? '#22c55e' : confidence === 'medium' ? '#eab308' : '#6b7280'}
              />
              {/* Main indicator */}
              <motion.circle
                cx={getFretX(resolvedPosition.fret)}
                cy={getStringY(resolvedPosition.string)}
                r={12}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.1, ease: 'easeOut' }}
                fill={confidence === 'high' ? '#22c55e' : confidence === 'medium' ? '#eab308' : '#6b7280'}
                style={{
                  filter: `drop-shadow(0 0 10px ${
                    confidence === 'high'
                      ? 'rgba(34, 197, 94, 0.8)'
                      : confidence === 'medium'
                      ? 'rgba(234, 179, 8, 0.6)'
                      : 'rgba(107, 114, 128, 0.4)'
                  })`,
                }}
              />
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
}
