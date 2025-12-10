import { motion, AnimatePresence } from 'framer-motion';
import type { NoteInfo } from '../../utils/musicTheory';
import { formatNote } from '../../utils/musicTheory';

interface NoteDisplayProps {
  note: NoteInfo | null;
}

export function NoteDisplay({ note }: NoteDisplayProps) {
  return (
    <div className="text-center py-6">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
        Detected Note
      </div>
      <AnimatePresence mode="wait">
        {note ? (
          <motion.div
            key={`${note.noteName}-${note.octave}`}
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <motion.div
              className="text-5xl font-bold text-accent-500 mb-2"
              animate={{
                textShadow: [
                  '0 0 20px rgba(34, 197, 94, 0.4)',
                  '0 0 30px rgba(34, 197, 94, 0.6)',
                  '0 0 20px rgba(34, 197, 94, 0.4)',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              {formatNote(note.noteName, note.octave)}
            </motion.div>
            <div className="text-sm text-gray-400 font-mono">
              {note.frequency.toFixed(1)} <span className="text-gray-500">Hz</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="no-note"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-5xl font-bold text-gray-600 mb-2">--</div>
            <div className="text-sm text-gray-500">No note detected</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
