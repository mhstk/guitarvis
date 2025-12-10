// Smoothing algorithm to reduce jitter in position tracking
export class PositionSmoother {
  private history: number[] = [];
  private maxHistory: number;

  constructor(maxHistory: number = 5) {
    this.maxHistory = maxHistory;
  }

  add(value: number): number {
    this.history.push(value);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    // Return average
    return this.history.reduce((a, b) => a + b, 0) / this.history.length;
  }

  reset(): void {
    this.history = [];
  }

  get isEmpty(): boolean {
    return this.history.length === 0;
  }
}

// MediaPipe landmark indices
export const WRIST_INDEX = 0;
export const INDEX_MCP = 5;    // Index finger base (knuckle)
export const INDEX_TIP = 8;
export const THUMB_TIP = 4;
export const MIDDLE_TIP = 12;
export const RING_TIP = 16;
export const PINKY_TIP = 20;

// Landmark connections for drawing hand skeleton
export const HAND_CONNECTIONS: [number, number][] = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index finger
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle finger
  [5, 9], [9, 10], [10, 11], [11, 12],
  // Ring finger
  [9, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [13, 17], [17, 18], [18, 19], [19, 20],
  // Palm
  [0, 17],
];

export interface Landmark {
  x: number;
  y: number;
  z: number;
}

// ============================================================
// POSITION GETTERS - Each returns X coordinate (normalized 0-1)
// ============================================================

// Wrist position (landmark 0)
export function getWristX(landmarks: Landmark[]): number {
  if (landmarks.length === 0) return 0.5;
  return landmarks[WRIST_INDEX].x;
}

// Index finger base/knuckle (landmark 5) - MCP joint
export function getIndexMcpX(landmarks: Landmark[]): number {
  if (landmarks.length === 0) return 0.5;
  return landmarks[INDEX_MCP].x;
}

// Index fingertip (landmark 8)
export function getIndexTipX(landmarks: Landmark[]): number {
  if (landmarks.length === 0) return 0.5;
  return landmarks[INDEX_TIP].x;
}

// Average of all 5 fingertips
export function getFingertipsAverageX(landmarks: Landmark[]): number {
  if (landmarks.length < 21) return 0.5;
  const tips = [THUMB_TIP, INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP];
  const sumX = tips.reduce((sum, tip) => sum + landmarks[tip].x, 0);
  return sumX / tips.length;
}

// ============================================================
// ACTIVE POSITION METHOD - Change this to switch detection mode
// Options: getWristX | getIndexMcpX | getIndexTipX | getFingertipsAverageX
// ============================================================
export const getHandPositionX = getIndexMcpX;
