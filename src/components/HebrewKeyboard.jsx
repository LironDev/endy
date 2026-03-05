import { motion } from 'framer-motion';

/**
 * Hebrew on-screen keyboard — all 27 characters in standard layout.
 * Rows listed right→left so RTL flex renders them in correct physical position.
 */
const ROWS = [
  ['פ', 'מ', 'ן', 'ו', 'ט', 'א', 'ר', 'ק'],
  ['ף', 'ך', 'ל', 'ח', 'י', 'ע', 'כ', 'ג', 'ד', 'ש'],
  ['ץ', 'ת', 'צ', 'ם', 'נ', 'ה', 'ב', 'ס', 'ז'],
];

export function HebrewKeyboard({ onKey, onDelete, onSpace, onSubmit, disabled }) {
  // onPointerDown + preventDefault prevents the hidden input from losing focus
  const tap = fn => e => {
    e.preventDefault();
    if (!disabled) fn();
  };

  const letterCls =
    'flex-1 h-[2.75rem] rounded-xl ' +
    'bg-white/90 dark:bg-purple-800/70 ' +
    'text-purple-900 dark:text-white ' +
    'text-sm font-bold ' +
    'shadow-sm shadow-black/10 ' +
    'flex items-center justify-center ' +
    'select-none touch-none ' +
    'active:brightness-90';

  const specialCls =
    'h-[2.75rem] rounded-xl ' +
    'bg-purple-200/80 dark:bg-purple-700/60 ' +
    'text-purple-800 dark:text-purple-200 ' +
    'flex items-center justify-center ' +
    'select-none touch-none ' +
    'active:brightness-90';

  return (
    <div
      className={`flex flex-col gap-1.5 px-1.5 pt-1 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
      style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}
      dir="rtl"
    >
      {ROWS.map((row, ri) => (
        <div key={ri} className="flex gap-1">
          {row.map(letter => (
            <motion.button
              key={letter}
              onPointerDown={tap(() => onKey(letter))}
              whileTap={{ scale: 0.78, transition: { duration: 0.08 } }}
              className={letterCls}
            >
              {letter}
            </motion.button>
          ))}
        </div>
      ))}

      {/* Special keys: ⌫  ·  רווח  ·  שלח ↵ */}
      <div className="flex gap-1">
        {/* Backspace — right side */}
        <motion.button
          onPointerDown={tap(onDelete)}
          whileTap={{ scale: 0.82, transition: { duration: 0.08 } }}
          className={`${specialCls} w-[3.4rem] flex-none text-lg font-bold`}
        >
          ⌫
        </motion.button>

        {/* Space — grows to fill */}
        <motion.button
          onPointerDown={tap(onSpace)}
          whileTap={{ scale: 0.95, transition: { duration: 0.08 } }}
          className={`${specialCls} flex-1 text-xs font-semibold tracking-wide`}
        >
          רווח
        </motion.button>

        {/* Submit — left side, purple accent */}
        <motion.button
          onPointerDown={tap(onSubmit)}
          whileTap={{ scale: 0.88, transition: { duration: 0.08 } }}
          className="h-[2.75rem] w-[4.2rem] flex-none rounded-xl
                     bg-purple-600 hover:bg-purple-700
                     text-white text-xs font-bold
                     flex items-center justify-center
                     shadow-md shadow-purple-500/40
                     select-none touch-none"
        >
          שלח ↵
        </motion.button>
      </div>
    </div>
  );
}
