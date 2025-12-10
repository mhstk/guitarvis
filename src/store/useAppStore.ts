import { create } from 'zustand';
import type { NoteInfo, NoteName } from '../utils/musicTheory';
import type { FretPosition } from '../utils/fretboard';
import type { Calibration } from '../utils/calibration';
import type { Landmark } from '../utils/handTracking';
import { resolvePosition, type ResolvedPosition } from '../utils/positionResolver';
import { findPositions, DISPLAY_FRETS } from '../utils/fretboard';
import { loadCalibration, saveCalibration as persistCalibration } from '../utils/calibration';
import { getScalePositionsOnFretboard, type ScalePosition, type ScaleType } from '../utils/scales';

export type CalibrationStep = 'none' | 'pickingZone' | 'fret1' | 'fret12' | 'complete';

export interface AppStore {
  // Audio state
  audio: {
    isListening: boolean;
    deviceId: string | null;
    currentNote: NoteInfo | null;
    possiblePositions: FretPosition[];
    inputLevel: number;
    clarity: number;
  };
  setAudioState: (state: Partial<AppStore['audio']>) => void;
  setAudioDevice: (deviceId: string | null) => void;

  // Vision state
  vision: {
    isTracking: boolean;
    deviceId: string | null;
    handDetected: boolean;
    landmarks: Landmark[] | null;
    estimatedFret: number;
    smoothedWristX: number | null;
    isLoading: boolean;
  };
  setVisionState: (state: Partial<AppStore['vision']>) => void;
  setVisionDevice: (deviceId: string | null) => void;

  // Calibration state
  calibration: Calibration | null;
  calibrationStep: CalibrationStep;
  pickingBoundaryX: number | null;
  fret1X: number | null;
  fret12X: number | null;
  setCalibration: (cal: Calibration | null) => void;
  startCalibration: () => void;
  capturePickingZone: (xPosition: number) => void;
  captureFret1: (xPosition: number) => void;
  captureFret12: (xPosition: number) => void;
  finishCalibration: () => void;
  resetCalibration: () => void;

  // Settings
  settings: {
    isLeftHanded: boolean;
    fretTolerance: number;
    showCameraPreview: boolean;
    showAllPositions: boolean;
    showHandRegion: boolean;
    // Practice settings
    practiceEnabled: boolean;
    practiceRootNote: NoteName;
    practiceScaleType: ScaleType;
    showNoteLabels: boolean;
    showRootHints: boolean;
  };
  updateSettings: (settings: Partial<AppStore['settings']>) => void;
  toggleLeftHanded: () => void;

  // Practice computed
  getScalePositions: () => ScalePosition[];

  // Computed: resolved position (derived from audio + vision)
  getResolvedPosition: () => ResolvedPosition;

  // Computed: is calibrated
  isCalibrated: () => boolean;

  // Computed: fret range from vision
  getFretRange: () => { min: number; max: number };

  // Tuner state
  tunerOpen: boolean;
  openTuner: () => void;
  closeTuner: () => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Audio state
  audio: {
    isListening: false,
    deviceId: localStorage.getItem('guitarvis-audio-device'),
    currentNote: null,
    possiblePositions: [],
    inputLevel: 0,
    clarity: 0,
  },
  setAudioState: (state) =>
    set((prev) => {
      const newAudio = { ...prev.audio, ...state };
      // Update possible positions when note changes
      if (state.currentNote !== undefined) {
        newAudio.possiblePositions = state.currentNote
          ? findPositions(state.currentNote.midiNote)
          : [];
      }
      return { audio: newAudio };
    }),
  setAudioDevice: (deviceId) => {
    if (deviceId) {
      localStorage.setItem('guitarvis-audio-device', deviceId);
    }
    set((prev) => ({ audio: { ...prev.audio, deviceId } }));
  },

  // Vision state
  vision: {
    isTracking: false,
    deviceId: localStorage.getItem('guitarvis-camera-device'),
    handDetected: false,
    landmarks: null,
    estimatedFret: 0,
    smoothedWristX: null,
    isLoading: true,
  },
  setVisionState: (state) =>
    set((prev) => ({ vision: { ...prev.vision, ...state } })),
  setVisionDevice: (deviceId) => {
    if (deviceId) {
      localStorage.setItem('guitarvis-camera-device', deviceId);
    }
    set((prev) => ({ vision: { ...prev.vision, deviceId } }));
  },

  // Calibration state
  calibration: loadCalibration(),
  calibrationStep: 'none',
  pickingBoundaryX: null,
  fret1X: null,
  fret12X: null,

  setCalibration: (cal) => {
    if (cal) {
      persistCalibration(cal);
    }
    set({ calibration: cal });
  },

  startCalibration: () => set({
    calibrationStep: 'pickingZone',
    pickingBoundaryX: null,
    fret1X: null,
    fret12X: null,
  }),

  capturePickingZone: (xPosition) => set({
    pickingBoundaryX: xPosition,
    calibrationStep: 'fret1',
  }),

  captureFret1: (xPosition) => set({
    fret1X: xPosition,
    calibrationStep: 'fret12',
  }),

  captureFret12: (xPosition) => {
    const { fret1X, pickingBoundaryX, settings } = get();
    if (fret1X === null || pickingBoundaryX === null) return;

    const calibration: Calibration = {
      fret1X,
      fret12X: xPosition,
      pickingBoundaryX,
      isLeftHanded: settings.isLeftHanded,
      timestamp: Date.now(),
    };

    // Validate calibration
    const diff = Math.abs(calibration.fret12X - calibration.fret1X);
    if (diff > 0.1) {
      persistCalibration(calibration);
      set({
        fret12X: xPosition,
        calibration,
        calibrationStep: 'complete',
      });
    } else {
      // Invalid calibration, restart from fret1
      set({
        calibrationStep: 'fret1',
        fret1X: null,
        fret12X: null,
      });
    }
  },

  finishCalibration: () => set({ calibrationStep: 'none' }),

  resetCalibration: () => {
    localStorage.removeItem('guitarvis-combined-calibration');
    set({
      calibration: null,
      calibrationStep: 'none',
      pickingBoundaryX: null,
      fret1X: null,
      fret12X: null,
    });
  },

  // Settings
  settings: {
    isLeftHanded: false,
    fretTolerance: 2,
    showCameraPreview: true,
    showAllPositions: false,
    showHandRegion: true,
    // Practice settings
    practiceEnabled: false,
    practiceRootNote: 'A' as NoteName,
    practiceScaleType: 'pentatonic_minor' as ScaleType,
    showNoteLabels: true,
    showRootHints: true,
  },
  updateSettings: (settings) =>
    set((prev) => ({ settings: { ...prev.settings, ...settings } })),
  toggleLeftHanded: () =>
    set((prev) => {
      const newIsLeftHanded = !prev.settings.isLeftHanded;
      // Update calibration if it exists
      if (prev.calibration) {
        const updatedCalibration: Calibration = {
          ...prev.calibration,
          isLeftHanded: newIsLeftHanded,
        };
        persistCalibration(updatedCalibration);
        return {
          settings: { ...prev.settings, isLeftHanded: newIsLeftHanded },
          calibration: updatedCalibration,
        };
      }
      return {
        settings: { ...prev.settings, isLeftHanded: newIsLeftHanded },
      };
    }),

  // Computed: resolved position
  getResolvedPosition: () => {
    const { audio, vision, settings } = get();
    return resolvePosition(
      {
        midiNote: audio.currentNote?.midiNote ?? null,
        possiblePositions: audio.possiblePositions,
      },
      {
        handDetected: vision.handDetected,
        estimatedFret: vision.estimatedFret,
        tolerance: settings.fretTolerance,
      }
    );
  },

  // Computed: is calibrated
  isCalibrated: () => {
    const { calibration } = get();
    return calibration !== null;
  },

  // Computed: fret range from vision
  // Asymmetric tolerance: pinky can stretch towards higher frets, but index can't stretch back
  getFretRange: () => {
    const { vision, settings } = get();
    const { estimatedFret } = vision;
    const { fretTolerance, isLeftHanded } = settings;

    // Index side (towards lower frets): minimal stretch capability
    const indexTolerance = Math.max(1, Math.floor(fretTolerance * 0.5));
    // Pinky side (towards higher frets): can stretch further
    const pinkyTolerance = fretTolerance + 1;

    // For left-handed players, the stretch directions are reversed
    const lowTolerance = isLeftHanded ? pinkyTolerance : indexTolerance;
    // const lowTolerance = 0;
    const highTolerance = isLeftHanded ? indexTolerance : pinkyTolerance;

    return {
      min: Math.max(0, estimatedFret - lowTolerance),
      max: Math.min(24, estimatedFret + highTolerance),
    };
  },

  // Computed: scale positions for practice mode
  getScalePositions: () => {
    const { settings } = get();
    const { practiceRootNote, practiceScaleType } = settings;
    return getScalePositionsOnFretboard(practiceRootNote, practiceScaleType, DISPLAY_FRETS);
  },

  // Tuner state
  tunerOpen: false,
  openTuner: () => set({ tunerOpen: true }),
  closeTuner: () => set({ tunerOpen: false }),
}));
