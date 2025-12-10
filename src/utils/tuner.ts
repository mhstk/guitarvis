import type { NoteName } from './musicTheory';
import { midiToFrequency } from './musicTheory';

export interface TuningTarget {
  string: number;      // 1-6 (1 = high E, 6 = low E)
  note: NoteName;
  octave: number;
  midi: number;
  frequency: number;
  label: string;       // Display label like "E2"
}

// Standard tuning (EADGBE) - from low to high
export const STANDARD_TUNING: TuningTarget[] = [
  { string: 6, note: 'E', octave: 2, midi: 40, frequency: midiToFrequency(40), label: 'E2' },
  { string: 5, note: 'A', octave: 2, midi: 45, frequency: midiToFrequency(45), label: 'A2' },
  { string: 4, note: 'D', octave: 3, midi: 50, frequency: midiToFrequency(50), label: 'D3' },
  { string: 3, note: 'G', octave: 3, midi: 55, frequency: midiToFrequency(55), label: 'G3' },
  { string: 2, note: 'B', octave: 3, midi: 59, frequency: midiToFrequency(59), label: 'B3' },
  { string: 1, note: 'E', octave: 4, midi: 64, frequency: midiToFrequency(64), label: 'E4' },
];

// Thresholds for tuning status (in cents)
export const TUNING_THRESHOLDS = {
  inTune: 5,      // ±5 cents = in tune
  close: 15,     // ±15 cents = close
  // Beyond 15 = far off
};

export type TuningStatus = 'in-tune' | 'close' | 'flat' | 'sharp';

/**
 * Calculate cents deviation between detected frequency and target
 * Positive = sharp (too high), Negative = flat (too low)
 */
export function calculateCents(frequency: number, targetFrequency: number): number {
  return 1200 * Math.log2(frequency / targetFrequency);
}

/**
 * Find the closest string based on detected frequency
 * Returns the tuning target closest to the detected pitch
 */
export function findClosestString(frequency: number): TuningTarget | null {
  if (frequency <= 0) return null;

  let closest: TuningTarget | null = null;
  let minCentsDiff = Infinity;

  for (const target of STANDARD_TUNING) {
    const cents = Math.abs(calculateCents(frequency, target.frequency));
    if (cents < minCentsDiff) {
      minCentsDiff = cents;
      closest = target;
    }
  }

  // Only return if within reasonable range (±100 cents = 1 semitone)
  if (minCentsDiff > 100) return null;

  return closest;
}

/**
 * Get tuning status based on cents deviation
 */
export function getTuningStatus(cents: number): TuningStatus {
  const absCents = Math.abs(cents);

  if (absCents <= TUNING_THRESHOLDS.inTune) {
    return 'in-tune';
  } else if (absCents <= TUNING_THRESHOLDS.close) {
    return 'close';
  } else if (cents < 0) {
    return 'flat';
  } else {
    return 'sharp';
  }
}

/**
 * Get color based on tuning status
 */
export function getTuningColor(status: TuningStatus): string {
  switch (status) {
    case 'in-tune':
      return '#22c55e'; // green-500
    case 'close':
      return '#eab308'; // yellow-500
    case 'flat':
    case 'sharp':
      return '#ef4444'; // red-500
  }
}

/**
 * Format cents for display
 */
export function formatCents(cents: number): string {
  const rounded = Math.round(cents);
  if (rounded === 0) return '0';
  return rounded > 0 ? `+${rounded}` : `${rounded}`;
}
