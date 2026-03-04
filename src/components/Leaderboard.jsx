import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { PlayerAvatar } from './PlayerAvatar';
import { leaderboardRowVariants } from '../animations/variants';

function OdometerScore({ value }) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 80, damping: 28 });
  const displayRef = useRef(null);

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    return spring.on('change', v => {
      if (displayRef.current) {
        displayRef.current.textContent = Math.round(v).toString();
      }
    });
  }, [spring]);

  return <span ref={displayRef}>{value}</span>;
}

export function Leaderboard({ players, uid, registerRef, compact = false }) {
  const sorted = Object.entries(players || {})
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.score - a.score);

  const displayList = compact ? sorted.slice(0, 6) : sorted;

  return (
    <div className={`flex flex-col gap-1 w-full ${compact ? '' : 'max-h-60 overflow-y-auto'}`} dir="rtl">
      <AnimatePresence mode="popLayout">
        {displayList.map((player, idx) => (
          <motion.div
            key={player.id}
            layout
            variants={leaderboardRowVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            ref={el => registerRef && registerRef(player.id, el)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors duration-200 ${
              player.id === uid
                ? 'bg-purple-600/30 border border-purple-500/40'
                : 'bg-purple-950/40'
            }`}
          >
            {/* Rank */}
            <span className="text-purple-400/50 text-xs w-4 flex-shrink-0 text-center font-mono">
              {idx + 1}
            </span>

            {/* Avatar */}
            <PlayerAvatar
              name={player.name}
              size="sm"
              isOnline={player.isOnline}
              isHost={player.isHost}
            />

            {/* Name */}
            <span className={`text-sm font-medium flex-1 truncate ${
              player.id === uid ? 'text-purple-100' : 'text-purple-200/80'
            }`}>
              {player.name}
              {player.id === uid && (
                <span className="text-purple-400/60 text-xs mr-1">(את/ה)</span>
              )}
            </span>

            {/* Score */}
            <motion.div
              key={`score-${player.score}`}
              initial={{ scale: player.score > 0 ? 1.3 : 1 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="font-black text-sm text-purple-100 tabular-nums min-w-[2.5rem] text-left"
            >
              <OdometerScore value={player.score} />
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
