import { motion, AnimatePresence } from 'framer-motion';
import { getRequiredStart } from '../utils/hebrew';
import { bubbleEnterVariants, bubbleGlowVariants, lastLetterPulse } from '../animations/variants';

/**
 * WordBubble shows the current word + required next letter.
 * compact=true uses smaller dimensions (footer placement, keyboard visible on mobile).
 */
export function WordBubble({ word, compact = false }) {
  const requiredStart = word ? getRequiredStart(word) : null;

  // Sizes: compact fits in the footer above the keyboard
  const bubbleSize = compact
    ? 'w-28 h-28'
    : 'w-44 h-44 sm:w-52 sm:h-52';
  const wordTextSize = compact
    ? 'text-xl font-black'
    : 'text-2xl sm:text-3xl font-black';
  const badgeSize = compact
    ? 'w-9 h-9 text-base'
    : 'w-12 h-12 text-xl';

  return (
    <div className={`flex ${compact ? 'flex-row-reverse items-center gap-3' : 'flex-col items-center gap-3'}`}>

      {/* Main bubble */}
      <div className="relative flex items-center justify-center">
        {/* Outer glow */}
        <motion.div
          variants={bubbleGlowVariants}
          animate="animate"
          className="absolute inset-0 rounded-full bg-purple-500/20 blur-2xl"
          style={{ margin: compact ? '-8px' : '-16px' }}
          aria-hidden
        />

        <div className={`word-bubble ${bubbleSize} flex items-center justify-center relative z-10`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={word || '__empty__'}
              variants={bubbleEnterVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-center px-2"
            >
              {word ? (
                <span className={`text-white ${wordTextSize} leading-tight break-all`}>
                  {word}
                </span>
              ) : (
                <span className="text-purple-400/40 text-sm">
                  •••
                </span>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Required letter badge */}
      <AnimatePresence mode="wait">
        {requiredStart ? (
          <motion.div
            key={requiredStart}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            className={`flex flex-col items-center ${compact ? 'gap-0.5' : 'gap-1'}`}
          >
            <span className="text-purple-400/60 text-xs">
              {compact ? 'הבא:' : 'האות הבאה'}
            </span>
            <motion.div
              variants={lastLetterPulse}
              animate="animate"
              className={`${badgeSize} rounded-full bg-purple-900/80 border-2 border-purple-400 flex items-center justify-center font-black text-purple-100`}
            >
              {requiredStart}
            </motion.div>
          </motion.div>
        ) : (
          !compact && (
            <motion.div
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-purple-400/50 text-xs text-center"
            >
              הזינו מילה ראשונה
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}
