import type { NoteName } from './musicTheory';
import type { FretPosition } from './fretboard';
import { NOTE_NAMES } from './musicTheory';
import { GUITAR_STRINGS, FRET_COUNT } from './fretboard';

// Scale types - extensible for future scales
export type ScaleType = 'pentatonic_minor' | 'pentatonic_major' | 'major' | 'minor' | 'blues';

// Scale patterns (semitones from root)
export const SCALE_PATTERNS: Record<ScaleType, number[]> = {
  pentatonic_minor: [0, 3, 5, 7, 10],      // A minor pent: A, C, D, E, G
  pentatonic_major: [0, 2, 4, 7, 9],       // A major pent: A, B, C#, E, F#
  major: [0, 2, 4, 5, 7, 9, 11],           // A major: A, B, C#, D, E, F#, G#
  minor: [0, 2, 3, 5, 7, 8, 10],           // A minor: A, B, C, D, E, F, G
  blues: [0, 3, 5, 6, 7, 10],              // A blues: A, C, D, D#, E, G
};

// Scale display names
export const SCALE_DISPLAY_NAMES: Record<ScaleType, string> = {
  pentatonic_minor: 'Minor Pentatonic',
  pentatonic_major: 'Major Pentatonic',
  major: 'Major',
  minor: 'Minor',
  blues: 'Blues',
};

// Extended FretPosition with scale info
export interface ScalePosition extends FretPosition {
  noteName: NoteName;
  isRoot: boolean;
  midiNote: number;
}

/**
 * Get the chromatic index (0-11) for a note name
 */
export function getNoteIndex(noteName: NoteName): number {
  return NOTE_NAMES.indexOf(noteName);
}

/**
 * Get note name from chromatic index (0-11)
 */
export function getNoteName(index: number): NoteName {
  return NOTE_NAMES[((index % 12) + 12) % 12];
}

/**
 * Check if a MIDI note is the root note
 */
export function isRootNote(midiNote: number, rootNote: NoteName): boolean {
  return midiNote % 12 === getNoteIndex(rootNote);
}

/**
 * Check if a MIDI note belongs to a scale
 */
export function isInScale(midiNote: number, rootNote: NoteName, scaleType: ScaleType): boolean {
  const pattern = SCALE_PATTERNS[scaleType];
  const rootIndex = getNoteIndex(rootNote);
  const noteIndex = midiNote % 12;
  const interval = ((noteIndex - rootIndex) % 12 + 12) % 12;
  return pattern.includes(interval);
}

/**
 * Get all MIDI notes in a scale within a range
 */
export function getScaleMidiNotes(
  rootNote: NoteName,
  scaleType: ScaleType,
  minMidi: number = 40,
  maxMidi: number = 88
): number[] {
  const pattern = SCALE_PATTERNS[scaleType];
  const rootIndex = getNoteIndex(rootNote);
  const notes: number[] = [];

  for (let midi = minMidi; midi <= maxMidi; midi++) {
    const noteIndex = midi % 12;
    const interval = ((noteIndex - rootIndex) % 12 + 12) % 12;
    if (pattern.includes(interval)) {
      notes.push(midi);
    }
  }

  return notes;
}

/**
 * Get all scale positions on the fretboard
 */
export function getScalePositionsOnFretboard(
  rootNote: NoteName,
  scaleType: ScaleType,
  maxFret: number = FRET_COUNT
): ScalePosition[] {
  const positions: ScalePosition[] = [];
  const pattern = SCALE_PATTERNS[scaleType];
  const rootIndex = getNoteIndex(rootNote);

  for (const guitarString of GUITAR_STRINGS) {
    for (let fret = 0; fret <= maxFret; fret++) {
      const midiNote = guitarString.openMidi + fret;
      const noteIndex = midiNote % 12;
      const interval = ((noteIndex - rootIndex) % 12 + 12) % 12;

      if (pattern.includes(interval)) {
        positions.push({
          string: guitarString.string,
          fret,
          noteName: getNoteName(noteIndex),
          isRoot: interval === 0,
          midiNote,
        });
      }
    }
  }

  return positions;
}

/**
 * Get all available root notes for dropdown
 */
export function getAllRootNotes(): NoteName[] {
  return [...NOTE_NAMES];
}

/**
 * Get all available scale types for dropdown
 */
export function getAllScaleTypes(): ScaleType[] {
  return Object.keys(SCALE_PATTERNS) as ScaleType[];
}
