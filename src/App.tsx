import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from './store/useAppStore';
import { useAudioDevices } from './hooks/useAudioDevices';
import { usePitchDetection } from './hooks/usePitchDetection';
import { useCamera } from './hooks/useCamera';
import { useHandDetection } from './hooks/useHandDetection';

import { Header } from './components/layout/Header';
import { DeviceBar } from './components/layout/DeviceBar';
import { PracticeBar } from './components/practice/PracticeBar';
import { NoteDisplay } from './components/audio/NoteDisplay';
import { CameraPreview } from './components/vision/CameraPreview';
import { CalibrationWizard } from './components/vision/CalibrationWizard';
import { Fretboard } from './components/fretboard/Fretboard';
import { ResolvedDisplay } from './components/combined/ResolvedDisplay';
import { ConfidenceIndicator } from './components/combined/ConfidenceIndicator';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { Tuner } from './components/tuner/Tuner';

function App() {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [isAudioStarted, setIsAudioStarted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Store state
  const audio = useAppStore((s) => s.audio);
  const vision = useAppStore((s) => s.vision);
  useAppStore((s) => s.calibration); // Keep subscription active
  const calibrationStep = useAppStore((s) => s.calibrationStep);
  const pickingBoundaryX = useAppStore((s) => s.pickingBoundaryX);
  const fret1X = useAppStore((s) => s.fret1X);
  const fret12X = useAppStore((s) => s.fret12X);
  const settings = useAppStore((s) => s.settings);
  const isCalibrated = useAppStore((s) => s.isCalibrated());
  const getResolvedPosition = useAppStore((s) => s.getResolvedPosition);
  const getFretRange = useAppStore((s) => s.getFretRange);
  const getScalePositions = useAppStore((s) => s.getScalePositions);
  const tunerOpen = useAppStore((s) => s.tunerOpen);
  const openTuner = useAppStore((s) => s.openTuner);
  const closeTuner = useAppStore((s) => s.closeTuner);

  // Store actions
  const startCalibration = useAppStore((s) => s.startCalibration);
  const capturePickingZone = useAppStore((s) => s.capturePickingZone);
  const captureFret1 = useAppStore((s) => s.captureFret1);
  const captureFret12 = useAppStore((s) => s.captureFret12);
  const finishCalibration = useAppStore((s) => s.finishCalibration);

  // Audio hooks
  const audioDevices = useAudioDevices();
  const pitchDetection = usePitchDetection();

  // Camera hooks
  const camera = useCamera();
  const handDetection = useHandDetection(videoElement);

  // Start camera when device is selected
  useEffect(() => {
    if (camera.selectedDeviceId && !camera.stream) {
      camera.startStream(camera.selectedDeviceId);
    }
  }, [camera.selectedDeviceId, camera.stream, camera.startStream]);

  // Handle audio start/stop
  const handleAudioToggle = useCallback(async () => {
    if (isAudioStarted) {
      pitchDetection.stopListening();
      setIsAudioStarted(false);
    } else {
      if (audioDevices.permissionState !== 'granted') {
        const granted = await audioDevices.requestPermission();
        if (!granted) return;
      }

      if (audioDevices.selectedDeviceId) {
        await pitchDetection.startListening(audioDevices.selectedDeviceId);
        setIsAudioStarted(true);
      }
    }
  }, [isAudioStarted, audioDevices, pitchDetection]);

  // Restart audio when device changes
  useEffect(() => {
    if (isAudioStarted && audioDevices.selectedDeviceId) {
      pitchDetection.startListening(audioDevices.selectedDeviceId);
    }
  }, [audioDevices.selectedDeviceId]);

  // Handle camera device change
  const handleCameraDeviceChange = useCallback(
    async (deviceId: string) => {
      await camera.selectDevice(deviceId);
    },
    [camera]
  );

  // Handle calibration capture
  const handleCapturePickingZone = useCallback(() => {
    if (vision.smoothedWristX !== null) {
      capturePickingZone(vision.smoothedWristX);
    }
  }, [vision.smoothedWristX, capturePickingZone]);

  const handleCaptureFret1 = useCallback(() => {
    if (vision.smoothedWristX !== null) {
      captureFret1(vision.smoothedWristX);
    }
  }, [vision.smoothedWristX, captureFret1]);

  const handleCaptureFret12 = useCallback(() => {
    if (vision.smoothedWristX !== null) {
      captureFret12(vision.smoothedWristX);
    }
  }, [vision.smoothedWristX, captureFret12]);

  // Get resolved position
  const resolved = getResolvedPosition();
  const fretRange = getFretRange();

  // Check if in calibration mode
  const isCalibrating = calibrationStep !== 'none';

  return (
    <div className="min-h-screen bg-surface-950 text-white p-4 md:p-6">
      <div className="max-w-[1800px] mx-auto">
        <Header onSettingsClick={() => setShowSettings(true)} />

        <AnimatePresence mode="wait">
          {tunerOpen ? (
            <motion.div
              key="tuner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Tuner
                onClose={closeTuner}
                isAudioStarted={isAudioStarted}
                onStartAudio={handleAudioToggle}
              />
            </motion.div>
          ) : isCalibrating ? (
            <motion.div
              key="calibration"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CalibrationWizard
                stream={camera.stream}
                landmarks={vision.landmarks}
                isDetecting={vision.handDetected}
                wristX={vision.smoothedWristX}
                step={calibrationStep}
                pickingBoundaryX={pickingBoundaryX}
                fret1X={fret1X}
                fret12X={fret12X}
                estimatedFret={isCalibrated ? vision.estimatedFret : null}
                onVideoRef={setVideoElement}
                onCapturePickingZone={handleCapturePickingZone}
                onCaptureFret1={handleCaptureFret1}
                onCaptureFret12={handleCaptureFret12}
                onRedo={startCalibration}
                onFinish={finishCalibration}
              />
            </motion.div>
          ) : (
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Device Bar */}
              <DeviceBar
                audioDevices={audioDevices.devices}
                selectedAudioDeviceId={audioDevices.selectedDeviceId}
                onAudioDeviceChange={audioDevices.setSelectedDeviceId}
                audioStatus={pitchDetection.status}
                inputLevel={audio.inputLevel}
                isAudioStarted={isAudioStarted}
                onAudioToggle={handleAudioToggle}
                audioDisabled={!audioDevices.selectedDeviceId && !isAudioStarted}
                cameraDevices={camera.devices}
                selectedCameraDeviceId={camera.selectedDeviceId}
                onCameraDeviceChange={handleCameraDeviceChange}
                isHandLoading={handDetection.isLoading}
                isHandDetecting={vision.handDetected}
                isCalibrated={isCalibrated}
                handError={handDetection.error}
                onCalibrate={startCalibration}
                onTuner={openTuner}
              />

              {/* Practice Bar */}
              <PracticeBar />

              {/* Main content - Fretboard first, full width */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="card p-5"
              >
                <Fretboard
                  resolvedPosition={resolved.position}
                  allPositions={resolved.allMatches}
                  handRegion={
                    isCalibrated && vision.smoothedWristX !== null && settings.showHandRegion
                      ? fretRange
                      : null
                  }
                  confidence={isCalibrated ? resolved.confidence : 'low'}
                  showAllPositions={!isCalibrated || settings.showAllPositions}
                  showHandRegion={isCalibrated && settings.showHandRegion}
                  scalePositions={settings.practiceEnabled ? getScalePositions() : undefined}
                  showNoteLabels={settings.showNoteLabels}
                  showRootHints={settings.showRootHints}
                />
                {/* Legend - inline with fretboard */}
                <div className="mt-4 pt-4 border-t border-surface-700/50 flex flex-wrap items-center justify-center gap-5 text-xs text-gray-400">
                  {isCalibrated ? (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-accent-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        <span>High confidence</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_6px_rgba(234,179,8,0.5)]" />
                        <span>Medium</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-surface-500 border border-surface-400" />
                        <span>Possible</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-3 rounded border border-dashed border-blue-400 bg-blue-500/20" />
                        <span>Hand region</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-accent-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        <span>Detected note</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-surface-500 border border-surface-400" />
                        <span>All positions</span>
                      </div>
                      <span className="text-yellow-500/90 font-medium">
                        Calibrate camera for hand tracking
                      </span>
                    </>
                  )}
                </div>
              </motion.div>

              {/* Controls row - Note, Position, Camera in a horizontal layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Note display */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="card p-4"
                >
                  <NoteDisplay note={audio.currentNote} />
                </motion.div>

                {/* Resolved position + Confidence */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.45, ease: [0.4, 0, 0.2, 1] }}
                  className="card p-4"
                >
                  <ResolvedDisplay result={resolved} />
                  <div className="mt-4 pt-3 border-t border-surface-700/50 flex justify-center">
                    <ConfidenceIndicator confidence={isCalibrated ? resolved.confidence : 'low'} />
                  </div>
                  {!isCalibrated && audio.possiblePositions.length > 0 && (
                    <div className="mt-2 text-center text-xs text-gray-500">
                      Showing {audio.possiblePositions.length} possible position{audio.possiblePositions.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </motion.div>

                {/* Camera preview */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  className="card p-4"
                >
                  {settings.showCameraPreview ? (
                    <>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                        Camera Preview
                      </div>
                      <CameraPreview
                        stream={camera.stream}
                        landmarks={vision.landmarks}
                        onVideoRef={setVideoElement}
                        mirrored={true}
                        compact={true}
                      />
                      {isCalibrated && vision.smoothedWristX !== null && (
                        <div className="mt-3 text-center text-sm">
                          <span className="text-gray-400">Est. Fret: </span>
                          <span className={`font-bold ${vision.handDetected ? 'text-accent-400' : 'text-yellow-400'}`}>
                            {vision.estimatedFret}
                          </span>
                          {!vision.handDetected && (
                            <span className="text-gray-500 text-xs ml-1">(last known)</span>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <p className="text-sm">Camera preview hidden</p>
                      <p className="text-xs mt-1 text-gray-600">Enable in settings</p>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Panel */}
        <SettingsPanel
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </div>
    </div>
  );
}

export default App;
