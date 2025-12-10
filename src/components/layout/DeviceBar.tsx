import { motion } from 'framer-motion';
import { AudioSelector } from '../audio/AudioSelector';
import { LevelMeter } from '../audio/LevelMeter';
import { StatusIndicator } from '../audio/StatusIndicator';
import { CameraSelector } from '../vision/CameraSelector';
import { HandStatusIndicator } from '../vision/HandStatusIndicator';
import type { AudioDevice } from '../../hooks/useAudioDevices';
import type { CameraDevice } from '../../hooks/useCamera';
import type { ConnectionStatus } from '../../hooks/usePitchDetection';

interface DeviceBarProps {
  // Audio
  audioDevices: AudioDevice[];
  selectedAudioDeviceId: string | null;
  onAudioDeviceChange: (deviceId: string) => void;
  audioStatus: ConnectionStatus;
  inputLevel: number;
  isAudioStarted: boolean;
  onAudioToggle: () => void;
  audioDisabled: boolean;

  // Camera
  cameraDevices: CameraDevice[];
  selectedCameraDeviceId: string | null;
  onCameraDeviceChange: (deviceId: string) => void;

  // Hand detection
  isHandLoading: boolean;
  isHandDetecting: boolean;
  isCalibrated: boolean;
  handError?: string | null;

  // Calibration
  onCalibrate: () => void;

  // Tuner
  onTuner: () => void;
}

export function DeviceBar({
  audioDevices,
  selectedAudioDeviceId,
  onAudioDeviceChange,
  audioStatus,
  inputLevel,
  isAudioStarted,
  onAudioToggle,
  audioDisabled,
  cameraDevices,
  selectedCameraDeviceId,
  onCameraDeviceChange,
  isHandLoading,
  isHandDetecting,
  isCalibrated,
  handError,
  onCalibrate,
  onTuner,
}: DeviceBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
      className="card p-4 space-y-4"
    >
      {/* Audio row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500/80" />
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Audio</span>
        </div>
        <div className="divider" />
        <AudioSelector
          devices={audioDevices}
          selectedDeviceId={selectedAudioDeviceId}
          onDeviceChange={onAudioDeviceChange}
          disabled={isAudioStarted}
        />
        <motion.button
          onClick={onAudioToggle}
          disabled={audioDisabled}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
            ${
              isAudioStarted
                ? 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-500/20'
                : 'bg-accent-600 hover:bg-accent-500 shadow-lg shadow-accent-500/20'
            }
            disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none`}
        >
          {isAudioStarted ? 'Stop' : 'Start'}
        </motion.button>
        <motion.button
          onClick={onTuner}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium
                     transition-all duration-200 shadow-lg shadow-purple-500/20"
        >
          🎵 Tuner
        </motion.button>
        <LevelMeter level={inputLevel} isActive={isAudioStarted} />
        <StatusIndicator status={audioStatus} />
      </div>

      {/* Camera row */}
      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-surface-700/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500/80" />
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Camera</span>
        </div>
        <div className="divider" />
        <CameraSelector
          devices={cameraDevices}
          selectedDeviceId={selectedCameraDeviceId}
          onDeviceChange={onCameraDeviceChange}
        />
        <motion.button
          onClick={onCalibrate}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
            ${
              isCalibrated
                ? 'bg-surface-700 hover:bg-surface-600 text-gray-300'
                : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20'
            }`}
        >
          {isCalibrated ? '✓ Recalibrate' : 'Calibrate'}
        </motion.button>
        <HandStatusIndicator
          isLoading={isHandLoading}
          isDetecting={isHandDetecting}
          isCalibrated={isCalibrated}
          error={handError}
        />
      </div>
    </motion.div>
  );
}
