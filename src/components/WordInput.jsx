import { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { shakeVariants } from '../animations/variants';

export const WordInput = forwardRef(function WordInput(
  { onSubmit, isMyTurn, disabled, placeholder = 'הכנס מילה...', inputRef: externalRef },
  ref
) {
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const controls = useAnimation();
  const localRef = useRef(null);
  const resolvedRef = externalRef || localRef;

  // Expose shake + clear methods to parent
  useImperativeHandle(ref, () => ({
    shake: async () => {
      await controls.start('shake');
      controls.start('idle');
    },
    clear: () => setValue(''),
    focus: () => resolvedRef.current?.focus(),
  }));

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed || submitting || !isMyTurn) return;
    setSubmitting(true);

    const result = await onSubmit(trimmed);

    if (result?.success) {
      setValue('');
    } else {
      // Shake on failure
      await controls.start('shake');
      controls.start('idle');
    }

    setSubmitting(false);
    resolvedRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <motion.div
      variants={shakeVariants}
      initial="idle"
      animate={controls}
      className="flex gap-2 w-full"
      dir="rtl"
    >
      <input
        ref={resolvedRef}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isMyTurn ? placeholder : 'ממתין לתורך...'}
        disabled={!isMyTurn || disabled}
        maxLength={30}
        className="rtl-input flex-1 text-lg"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        inputMode="text"
      />

      <button
        onClick={handleSubmit}
        disabled={!isMyTurn || disabled || !value.trim() || submitting}
        className="submit-btn"
        aria-label="שלח"
      >
        {submitting ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full"
          />
        ) : (
          <span className="text-xl">→</span>
        )}
      </button>
    </motion.div>
  );
});
