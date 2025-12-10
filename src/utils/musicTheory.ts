// Note names in chromatic scale
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

export type NoteName = typeof NOTE_NAMES[number];

export interface NoteInfo {
  midiNote: number;
  noteName: NoteName;
  octave: number;
  frequency: number;
}

/**
 * Convert frequency (Hz) to MIDI note number
 * A4 = 440Hz = MIDI 69
 */
export function frequencyToMidi(frequency: number): number {
  return Math.round(12 * Math.log2(frequency / 440) + 69);
}

/**
 * Convert MIDI note number to frequency (Hz)
 */
export function midiToFrequency(midiNote: number): number {
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

/**
 * Get note name from MIDI note number
 */
export function midiToNoteName(midiNote: number): NoteName {
  return NOTE_NAMES[midiNote % 12];
}

/**
 * Get octave from MIDI note number
 */
export function midiToOctave(midiNote: number): number {
  return Math.floor(midiNote / 12) - 1;
}

/**
 * Get complete note info from frequency
 */
export function frequencyToNoteInfo(frequency: number): NoteInfo {
  const midiNote = frequencyToMidi(frequency);
  return {
    midiNote,
    noteName: midiToNoteName(midiNote),
    octave: midiToOctave(midiNote),
    frequency,
  };
}

/**
 * Format note as string (e.g., "A4", "C#3")
 */
export function formatNote(noteName: NoteName, octave: number): string {
  return `${noteName}${octave}`;
}

/**
 * Check if a frequency is within the typical guitar range
 * Low E (E2) = ~82Hz, High E (24th fret, E6) = ~1319Hz
 */
export function isGuitarRange(frequency: number): boolean {
  return frequency >= 75 && frequency <= 1400;
}
