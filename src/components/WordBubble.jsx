import { motion, AnimatePresence } from 'framer-motion';
import { getRequiredStart } from '../utils/hebrew';
import { bubbleEnterVariants, bubbleGlowVariants, lastLetterPulse } from '../animations/variants';

export function WordBubble({ word }) {
  const requiredStart = word ? getRequiredStart(word) : null;

  return (
    <div className="flex flex-col items-center gap-3">

      {/* Required letter badge */}
      <div className="h-16 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {requiredStart ? (
            <motion.div
              key={requiredStart}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-purple-400/60 text-xs">האות הבאה</span>
              <motion.div
                variants={lastLetterPulse}
                animate="animate"
                className="w-12 h-12 rounded-full bg-purple-900/80 border-2 border-purple-400 flex items-center justify-center text-xl font-black text-purple-100"
              >
                {requiredStart}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-purple-400/50 text-xs text-center"
            >
              הזינו מילה ראשונה
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main bubble */}
      <div className="relative flex items-center justify-center">
        {/* Outer glow */}
        <motion.div
          variants={bubbleGlowVariants}
          animate="animate"
          className="absolute inset-0 rounded-full bg-purple-500/20 blur-2xl"
          style={{ margin: '-16px' }}
          aria-hidden
        />

        <div className="word-bubble w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={word || '__empty__'}
              variants={bubbleEnterVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-center px-3"
            >
              {word ? (
                <span className="text-white text-2xl sm:text-3xl font-black leading-tight break-all">
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
    </div>
  );
}
