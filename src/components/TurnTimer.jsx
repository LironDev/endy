import { motion } from 'framer-motion';
import { TURN_TIME_LIMIT } from '../utils/constants';

const RADIUS = 18;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const URGENT_THRESHOLD = 5;

/**
 * Circular countdown ring showing how many seconds remain in the current turn.
 * Turns red and pulses in the last 5 seconds.
 */
export function TurnTimer({ timeLeft }) {
  if (timeLeft === null) return null;

  const seconds = Math.ceil(timeLeft);
  const fraction = Math.max(0, Math.min(1, timeLeft / TURN_TIME_LIMIT));
  const isUrgent = timeLeft <= URGENT_THRESHOLD;
  const strokeOffset = CIRCUMFERENCE * (1 - fraction);

  const ringColor = isUrgent ? '#ef4444' : '#a855f7';
  const textColor = isUrgent ? 'text-red-500 dark:text-red-400' : 'text-purple-700 dark:text-purple-300';

  return (
    <div className="relative flex items-center justify-center" style={{ width: 46, height: 46 }}>
      <svg width="46" height="46" viewBox="0 0 46 46" style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Background track */}
        <circle
          cx="23" cy="23" r={RADIUS}
          fill="none"
          stroke="rgba(168,85,247,0.15)"
          strokeWidth="3"
        />
        {/* Countdown arc */}
        <motion.circle
          cx="23" cy="23" r={RADIUS}
          fill="none"
          stroke={ringColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeOffset}
          style={{ rotate: '-90deg', transformOrigin: '23px 23px' }}
          animate={{ strokeDashoffset: strokeOffset, stroke: ringColor }}
          transition={{ duration: 0.2, ease: 'linear' }}
        />
      </svg>

      {/* Number in center */}
      <motion.span
        className={`relative z-10 text-sm font-black tabular-nums ${textColor}`}
        animate={isUrgent ? { scale: [1, 1.2, 1] } : { scale: 1 }}
        transition={isUrgent ? { duration: 0.5, repeat: Infinity, ease: 'easeInOut' } : {}}
      >
        {seconds}
      </motion.span>
    </div>
  );
}
