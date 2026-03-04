import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { GameCodeDisplay } from '../components/GameCodeDisplay';
import { playerJoinVariants } from '../animations/variants';
import { startGame, resetGame } from '../firebase/gameService';
import { GAME_MODES } from '../utils/constants';

const TARGET_OPTIONS = [30, 50, 100, 200];
const TIME_OPTIONS = [
  { label: '1 דקה', value: 60 },
  { label: '2 דקות', value: 120 },
  { label: '3 דקות', value: 180 },
  { label: '5 דקות', value: 300 },
  { label: 'ללא הגבלה', value: null },
];

export function LobbyScreen({ gameDoc, gameId, uid, onLeave }) {
  const [starting, setStarting] = useState(false);
  const [config, setConfig] = useState({
    mode: gameDoc.config?.mode || GAME_MODES.CLASSIC,
    target: gameDoc.config?.target || 50,
    timeLimit: gameDoc.config?.timeLimit || null,
  });

  const isHost = gameDoc.config?.hostId === uid;
  const players = Object.entries(gameDoc.players || {});
  const canStart = players.length >= 1;

  const handleStart = async () => {
    if (!isHost || !canStart) return;
    setStarting(true);
    try {
      await startGame(gameId, uid, config);
    } catch (e) {
      toast.error(e.message);
      setStarting(false);
    }
  };

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen cosmic-bg flex flex-col items-center justify-center p-4 gap-5" dir="rtl">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-black neon-text text-purple-900 dark:text-white">אנדי</h1>
        <p className="text-purple-600/70 dark:text-purple-400/60 text-sm mt-1">ממתינים לשחקנים...</p>
      </motion.div>

      {/* Game Code */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-sm"
      >
        <GameCodeDisplay gameId={gameId} />
      </motion.div>

      {/* Players list */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm glass-card"
      >
        <h2 className="text-purple-600/80 dark:text-purple-300/70 text-sm mb-3 font-semibold">
          שחקנים ({players.length})
        </h2>

        <div className="flex flex-col gap-2 min-h-[80px]">
          <AnimatePresence mode="popLayout">
            {players.map(([playerId, player]) => (
              <motion.div
                key={playerId}
                variants={playerJoinVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                layout
                className={`flex items-center gap-3 p-2.5 rounded-xl ${
                  playerId === uid
                    ? 'bg-purple-100/80 border border-purple-300/50 dark:bg-purple-700/30 dark:border-purple-500/30'
                    : 'bg-white/60 dark:bg-purple-950/40'
                }`}
              >
                <PlayerAvatar name={player.name} size="md" isOnline={player.isOnline} isHost={player.isHost} />
                <div className="flex-1 min-w-0">
                  <p className="text-purple-900 dark:text-purple-100 font-semibold text-sm truncate">{player.name}</p>
                  <p className="text-purple-500/60 dark:text-purple-400/50 text-xs">
                    {player.isHost ? 'מארח' : 'שחקן'}
                    {playerId === uid ? ' • את/ה' : ''}
                  </p>
                </div>
                {player.isOnline && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Game config (host only) */}
      {isHost && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-sm glass-card"
        >
          <h2 className="text-purple-600/80 dark:text-purple-300/70 text-sm mb-4 font-semibold">הגדרות משחק</h2>

          {/* Mode toggle */}
          <div className="mb-4">
            <label className="text-purple-600/80 dark:text-purple-400/70 text-xs mb-2 block">מצב משחק</label>
            <div className="flex gap-1 bg-purple-100/70 dark:bg-purple-950/60 rounded-xl p-1">
              {[
                { id: GAME_MODES.CLASSIC, label: '🎯 קלאסי', desc: 'תורות לסירוגין' },
                { id: GAME_MODES.BLITZ, label: '⚡ בליץ', desc: 'כולם בו-זמנית' },
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => handleConfigChange('mode', mode.id)}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                    config.mode === mode.id
                      ? 'bg-purple-600 text-white'
                      : 'text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300'
                  }`}
                  title={mode.desc}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            <p className="text-purple-500/60 dark:text-purple-500/50 text-xs mt-1 text-center">
              {config.mode === GAME_MODES.CLASSIC ? 'כל שחקן מחכה לתורו' : 'כולם יכולים לשלוח (לא אחד אחרי עצמו)'}
            </p>
          </div>

          {/* Score target */}
          <div className="mb-4">
            <label className="text-purple-600/80 dark:text-purple-400/70 text-xs mb-2 block">יעד ניקוד (נקודות)</label>
            <div className="grid grid-cols-4 gap-1.5">
              {TARGET_OPTIONS.map(t => (
                <button
                  key={t}
                  onClick={() => handleConfigChange('target', t)}
                  className={`py-2 rounded-lg text-sm font-bold transition-all ${
                    config.target === t
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-100/70 text-purple-600 hover:text-purple-700 border border-purple-200/60 dark:bg-purple-950/60 dark:text-purple-400 dark:hover:text-purple-300 dark:border-purple-800/40'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Time limit */}
          <div className="mb-1">
            <label className="text-purple-600/80 dark:text-purple-400/70 text-xs mb-2 block">הגבלת זמן</label>
            <div className="flex flex-wrap gap-1.5">
              {TIME_OPTIONS.map(opt => (
                <button
                  key={opt.value || 'none'}
                  onClick={() => handleConfigChange('timeLimit', opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    config.timeLimit === opt.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-100/70 text-purple-600 hover:text-purple-700 border border-purple-200/60 dark:bg-purple-950/60 dark:text-purple-400 dark:hover:text-purple-300 dark:border-purple-800/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Non-host waiting message */}
      {!isHost && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-purple-600/70 dark:text-purple-400/60 text-sm animate-pulse"
        >
          ממתין/ת למארח להתחיל את המשחק...
        </motion.p>
      )}

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-sm flex flex-col gap-2"
      >
        {isHost && (
          <button
            onClick={handleStart}
            disabled={!canStart || starting}
            className="neon-btn w-full py-4 text-lg disabled:opacity-50"
          >
            {starting ? 'מתחיל...' : `🚀 התחל משחק (${players.length} שחק${players.length === 1 ? 'ן' : 'נים'})`}
          </button>
        )}

        <button
          onClick={onLeave}
          className="w-full py-2.5 rounded-xl text-purple-500/70 text-sm hover:text-purple-600 dark:hover:text-purple-400 transition"
        >
          ← חזור לדף הבית
        </button>
      </motion.div>
    </div>
  );
}
