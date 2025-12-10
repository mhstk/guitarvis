import type { FretPosition } from './fretboard';
import { findPositions } from './fretboard';

export interface AudioData {
  midiNote: number | null;
  possiblePositions: FretPosition[];
}

export interface VisionData {
  handDetected: boolean;
  estimatedFret: number;
  tolerance: number; // +/- N frets
}

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'none';

export interface ResolvedPosition {
  position: FretPosition | null;
  confidence: ConfidenceLevel;
  allMatches: FretPosition[];
  reasoning: string;
}

/**
 * Resolves the most likely fret position by combining audio pitch detection
 * with visual hand position estimation.
 */
export function resolvePosition(audio: AudioData, vision: VisionData): ResolvedPosition {
  // No note detected
  if (audio.midiNote === null || audio.possiblePositions.length === 0) {
    return {
      position: null,
      confidence: 'none',
      allMatches: [],
      reasoning: 'No note detected',
    };
  }

  // No hand detected - show all positions
  if (!vision.handDetected) {
    return {
      position: null,
      confidence: 'low',
      allMatches: audio.possiblePositions,
      reasoning: 'Hand not detected - showing all possible positions',
    };
  }

  // Filter positions by hand region
  const { estimatedFret, tolerance } = vision;
  const minFret = estimatedFret - tolerance;
  const maxFret = estimatedFret + tolerance;

  const matchingPositions = audio.possiblePositions.filter(
    (pos) => pos.fret >= minFret && pos.fret <= maxFret
  );

  // Exact match - single position
  if (matchingPositions.length === 1) {
    return {
      position: matchingPositions[0],
      confidence: 'high',
      allMatches: matchingPositions,
      reasoning: `Matched: fret ${matchingPositions[0].fret} within hand region ${minFret}-${maxFret}`,
    };
  }

  // Multiple matches - pick closest to estimated fret
  if (matchingPositions.length > 1) {
    const closest = [...matchingPositions].sort(
      (a, b) => Math.abs(a.fret - estimatedFret) - Math.abs(b.fret - estimatedFret)
    )[0];

    return {
      position: closest,
      confidence: 'medium',
      allMatches: matchingPositions,
      reasoning: `Multiple matches in region, closest to fret ${estimatedFret}`,
    };
  }

  // No matches in region - hand position might be wrong
  return {
    position: null,
    confidence: 'low',
    allMatches: audio.possiblePositions,
    reasoning: `No positions match hand region ${minFret}-${maxFret}`,
  };
}

/**
 * Get possible positions for a MIDI note with all match information
 */
export function getPositionsForNote(midiNote: number | null): FretPosition[] {
  if (midiNote === null) return [];
  return findPositions(midiNote);
}
