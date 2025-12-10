import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const toggleLeftHanded = useAppStore((s) => s.toggleLeftHanded);
  const resetCalibration = useAppStore((s) => s.resetCalibration);
  const isCalibrated = useAppStore((s) => s.isCalibrated());

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="card-elevated p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-surface-700/50">
              <h2 className="text-xl font-bold tracking-tight">Settings</h2>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-surface-700
                           transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            <div className="space-y-5">
              {/* Fret Tolerance */}
              <div>
                <label className="label mb-3 flex items-center justify-between">
                  <span>Fret Tolerance</span>
                  <span className="text-accent-500 font-semibold">+/- {settings.fretTolerance}</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={4}
                  value={settings.fretTolerance}
                  onChange={(e) =>
                    updateSettings({ fretTolerance: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Precise (+/-1)</span>
                  <span>Relaxed (+/-4)</span>
                </div>
              </div>

              {/* Toggle options */}
              <div className="space-y-3 pt-2">
                <ToggleOption
                  label="Left-handed mode"
                  description="Mirror fretboard orientation"
                  checked={settings.isLeftHanded}
                  onChange={toggleLeftHanded}
                />

                <ToggleOption
                  label="Show camera preview"
                  checked={settings.showCameraPreview}
                  onChange={(checked) => updateSettings({ showCameraPreview: checked })}
                />

                <ToggleOption
                  label="Show all positions"
                  description="Display all possible fret positions"
                  checked={settings.showAllPositions}
                  onChange={(checked) => updateSettings({ showAllPositions: checked })}
                />

                <ToggleOption
                  label="Show hand region"
                  description="Highlight detected hand area"
                  checked={settings.showHandRegion}
                  onChange={(checked) => updateSettings({ showHandRegion: checked })}
                />
              </div>

              {/* Reset calibration */}
              <div className="pt-4 border-t border-surface-700/50">
                <motion.button
                  onClick={resetCalibration}
                  disabled={!isCalibrated}
                  whileHover={{ scale: isCalibrated ? 1.01 : 1 }}
                  whileTap={{ scale: isCalibrated ? 0.99 : 1 }}
                  className="w-full px-4 py-2.5 bg-red-600/90 hover:bg-red-600 disabled:bg-surface-700
                             disabled:cursor-not-allowed rounded-lg font-medium text-white
                             transition-colors duration-200"
                >
                  Reset Calibration
                </motion.button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {isCalibrated
                    ? 'This will require you to recalibrate the camera.'
                    : 'No calibration to reset.'}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-surface-700/50 flex justify-end">
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2 bg-accent-600 hover:bg-accent-500 rounded-lg font-medium
                           transition-colors duration-200 shadow-lg shadow-accent-500/20"
              >
                Done
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Toggle option component
interface ToggleOptionProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleOption({ label, description, checked, onChange }: ToggleOptionProps) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer group py-1">
      <div>
        <span className="text-sm text-gray-200 group-hover:text-white transition-colors">
          {label}
        </span>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      <motion.button
        onClick={() => onChange(!checked)}
        className={`toggle ${checked ? 'bg-accent-600' : 'bg-surface-600'}`}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span
          className="toggle-thumb"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </motion.button>
    </label>
  );
}
