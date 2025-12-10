import type { CalibrationStep } from '../../store/useAppStore';
import type { Landmark } from '../../utils/handTracking';
import { CameraPreview } from './CameraPreview';

interface CalibrationWizardProps {
  stream: MediaStream | null;
  landmarks: Landmark[] | null;
  isDetecting: boolean;
  wristX: number | null;
  step: CalibrationStep;
  pickingBoundaryX: number | null;
  fret1X: number | null;
  fret12X: number | null;
  estimatedFret: number | null;
  onVideoRef: (video: HTMLVideoElement | null) => void;
  onCapturePickingZone: () => void;
  onCaptureFret1: () => void;
  onCaptureFret12: () => void;
  onRedo: () => void;
  onFinish: () => void;
}

export function CalibrationWizard({
  stream,
  landmarks,
  isDetecting,
  wristX,
  step,
  pickingBoundaryX,
  fret1X,
  fret12X,
  estimatedFret,
  onVideoRef,
  onCapturePickingZone,
  onCaptureFret1,
  onCaptureFret12,
  onRedo,
  onFinish,
}: CalibrationWizardProps) {
  const stepNumber =
    step === 'pickingZone' ? 1 :
    step === 'fret1' ? 2 :
    step === 'fret12' ? 3 : 4;

  const totalSteps = 4;

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">Calibration Wizard</h2>

        {/* Progress indicator */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex items-center">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${
                    n < stepNumber
                      ? 'bg-green-600 text-white'
                      : n === stepNumber
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
              >
                {n < stepNumber ? '✓' : n}
              </div>
              {n < totalSteps && (
                <div
                  className={`w-4 h-0.5 ${
                    n < stepNumber ? 'bg-green-600' : 'bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Camera feed - constrained height, maintain aspect ratio */}
          <div className="mb-4 flex justify-center">
        <div className="w-auto rounded-lg overflow-hidden">
        <CameraPreview
          stream={stream}
          landmarks={landmarks}
          onVideoRef={onVideoRef}
          mirrored={true}
        />

        </div>
      </div>

      {/* Step instructions */}
      <div className="mb-4">
        {step === 'pickingZone' && (
          <div className="text-center">
            <h3 className="font-semibold mb-1">Step 1: Mark Picking Hand Zone</h3>
            <p className="text-gray-400 text-sm mb-3">
              Position your <strong>picking hand</strong> over the guitar body where you strum.
            </p>
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="text-xs text-gray-500">
                Hand X: {wristX !== null ? wristX.toFixed(3) : '--'}
              </div>
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isDetecting ? 'bg-green-500' : 'bg-gray-500'
                }`}
              />
            </div>
            <button
              onClick={onCapturePickingZone}
              disabled={!isDetecting}
              className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600
                         disabled:cursor-not-allowed rounded-lg font-medium text-sm"
            >
              Capture Picking Zone
            </button>
          </div>
        )}

        {step === 'fret1' && (
          <div className="text-center">
            <h3 className="font-semibold mb-1">Step 2: Position at Fret 1</h3>
            <p className="text-gray-400 text-sm mb-3">
              Place your <strong>fretting hand</strong> at fret 1 (near the headstock).
            </p>
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="text-xs text-gray-500">
                Hand X: {wristX !== null ? wristX.toFixed(3) : '--'}
              </div>
              <div className="text-xs text-green-500">
                Picking: {pickingBoundaryX?.toFixed(3)}
              </div>
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isDetecting ? 'bg-green-500' : 'bg-gray-500'
                }`}
              />
            </div>
            <button
              onClick={onCaptureFret1}
              disabled={!isDetecting}
              className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600
                         disabled:cursor-not-allowed rounded-lg font-medium text-sm"
            >
              Capture Fret 1
            </button>
          </div>
        )}

        {step === 'fret12' && (
          <div className="text-center">
            <h3 className="font-semibold mb-1">Step 3: Position at Fret 12</h3>
            <p className="text-gray-400 text-sm mb-3">
              Move your fretting hand to fret 12 (the octave position).
            </p>
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="text-xs text-gray-500">
                Hand X: {wristX !== null ? wristX.toFixed(3) : '--'}
              </div>
              <div className="text-xs text-gray-500">
                Fret 1: {fret1X?.toFixed(3)}
              </div>
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isDetecting ? 'bg-green-500' : 'bg-gray-500'
                }`}
              />
            </div>
            <button
              onClick={onCaptureFret12}
              disabled={!isDetecting}
              className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600
                         disabled:cursor-not-allowed rounded-lg font-medium text-sm"
            >
              Capture Fret 12
            </button>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center">
            <h3 className="font-semibold mb-1 text-green-500">Calibration Complete!</h3>
            <p className="text-gray-400 text-sm mb-3">
              Test by moving your fretting hand. Picking hand zone will be ignored.
            </p>
            <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
              <div className="bg-gray-700 rounded p-2">
                <div className="text-gray-500">Picking</div>
                <div className="font-mono">{pickingBoundaryX?.toFixed(3)}</div>
              </div>
              <div className="bg-gray-700 rounded p-2">
                <div className="text-gray-500">Fret 1</div>
                <div className="font-mono">{fret1X?.toFixed(3)}</div>
              </div>
              <div className="bg-gray-700 rounded p-2">
                <div className="text-gray-500">Fret 12</div>
                <div className="font-mono">{fret12X?.toFixed(3)}</div>
              </div>
            </div>
            {estimatedFret !== null && (
              <div className="text-xl font-bold text-green-400 mb-3">
                Estimated Fret: {estimatedFret}
              </div>
            )}
            <div className="flex justify-center gap-3">
              <button
                onClick={onRedo}
                className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium text-sm"
              >
                Redo
              </button>
              <button
                onClick={onFinish}
                className="px-5 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg font-medium text-sm"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
