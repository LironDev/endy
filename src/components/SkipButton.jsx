import { useState } from 'react';
import { motion } from 'framer-motion';

export function SkipButton({ onSkip, isMyTurn, disabled }) {
  const [cooldown, setCooldown] = useState(false);

  const handleSkip = async () => {
    if (!isMyTurn || disabled || cooldown) return;
    setCooldown(true);
    await onSkip();
    setTimeout(() => setCooldown(false), 2000);
  };

  const isDisabled = !isMyTurn || disabled || cooldown;

  return (
    <motion.button
      onClick={handleSkip}
      disabled={isDisabled}
      whileTap={isDisabled ? {} : { scale: 0.93 }}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        isDisabled
          ? 'text-purple-600/40 cursor-not-allowed'
          : 'text-purple-300/80 hover:text-purple-200 hover:bg-purple-800/30'
      }`}
      title="דלג על תורך"
    >
      <span>דלג</span>
      <span className="text-base">→→</span>
    </motion.button>
  );
}
