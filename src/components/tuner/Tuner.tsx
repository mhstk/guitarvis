import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { TuningMeter } from './TuningMeter';
import {
  STANDARD_TUNING,
  calculateCents,
  findClosestString,
  formatCents,
  getTuningStatus,
  getTuningColor,
} from '../../utils/tuner';
import { formatNote } from '../../utils/musicTheory';

interface TunerProps {
  onClose: () => void;
  isAudioStarted: boolean;
  onStartAudio: () => void;
}

export function Tuner({ onClose, isAudioStarted, onStartAudio }: TunerProps) {
  const audio = useAppStore((s) => s.audio);
  const { currentNote, inputLevel } = audio;

  // Find closest string to current note
  const closestString = useMemo(() => {
    if (!currentNote) return null;
    return findClosestString(currentNote.frequency);
  }, [currentNote]);

  // Calculate cents deviation
  const cents = useMemo(() => {
    if (!currentNote || !closestString) return 0;
    return calculateCents(currentNote.frequency, closestString.frequency);
  }, [currentNote, closestString]);

  const isActive = currentNote !== null && closestString !== null;
  const status = isActive ? getTuningStatus(cents) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="card p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-700/50">
        <motion.button
          onClick={onClose}
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </motion.button>
        <h2 className="text-xl font-bold tracking-tight">
          <span className="text-purple-400">🎵</span> Guitar Tuner
        </h2>
        <div className="w-16" />
      </div>

      {/* Audio not started warning */}
      <AnimatePresence>
        {!isAudioStarted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-5 mb-6 text-center overflow-hidden"
          >
            <p className="text-yellow-400 mb-4 text-sm">Audio input required for tuner</p>
            <motion.button
              onClick={onStartAudio}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-5 py-2.5 bg-accent-600 hover:bg-accent-500 rounded-lg font-medium text-sm
                         shadow-lg shadow-accent-500/20 transition-colors"
            >
              Start Audio
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* String selector */}
      <div className="flex justify-center gap-2 mb-8">
        {STANDARD_TUNING.map((target, index) => {
          const isDetected = closestString?.string === target.string;
          const stringStatus = isDetected && isActive ? status : null;
          const borderColor = stringStatus ? getTuningColor(stringStatus) : 'transparent';

          return (
            <motion.div
              key={target.string}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              className={`relative flex flex-col items-center p-3 rounded-xl transition-all cursor-default ${
                isDetected
                  ? 'bg-surface-700 shadow-lg'
                  : 'bg-surface-800/50 hover:bg-surface-700/50'
              }`}
              style={{
                borderWidth: 2,
                borderColor,
                boxShadow: isDetected && stringStatus
                  ? `0 0 20px ${getTuningColor(stringStatus)}40`
                  : undefined
              }}
            >
              <span className="text-[10px] text-gray-500 font-medium mb-1">{target.string}</span>
              <span className={`text-xl font-bold ${isDetected ? 'text-white' : 'text-gray-400'}`}>
                {target.note}
              </span>
              <span className="text-[10px] text-gray-500 font-mono mt-1">
                {target.frequency.toFixed(0)}Hz
              </span>

              {/* Active indicator */}
              {isDetected && isActive && (
                <motion.div
                  layoutId="activeString"
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                  style={{ backgroundColor: getTuningColor(status!) }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Tuning meter */}
      <div className="flex justify-center mb-6">
        <TuningMeter cents={cents} isActive={isActive} />
      </div>

      {/* Current note display */}
      <div className="text-center mb-6">
        <AnimatePresence mode="wait">
          {currentNote ? (
            <motion.div
              key={currentNote.noteName + currentNote.octave}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              <motion.div
                className="text-6xl font-bold"
                style={{ color: status ? getTuningColor(status) : '#fff' }}
                animate={status === 'in-tune' ? {
                  textShadow: [
                    '0 0 20px rgba(34, 197, 94, 0.4)',
                    '0 0 40px rgba(34, 197, 94, 0.6)',
                    '0 0 20px rgba(34, 197, 94, 0.4)',
                  ],
                } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {formatNote(currentNote.noteName, currentNote.octave)}
              </motion.div>
              <div className="text-lg text-gray-400 font-mono">
                {currentNote.frequency.toFixed(1)} Hz
              </div>
              {closestString && (
                <div
                  className="text-base font-medium"
                  style={{ color: status ? getTuningColor(status) : '#9ca3af' }}
                >
                  {formatCents(cents)} cents
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2 py-4"
            >
              <div className="text-5xl font-bold text-gray-600">--</div>
              <div className="text-gray-500 text-sm">Play a string...</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Target info */}
      <AnimatePresence>
        {closestString && isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-sm text-gray-500 mb-4"
          >
            Target: <span className="text-gray-400">{closestString.label}</span>{' '}
            <span className="font-mono">({closestString.frequency.toFixed(2)} Hz)</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input level indicator */}
      <div className="flex items-center justify-center gap-3 pt-4 border-t border-surface-700/50">
        <span className="text-xs text-gray-500 uppercase tracking-wide">Input</span>
        <div className="w-40 h-2 bg-surface-900 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, #22c55e ${Math.min(100, inputLevel * 100)}%, #22c55e00 ${Math.min(100, inputLevel * 100)}%)`
            }}
            animate={{ width: `${Math.min(100, inputLevel * 100)}%` }}
            transition={{ duration: 0.05 }}
          />
        </div>
      </div>
    </motion.div>
  );
}
