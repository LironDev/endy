import { useState } from 'react';
import { motion } from 'framer-motion';
import { shareGame } from '../utils/gameId';
import toast from 'react-hot-toast';

export function GameCodeDisplay({ gameId }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const result = await shareGame(gameId);
    if (result.method === 'clipboard') {
      setCopied(true);
      toast.success('הקישור הועתק!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3" dir="rtl">
      <p className="text-purple-600/80 dark:text-purple-300/70 text-sm">קוד משחק — שתף עם חברים</p>

      <div className="flex items-center gap-3">
        {/* Code display */}
        <motion.div
          animate={{ boxShadow: ['0 0 10px rgba(168,85,247,0.2)', '0 0 20px rgba(168,85,247,0.45)', '0 0 10px rgba(168,85,247,0.2)'] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="px-5 py-3 rounded-xl text-center
                     bg-white/90 border border-purple-300/50
                     dark:bg-purple-950/80 dark:border-purple-500/40"
        >
          <span className="text-2xl font-black tracking-[0.25em] text-purple-900 dark:text-purple-100 font-mono select-all">
            {gameId}
          </span>
        </motion.div>

        {/* Share / Copy button */}
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-3 rounded-xl transition active:scale-95
                     bg-purple-100/80 border border-purple-300/50 text-purple-800 hover:bg-purple-200/70
                     dark:bg-purple-700/50 dark:border-purple-500/40 dark:text-purple-200 dark:hover:bg-purple-600/60"
          title="שתף"
        >
          <motion.span
            key={copied ? 'check' : 'copy'}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-lg"
          >
            {copied ? '✓' : '📋'}
          </motion.span>
          <span className="text-sm font-medium">{copied ? 'הועתק!' : 'העתק'}</span>
        </button>
      </div>
    </div>
  );
}
