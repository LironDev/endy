import { useRef, useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { WordBubble } from '../components/WordBubble';
import { WordInput } from '../components/WordInput';
import { Leaderboard } from '../components/Leaderboard';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { ScoreParticleLayer } from '../components/ScoreParticle';
import { TimerBar } from '../components/TimerBar';
import { TurnTimer } from '../components/TurnTimer';
import { SkipButton } from '../components/SkipButton';
import { useScoreParticle } from '../hooks/useScoreParticle';
import { GAME_MODES } from '../utils/constants';
import { setPlayerOnline, resetGame } from '../firebase/gameService';

export function GameScreen({
  gameDoc, gameId, uid, dictionary,
  shaking, isMyTurn, submitWord, skipTurn,
  timeLeft, turnTimeLeft, endGame,
  toastStyle, toastErrorStyle,
}) {
  const { particles, spawnParticle, inputRef, registerLeaderboardRef } = useScoreParticle();
  const wordInputRef = useRef(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  const isClassic = gameDoc.config?.mode === GAME_MODES.CLASSIC;
  const isHost = gameDoc.config?.hostId === uid;
  const timeLimit = gameDoc.config?.timeLimit;
  const currentWord = gameDoc.state?.lastWord || '';
  const lastPlayerId = gameDoc.state?.lastPlayerId;
  const myTurn = isMyTurn(uid);

  // ── Online presence ────────────────────────────────────────────────────────

  useEffect(() => {
    setPlayerOnline(gameId, uid, true);
    const handleVisibility = () => setPlayerOnline(gameId, uid, !document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      setPlayerOnline(gameId, uid, false);
    };
  }, [gameId, uid]);

  // ── Auto-focus input on my turn ────────────────────────────────────────────

  useEffect(() => {
    if (myTurn) {
      setTimeout(() => wordInputRef.current?.focus(), 100);
    }
  }, [myTurn]);

  // ── Auto-skip when turn timer expires (Classic only) ──────────────────────

  useEffect(() => {
    if (turnTimeLeft !== null && turnTimeLeft <= 0 && myTurn && isClassic) {
      skipTurn(uid);
    }
  }, [turnTimeLeft, myTurn, isClassic, skipTurn, uid]);

  // ── Total time's up: host ends the game ───────────────────────────────────

  useEffect(() => {
    if (timeLeft === 0 && uid === gameDoc.config?.hostId) {
      endGame();
    }
  }, [timeLeft, uid, gameDoc.config?.hostId, endGame]);

  // ── Submit handler ─────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async (word) => {
    const result = await submitWord(word, uid, dictionary);

    if (result.success) {
      spawnParticle(uid, result.score);
      toast.success(`+${result.score} נקודות! 🌟`, {
        duration: 1500,
        style: toastStyle,
      });
    } else if (result.error) {
      toast.error(result.error, {
        duration: 2000,
        style: toastErrorStyle,
      });
    }

    return result;
  }, [submitWord, uid, dictionary, spawnParticle, toastStyle, toastErrorStyle]);

  // ── Reset to lobby ─────────────────────────────────────────────────────────

  const handleResetToLobby = async () => {
    setResetting(true);
    try {
      await resetGame(gameId, uid);
      // onSnapshot will switch App to LobbyScreen automatically
    } catch (e) {
      toast.error(e.message, { style: toastErrorStyle });
      setResetting(false);
      setShowResetConfirm(false);
    }
  };

  // ── Turn status label ──────────────────────────────────────────────────────

  const getTurnLabel = () => {
    if (!gameDoc.state?.lastWord) return 'הזינו את המילה הראשונה!';
    if (isClassic) {
      const currentPlayer = gameDoc.players?.[gameDoc.state?.currentTurnUid];
      if (myTurn) return '✨ התורך!';
      return `ממתין ל-${currentPlayer?.name || '...'}`;
    }
    if (myTurn) return '⚡ קדימה!';
    return 'שחק/י!';
  };

  return (
    <div
      className="cosmic-bg flex flex-col overflow-hidden"
      style={{ height: '100dvh' }}
      dir="rtl"
    >
      <ScoreParticleLayer particles={particles} />

      {/* ── Reset to lobby confirmation modal ──────────────────────────────── */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => !resetting && setShowResetConfirm(false)}
          >
            <motion.div
              key="modal"
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 320 }}
              className="glass-card w-full max-w-xs"
              onClick={e => e.stopPropagation()}
              dir="rtl"
            >
              {/* Title */}
              <div className="text-center mb-4">
                <motion.div
                  className="text-4xl mb-2"
                  animate={{ rotate: [0, -10, 10, -6, 6, 0] }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  🏠
                </motion.div>
                <h2 className="text-purple-900 dark:text-white font-black text-lg mb-1.5">
                  חזרה ללובי?
                </h2>
                <p className="text-purple-600/70 dark:text-purple-400/60 text-sm leading-relaxed">
                  הניקוד יתאפס לכולם. השחקנים יישארו בחדר ויוכלו להצטרף גם אחרים.
                </p>
              </div>

              {/* Current players */}
              <div className="bg-purple-100/50 dark:bg-purple-950/50 rounded-xl p-3 mb-4">
                <p className="text-purple-500/70 dark:text-purple-400/60 text-xs mb-2.5 font-semibold">
                  שחקנים בחדר:
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-2">
                  {Object.entries(gameDoc.players || {}).map(([pid, player]) => (
                    <div key={pid} className="flex items-center gap-1.5">
                      <PlayerAvatar
                        name={player.name}
                        size="xs"
                        isOnline={player.isOnline}
                        emoji={player.emoji || null}
                        avatarColor={player.avatarColor || null}
                      />
                      <span className="text-purple-700 dark:text-purple-300 text-xs font-medium">
                        {player.name}
                        {pid === uid && <span className="text-purple-400/60 dark:text-purple-500/50 mr-1">(את/ה)</span>}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  disabled={resetting}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all
                             text-purple-600 dark:text-purple-400
                             bg-purple-100/70 dark:bg-purple-950/60
                             hover:bg-purple-200/70 dark:hover:bg-purple-900/60
                             disabled:opacity-40"
                >
                  ביטול
                </button>
                <motion.button
                  onClick={handleResetToLobby}
                  disabled={resetting}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all
                             bg-purple-600 hover:bg-purple-700
                             shadow-lg shadow-purple-500/30
                             disabled:opacity-50"
                >
                  {resetting ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                        className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full"
                      />
                      מאפס...
                    </span>
                  ) : 'כן, חזור ללובי'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TOP: Header ─────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 px-3 pt-3 pb-1 flex flex-col gap-1">
        <div className="flex items-center justify-between">

          {/* Left: mode badge + host home button */}
          <div className="flex items-center gap-1.5">
            {isHost && (
              <motion.button
                onClick={() => setShowResetConfirm(true)}
                whileTap={{ scale: 0.85 }}
                title="חזרה ללובי"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-base
                           text-purple-400/70 hover:text-purple-600 dark:hover:text-purple-300
                           hover:bg-purple-100/60 dark:hover:bg-purple-800/40 transition-all"
              >
                🏠
              </motion.button>
            )}
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              isClassic
                ? 'bg-blue-100/80 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                : 'bg-amber-100/80 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
            }`}>
              {isClassic ? '🎯 קלאסי' : '⚡ בזק'}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.span
              key={getTurnLabel()}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className={`text-sm font-bold ${
                myTurn
                  ? 'text-purple-800 dark:text-purple-200'
                  : 'text-purple-500/80 dark:text-purple-400/70'
              }`}
            >
              {getTurnLabel()}
            </motion.span>
          </AnimatePresence>

          {gameDoc.config?.target && (
            <span className="text-xs text-purple-500/60 dark:text-purple-400/50">
              יעד: {gameDoc.config.target}
            </span>
          )}
        </div>

        {timeLimit && (
          <TimerBar timeLeft={timeLeft} totalTime={timeLimit} />
        )}
      </header>

      {/* ── TOP: Leaderboard (always visible, even with keyboard open) ────── */}
      <section className="flex-shrink-0 px-3 pb-1 overflow-y-auto" style={{ maxHeight: '28vh' }}>
        <Leaderboard
          players={gameDoc.players || {}}
          uid={uid}
          registerRef={registerLeaderboardRef}
          currentTurnUid={gameDoc.state?.currentTurnUid || null}
          compact
        />
      </section>

      {/* ── MIDDLE: flexible spacer (collapses when keyboard opens) ─────── */}
      <div className="flex-1 min-h-0" />

      {/* ── BOTTOM: Word display + input (stays visible above keyboard) ──── */}
      <footer className="flex-shrink-0 px-3 pt-1 pb-safe flex flex-col gap-2"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        {/* Word bubble — compact version, right above the input */}
        <div className="flex flex-col items-center gap-1">
          <WordBubble word={currentWord} compact />

          {/* Last submitted by */}
          {lastPlayerId && gameDoc.players?.[lastPlayerId] && (
            <motion.p
              key={lastPlayerId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-purple-500/50 dark:text-purple-400/40 text-xs text-center"
            >
              {gameDoc.players[lastPlayerId].name}
            </motion.p>
          )}
        </div>

        {/* Turn timer + skip row */}
        <div className="flex items-center justify-between gap-2">
          {/* Turn timer always shown on the left */}
          <TurnTimer timeLeft={turnTimeLeft} />

          {/* Skip button on the right (Classic only) */}
          {isClassic ? (
            <SkipButton
              onSkip={() => skipTurn(uid)}
              isMyTurn={myTurn}
              disabled={false}
            />
          ) : (
            <div /> /* spacer in Blitz */
          )}
        </div>

        {/* Word input */}
        <WordInput
          ref={wordInputRef}
          inputRef={inputRef}
          onSubmit={handleSubmit}
          isMyTurn={myTurn}
          disabled={gameDoc.status !== 'playing'}
          placeholder={currentWord ? `מילה שמתחילה ב...` : 'הזינו כל מילה...'}
        />
      </footer>
    </div>
  );
}
