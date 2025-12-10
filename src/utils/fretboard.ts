import type { NoteName } from './musicTheory';

export interface GuitarString {
  string: number; // 1-6 (1 = high E, 6 = low E)
  openNote: NoteName;
  openMidi: number;
  name: string;
}

export interface FretPosition {
  string: number;
  fret: number;
}

// Standard guitar tuning (EADGBE)
export const GUITAR_STRINGS: GuitarString[] = [
  { string: 6, openNote: 'E', openMidi: 40, name: 'E2' },  // Low E
  { string: 5, openNote: 'A', openMidi: 45, name: 'A2' },
  { string: 4, openNote: 'D', openMidi: 50, name: 'D3' },
  { string: 3, openNote: 'G', openMidi: 55, name: 'G3' },
  { string: 2, openNote: 'B', openMidi: 59, name: 'B3' },
  { string: 1, openNote: 'E', openMidi: 64, name: 'E4' },  // High E
];

// Number of frets to display (0-24)
export const FRET_COUNT = 24;
export const DISPLAY_FRETS = 15;

// Frets with single dot markers
export const SINGLE_DOT_FRETS = [3, 5, 7, 9, 15, 17, 19, 21];

// Frets with double dot markers
export const DOUBLE_DOT_FRETS = [12, 24];

/**
 * Find all positions on the fretboard where a MIDI note can be played
 */
export function findPositions(midiNote: number, maxFret: number = FRET_COUNT): FretPosition[] {
  const positions: FretPosition[] = [];

  for (const guitarString of GUITAR_STRINGS) {
    const fret = midiNote - guitarString.openMidi;
    if (fret >= 0 && fret <= maxFret) {
      positions.push({
        string: guitarString.string,
        fret,
      });
    }
  }

  return positions;
}

/**
 * Get the MIDI note for a specific string and fret position
 */
export function getMidiForPosition(string: number, fret: number): number {
  const guitarString = GUITAR_STRINGS.find(s => s.string === string);
  if (!guitarString) return -1;
  return guitarString.openMidi + fret;
}

/**
 * Check if a fret has a marker dot
 */
export function hasFretMarker(fret: number): 'single' | 'double' | null {
  if (DOUBLE_DOT_FRETS.includes(fret)) return 'double';
  if (SINGLE_DOT_FRETS.includes(fret)) return 'single';
  return null;
}

/**
 * Get string name for display
 */
export function getStringName(stringNumber: number): string {
  const found = GUITAR_STRINGS.find(s => s.string === stringNumber);
  return found ? found.name : `String ${stringNumber}`;
}
