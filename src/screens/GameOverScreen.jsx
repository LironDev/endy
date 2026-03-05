import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { Leaderboard } from '../components/Leaderboard';
import { shareGame } from '../utils/gameId';
import { generateResultsImage } from '../utils/shareImage';
import { resetGame } from '../firebase/gameService';
import {
  gameOverContainerVariants,
  gameOverItemVariants,
} from '../animations/variants';

const MEDALS = ['🥇', '🥈', '🥉'];

export function GameOverScreen({ gameDoc, gameId, uid, onHome }) {
  const [resetting, setResetting] = useState(false);
  const [sharing, setSharing] = useState(false);

  // ── Confetti for top 3 ─────────────────────────────────────────────────────
  useEffect(() => {
    const topCount = Math.min(players.length, 3);
    if (topCount === 0) return;

    // Burst from left cannon
    const fireLeft = () => confetti({
      particleCount: 60,
      angle: 60,
      spread: 65,
      origin: { x: 0, y: 0.65 },
      colors: ['#a855f7', '#ec4899', '#fbbf24', '#34d399', '#60a5fa'],
      scalar: 1.1,
      gravity: 0.9,
    });

    // Burst from right cannon
    const fireRight = () => confetti({
      particleCount: 60,
      angle: 120,
      spread: 65,
      origin: { x: 1, y: 0.65 },
      colors: ['#a855f7', '#ec4899', '#fbbf24', '#34d399', '#60a5fa'],
      scalar: 1.1,
      gravity: 0.9,
    });

    // Gold stars for 1st place
    const fireStars = () => confetti({
      particleCount: 30,
      angle: 90,
      spread: 120,
      origin: { x: 0.5, y: 0.5 },
      shapes: ['star'],
      colors: ['#fbbf24', '#f59e0b', '#fcd34d'],
      scalar: 1.4,
      gravity: 0.7,
    });

    // Initial big burst
    fireLeft();
    fireRight();
    setTimeout(fireStars, 200);

    // Second wave
    setTimeout(() => { fireLeft(); fireRight(); }, 600);

    // Third wave (only if 3 players on podium)
    if (topCount >= 3) {
      setTimeout(() => { fireLeft(); fireRight(); fireStars(); }, 1200);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const players = Object.entries(gameDoc.players || {})
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.score - a.score);

  const winner = players[0];
  const isHost = gameDoc.config?.hostId === uid;
  const didWin = winner?.id === uid;

  // ── Share game link ────────────────────────────────────────────────────────
  const handleShareLink = async () => {
    const result = await shareGame(gameId);
    if (result.method === 'clipboard') toast.success('קישור הועתק!');
  };

  // ── Share results image ────────────────────────────────────────────────────
  const handleShareImage = async () => {
    setSharing(true);
    try {
      const blob = await generateResultsImage(players, gameId);
      const file = new File([blob], 'endy-results.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: 'תוצאות אנדי 🏆',
          text: `שיחקנו אנדי! ${winner?.name} ניצח/ה עם ${winner?.score} נקודות 🎉`,
          files: [file],
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'endy-results.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('תמונה הורדה! שתף/י אותה בוואצאפ 📲');
      }
    } catch (e) {
      if (e?.name !== 'AbortError') {
        toast.error('לא הצלחנו ליצור את התמונה');
      }
    } finally {
      setSharing(false);
    }
  };

  // ── Play again ─────────────────────────────────────────────────────────────
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

        <motion.h1 variants={gameOverItemVariants} className="text-3xl font-black neon-text text-purple-900 dark:text-white mb-1">
          {didWin ? 'ניצחת!' : 'המשחק הסתיים'}
        </motion.h1>

        {winner && (
          <motion.p variants={gameOverItemVariants} className="text-purple-600/80 dark:text-purple-300/70 text-base">
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
        <h2 className="text-purple-600/80 dark:text-purple-300/70 text-sm mb-3 font-semibold">לוח ניקוד סופי</h2>

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
                <PlayerAvatar
                  name={player.name}
                  size={idx === 0 ? 'lg' : 'md'}
                  isHost={player.isHost}
                  emoji={player.emoji || null}
                  avatarColor={player.avatarColor || null}
                />
                <span className={`text-xs font-semibold max-w-[60px] truncate text-center ${
                  player.id === uid
                    ? 'text-purple-700 dark:text-purple-200'
                    : 'text-purple-600/80 dark:text-purple-300/70'
                }`}>
                  {player.name}
                </span>
                <span className="text-purple-600 dark:text-purple-400 font-black text-sm">{player.score}</span>
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
          <p className="text-center text-purple-600/70 dark:text-purple-400/60 text-sm animate-pulse">
            ממתין/ת למארח להתחיל סיבוב חדש...
          </p>
        )}

        {/* Share results image */}
        <button
          onClick={handleShareImage}
          disabled={sharing}
          className="w-full py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition
                     bg-purple-100/70 border border-purple-300/50 text-purple-800 hover:bg-purple-200/70
                     dark:bg-purple-700/40 dark:border-purple-500/50 dark:text-purple-100 dark:hover:bg-purple-700/60"
        >
          {sharing
            ? <><span className="animate-spin">⏳</span> יוצר תמונה...</>
            : <>📸 שתף תוצאות לוואצאפ</>
          }
        </button>

        {/* Share game link */}
        <button
          onClick={handleShareLink}
          className="w-full py-2.5 rounded-xl border text-sm font-medium transition
                     border-purple-200/60 text-purple-600 hover:bg-purple-100/50
                     dark:border-purple-700/30 dark:text-purple-400 dark:hover:bg-purple-900/30"
        >
          🔗 שתף קישור למשחק
        </button>

        <button
          onClick={onHome}
          className="w-full py-2.5 rounded-xl text-purple-500/70 text-sm hover:text-purple-600 dark:hover:text-purple-400 transition"
        >
          ← דף הבית
        </button>
      </motion.div>
    </div>
  );
}
