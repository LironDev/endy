import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

/**
 * Fixed moon/sun toggle button — always visible in the top-left corner.
 * Dark mode → shows 🌙 (click to switch to light)
 * Light mode → shows ☀️  (click to switch to dark)
 */
export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={{ scale: 0.85 }}
      className="fixed top-3 left-3 z-50 w-9 h-9 rounded-full
                 flex items-center justify-center
                 bg-white/20 dark:bg-purple-950/70
                 backdrop-blur-md
                 border border-purple-300/40 dark:border-purple-700/50
                 text-purple-700 dark:text-purple-300
                 hover:bg-purple-100/40 dark:hover:bg-purple-800/50
                 transition-colors shadow-sm"
      aria-label={isDark ? 'עבור למצב יום' : 'עבור למצב לילה'}
      title={isDark ? 'מצב יום' : 'מצב לילה'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? 'moon' : 'sun'}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 8, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="text-base select-none flex items-center justify-center"
          style={{ lineHeight: 1 }}
        >
          {isDark ? '🌙' : '☀️'}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
