import { motion } from 'framer-motion';

interface HeaderProps {
  onSettingsClick: () => void;
}

export function Header({ onSettingsClick }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="flex items-center justify-between mb-6 pb-4 border-b border-surface-700/50"
    >
      <div className="flex items-center gap-3">
        <motion.span
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, duration: 0.4, type: 'spring', stiffness: 200 }}
          className="text-3xl"
        >
          🎸
        </motion.span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-gradient">Guitar Fretboard</span>
            <span className="text-gray-400 font-normal ml-2">Visualizer</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time pitch detection & hand tracking
          </p>
        </div>
      </div>

      <motion.button
        onClick={onSettingsClick}
        whileHover={{ scale: 1.05, rotate: 15 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="p-2.5 text-gray-400 hover:text-white bg-surface-800 hover:bg-surface-700
                   rounded-lg border border-surface-700/50 hover:border-surface-600
                   transition-colors duration-200 shadow-soft"
        title="Settings"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </motion.button>
    </motion.header>
  );
}
