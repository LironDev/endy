import { motion } from 'framer-motion';

export function TimerBar({ timeLeft, totalTime }) {
  if (!totalTime || timeLeft === null) return null;

  const fraction = Math.max(0, timeLeft / (totalTime * 1000));
  const seconds = Math.ceil(timeLeft / 1000);

  const isUrgent = fraction < 0.25;
  const isCritical = fraction < 0.1;

  const barColor = isCritical
    ? 'bg-red-500'
    : isUrgent
    ? 'bg-amber-500'
    : 'bg-purple-500';

  return (
    <div className="w-full flex items-center gap-2" dir="rtl">
      {/* Time remaining label */}
      <motion.span
        animate={isUrgent ? { scale: [1, 1.1, 1], color: isCritical ? '#ef4444' : '#f59e0b' } : {}}
        transition={{ duration: 0.5, repeat: isUrgent ? Infinity : 0 }}
        className="text-purple-300 text-xs font-mono w-8 text-center flex-shrink-0"
      >
        {seconds}
      </motion.span>

      {/* Progress bar */}
      <div className="flex-1 h-2 bg-purple-900/60 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full transition-colors duration-300 ${barColor}`}
          style={{ width: `${fraction * 100}%` }}
          layout
        />
      </div>

      <span className="text-purple-400/50 text-xs flex-shrink-0">⏱</span>
    </div>
  );
}
