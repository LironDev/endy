import { motion } from 'framer-motion';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { Leaderboard } from '../components/Leaderboard';
import { shareGame } from '../utils/gameId';
import { resetGame } from '../firebase/gameService';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  gameOverContainerVariants,
  gameOverItemVariants,
} from '../animations/variants';

const MEDALS = ['🥇', '🥈', '🥉'];

export function GameOverScreen({ gameDoc, gameId, uid, onHome }) {
  const [resetting, setResetting] = useState(false);

  const players = Object.entries(gameDoc.players || {})
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.score - a.score);

  const winner = players[0];
  const isHost = gameDoc.config?.hostId === uid;
  const didWin = winner?.id === uid;
  const winnerId = gameDoc.state?.winnerId;

  const handleShare = async () => {
    const result = await shareGame(gameId);
    if (result.method === 'clipboard') toast.success('קישור הועתק!');
  };

  const handlePlayAgain = async () => {
    if (!isHost) return;
    setResetting(true);
    try {
      await resetGame(gameId, uid);
    } catch (e) {
      toast.error(e.message);
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen cosmic-bg flex flex-col items-center justify-center p-4 gap-5" dir="rtl">

      {/* Winner announcement */}
      <motion.div
        variants={gameOverContainerVariants}
        initial="initial"
        animate="animate"
        className="text-center"
      >
        <motion.div variants={gameOverItemVariants} className="text-5xl mb-3">
          {didWin ? '🏆' : '🎮'}
        </motion.div>

        <motion.h1 variants={gameOverItemVariants} className="text-3xl font-black neon-text text-white mb-1">
          {didWin ? 'ניצחת!' : 'המשחק הסתיים'}
        </motion.h1>

        {winner && (
          <motion.p variants={gameOverItemVariants} className="text-purple-300/70 text-base">
            {didWin
              ? `כל הכבוד! צברת ${winner.score} נקודות`
              : `${winner.name} ניצח/ה עם ${winner.score} נקודות`}
          </motion.p>
        )}
      </motion.div>

      {/* Final leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-sm glass-card"
      >
        <h2 className="text-purple-300/70 text-sm mb-3 font-semibold">לוח ניקוד סופי</h2>

        {/* Top 3 podium */}
        {players.length >= 2 && (
          <div className="flex justify-center gap-4 mb-4">
            {players.slice(0, Math.min(3, players.length)).map((player, idx) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className={`flex flex-col items-center gap-1 ${idx === 0 ? 'order-2' : idx === 1 ? 'order-1' : 'order-3'}`}
              >
                <span className="text-2xl">{MEDALS[idx]}</span>
                <PlayerAvatar name={player.name} size={idx === 0 ? 'lg' : 'md'} isHost={player.isHost} />
                <span className={`text-xs font-semibold ${player.id === uid ? 'text-purple-200' : 'text-purple-300/70'} max-w-[60px] truncate text-center`}>
                  {player.name}
                </span>
                <span className="text-purple-400 font-black text-sm">{player.score}</span>
              </motion.div>
            ))}
          </div>
        )}

        <Leaderboard
          players={gameDoc.players || {}}
          uid={uid}
          registerRef={null}
          compact={false}
        />
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-sm flex flex-col gap-2"
      >
        {isHost && (
          <button
            onClick={handlePlayAgain}
            disabled={resetting}
            className="neon-btn w-full py-4 text-lg"
          >
            {resetting ? 'מאפס...' : '🔄 משחק נוסף'}
          </button>
        )}

        {!isHost && (
          <p className="text-center text-purple-400/60 text-sm animate-pulse">
            ממתין/ת למארח להתחיל סיבוב חדש...
          </p>
        )}

        <button
          onClick={handleShare}
          className="w-full py-3 rounded-xl border border-purple-600/40 text-purple-300 text-sm font-semibold hover:bg-purple-800/30 transition"
        >
          📤 שתף את המשחק
        </button>

        <button
          onClick={onHome}
          className="w-full py-2.5 rounded-xl text-purple-500/60 text-sm hover:text-purple-400 transition"
        >
          ← דף הבית
        </button>
      </motion.div>
    </div>
  );
}
