import { useState, useRef, useImperativeHandle, forwardRef, useCallback, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { shakeVariants } from '../animations/variants';

/**
 * WordInput — visual word display with a hidden <input> for physical keyboard support.
 *
 * The visible display replaces the classic text input so the native mobile keyboard
 * never pops up. The HebrewKeyboard component drives input via the imperative ref methods:
 *   addChar(char), deleteChar(), submit()
 *
 * The `inputRef` prop (from useScoreParticle) is attached to the display div so score
 * particles fly from the right position.
 */
export const WordInput = forwardRef(function WordInput(
  { onSubmit, isMyTurn, disabled, placeholder = 'הכנס מילה...', inputRef: displayRef },
  ref,
) {
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const controls = useAnimation();
  const hiddenRef = useRef(null);

  // Keep the hidden input focused so physical keyboard still works on desktop
  useEffect(() => {
    if (isMyTurn && !disabled) {
      const t = setTimeout(() => hiddenRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [isMyTurn, disabled]);

  const doSubmit = useCallback(async () => {
    const trimmed = value.trim();
    if (!trimmed || submitting || !isMyTurn) return;
    setSubmitting(true);

    const result = await onSubmit(trimmed);

    if (result?.success) {
      setValue('');
    } else {
      await controls.start('shake');
      controls.start('idle');
    }

    setSubmitting(false);
    hiddenRef.current?.focus();
  }, [value, submitting, isMyTurn, onSubmit, controls]);

  useImperativeHandle(ref, () => ({
    shake: async () => { await controls.start('shake'); controls.start('idle'); },
    clear: () => setValue(''),
    focus: () => hiddenRef.current?.focus(),
    addChar: char => { if (!disabled) setValue(v => v.length < 30 ? v + char : v); },
    deleteChar: () => setValue(v => v.slice(0, -1)),
    submit: () => doSubmit(),
  }), [doSubmit, disabled, controls]);

  const active = isMyTurn && !disabled;

  return (
    <motion.div
      variants={shakeVariants}
      initial="idle"
      animate={controls}
      className="w-full"
      dir="rtl"
    >
      {/* Hidden <input> — captures physical keyboard events (desktop users) */}
      <input
        ref={hiddenRef}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && doSubmit()}
        disabled={!active}
        maxLength={30}
        inputMode="none"        /* suppress native mobile keyboard */
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        aria-hidden="true"
        tabIndex={-1}
        className="absolute opacity-0 w-0 h-0 -z-10 pointer-events-none"
      />

      {/* Visual display — shows typed word + blinking cursor */}
      <div
        ref={displayRef}
        className={`
          min-h-[2.8rem] px-4 py-2 rounded-2xl
          flex items-center gap-1
          border-2 transition-all duration-200
          ${active
            ? 'bg-white/90 dark:bg-purple-900/60 border-purple-400/70 dark:border-purple-500/60'
            : 'bg-white/30 dark:bg-purple-950/20 border-purple-200/20 dark:border-purple-800/20'}
        `}
      >
        {value ? (
          <span className="text-xl font-bold text-purple-900 dark:text-white leading-none">
            {value}
          </span>
        ) : (
          <span className="text-purple-400/55 dark:text-purple-500/45 text-sm font-normal">
            {active ? placeholder : 'ממתין לתורך...'}
          </span>
        )}

        {/* Blinking cursor */}
        {active && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.55, repeat: Infinity, repeatType: 'reverse' }}
            className="inline-block w-px h-5 rounded-full bg-purple-500 flex-shrink-0"
          />
        )}

        {/* Spinner while submitting */}
        {submitting && (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 0.55, repeat: Infinity, ease: 'linear' }}
            className="mr-auto w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full flex-shrink-0"
          />
        )}
      </div>
    </motion.div>
  );
});
