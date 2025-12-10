import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { getAllRootNotes, getAllScaleTypes, SCALE_DISPLAY_NAMES } from '../../utils/scales';
import type { NoteName } from '../../utils/musicTheory';
import type { ScaleType } from '../../utils/scales';

export function PracticeBar() {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);

  const rootNotes = getAllRootNotes();
  const scaleTypes = getAllScaleTypes();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="card p-4 flex flex-wrap items-center gap-4"
    >
      {/* Practice toggle */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Practice</span>
        <motion.button
          onClick={() => updateSettings({ practiceEnabled: !settings.practiceEnabled })}
          className={`toggle ${settings.practiceEnabled ? 'bg-accent-600' : 'bg-surface-600'}`}
          whileTap={{ scale: 0.95 }}
        >
          <motion.span
            className="toggle-thumb"
            animate={{ x: settings.practiceEnabled ? 20 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </motion.button>
      </div>

      <div className="divider" />

      {/* Root note selector */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-400">Root</label>
        <select
          value={settings.practiceRootNote}
          onChange={(e) => updateSettings({ practiceRootNote: e.target.value as NoteName })}
          disabled={!settings.practiceEnabled}
          className="select text-sm py-1.5 disabled:opacity-40"
        >
          {rootNotes.map((note) => (
            <option key={note} value={note}>
              {note}
            </option>
          ))}
        </select>
      </div>

      {/* Scale type selector */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-400">Scale</label>
        <select
          value={settings.practiceScaleType}
          onChange={(e) => updateSettings({ practiceScaleType: e.target.value as ScaleType })}
          disabled={!settings.practiceEnabled}
          className="select text-sm py-1.5 disabled:opacity-40"
        >
          {scaleTypes.map((type) => (
            <option key={type} value={type}>
              {SCALE_DISPLAY_NAMES[type]}
            </option>
          ))}
        </select>
      </div>

      <div className="divider" />

      {/* Note labels toggle */}
      <label className="flex items-center gap-2 cursor-pointer group">
        <input
          type="checkbox"
          checked={settings.showNoteLabels}
          onChange={(e) => updateSettings({ showNoteLabels: e.target.checked })}
          disabled={!settings.practiceEnabled}
          className="checkbox"
        />
        <span className={`text-xs transition-colors ${
          settings.practiceEnabled ? 'text-gray-300 group-hover:text-white' : 'text-gray-500'
        }`}>
          Labels
        </span>
      </label>

      {/* Root hints toggle */}
      <label className="flex items-center gap-2 cursor-pointer group">
        <input
          type="checkbox"
          checked={settings.showRootHints}
          onChange={(e) => updateSettings({ showRootHints: e.target.checked })}
          disabled={!settings.practiceEnabled}
          className="checkbox"
        />
        <span className={`text-xs transition-colors ${
          settings.practiceEnabled ? 'text-gray-300 group-hover:text-white' : 'text-gray-500'
        }`}>
          Root Hints
        </span>
      </label>

      {/* Legend when enabled */}
      {settings.practiceEnabled && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-1 ml-auto"
        >
          <div className="divider mr-2" />
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-indigo-500/70" />
              <span>Scale</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-orange-500/85" />
              <span>Root</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
