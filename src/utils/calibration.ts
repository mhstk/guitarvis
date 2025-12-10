// Calibration data structure
export interface Calibration {
  fret1X: number;        // Hand X position at fret 1 (normalized 0-1)
  fret12X: number;       // Hand X position at fret 12 (normalized 0-1)
  pickingBoundaryX: number; // X position boundary for picking hand exclusion zone
  isLeftHanded: boolean;
  timestamp: number;
}

const CALIBRATION_STORAGE_KEY = 'guitarvis-combined-calibration';

// Save calibration to localStorage
export function saveCalibration(calibration: Calibration): void {
  localStorage.setItem(CALIBRATION_STORAGE_KEY, JSON.stringify(calibration));
}

// Load calibration from localStorage
export function loadCalibration(): Calibration | null {
  const stored = localStorage.getItem(CALIBRATION_STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as Calibration;
  } catch {
    return null;
  }
}

// Clear calibration from localStorage
export function clearCalibration(): void {
  localStorage.removeItem(CALIBRATION_STORAGE_KEY);
}

// Estimate fret position from hand X coordinate
export function estimateFret(handX: number, calibration: Calibration): number {
  const { fret1X, fret12X, isLeftHanded } = calibration;

  // Normalize position between fret 1 and fret 12
  let ratio = (handX - fret1X) / (fret12X - fret1X);

  // Handle left-handed (reversed)
  if (isLeftHanded) {
    ratio = 1 - ratio;
  }

  // Map to fret number (1-12 for calibrated range, extrapolate beyond)
  const fret = Math.round(ratio * 11) + 1;

  // Clamp to reasonable range (0-24)
  return Math.max(0, Math.min(24, fret));
}

// Get the direction string for display
export function getCalibrationDirection(calibration: Calibration): string {
  const leftToRight = calibration.fret1X < calibration.fret12X;
  if (calibration.isLeftHanded) {
    return leftToRight ? 'Right -> Left (left-handed)' : 'Left -> Right (left-handed)';
  }
  return leftToRight ? 'Left -> Right (right-handed)' : 'Right -> Left (right-handed)';
}

// Check if calibration seems valid
export function isCalibrationValid(calibration: Calibration): boolean {
  // Ensure positions are different enough
  const diff = Math.abs(calibration.fret12X - calibration.fret1X);
  return diff > 0.1; // At least 10% of frame width difference
}

// Check if a hand position is in the valid detection zone (not in picking zone)
export function isInDetectionZone(handX: number, calibration: Calibration): boolean {
  const { fret1X, fret12X, pickingBoundaryX } = calibration;

  // Determine which side is the neck vs picking zone
  // The neck zone is between fret1 and fret12
  // The picking zone is on the opposite side of the picking boundary
  const neckMinX = Math.min(fret1X, fret12X);
  const neckMaxX = Math.max(fret1X, fret12X);

  // If picking boundary is to the right of the neck, exclude hands to its right
  // If picking boundary is to the left of the neck, exclude hands to its left
  if (pickingBoundaryX > neckMaxX) {
    // Picking zone is on the right - valid zone is left of the boundary
    // Add a small margin from the neck to the boundary for tolerance
    const validMaxX = pickingBoundaryX - 0.02; // 2% margin
    return handX <= validMaxX;
  } else if (pickingBoundaryX < neckMinX) {
    // Picking zone is on the left - valid zone is right of the boundary
    const validMinX = pickingBoundaryX + 0.02; // 2% margin
    return handX >= validMinX;
  }

  // If picking boundary is within neck range (unusual), just use neck bounds
  return handX >= neckMinX - 0.05 && handX <= neckMaxX + 0.05;
}

// Get the valid detection zone boundaries
export function getDetectionZone(calibration: Calibration): { minX: number; maxX: number } {
  const { fret1X, fret12X, pickingBoundaryX } = calibration;

  const neckMinX = Math.min(fret1X, fret12X);
  const neckMaxX = Math.max(fret1X, fret12X);

  if (pickingBoundaryX > neckMaxX) {
    // Picking zone is on the right
    return { minX: 0, maxX: pickingBoundaryX - 0.02 };
  } else if (pickingBoundaryX < neckMinX) {
    // Picking zone is on the left
    return { minX: pickingBoundaryX + 0.02, maxX: 1 };
  }

  // Fallback - use full range with small margins
  return { minX: neckMinX - 0.05, maxX: neckMaxX + 0.05 };
}
