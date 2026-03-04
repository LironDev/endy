import { useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { WordBubble } from '../components/WordBubble';
import { WordInput } from '../components/WordInput';
import { Leaderboard } from '../components/Leaderboard';
import { ScoreParticleLayer } from '../components/ScoreParticle';
import { TimerBar } from '../components/TimerBar';
import { TurnTimer } from '../components/TurnTimer';
import { SkipButton } from '../components/SkipButton';
import { useScoreParticle } from '../hooks/useScoreParticle';
import { GAME_MODES } from '../utils/constants';
import { setPlayerOnline } from '../firebase/gameService';

export function GameScreen({
  gameDoc, gameId, uid, dictionary,
  shaking, isMyTurn, submitWord, skipTurn,
  timeLeft, turnTimeLeft, endGame,
  toastStyle, toastErrorStyle,
}) {
  const { particles, spawnParticle, inputRef, registerLeaderboardRef } = useScoreParticle();
  const wordInputRef = useRef(null);

  const isClassic = gameDoc.config?.mode === GAME_MODES.CLASSIC;
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

      {/* ── TOP: Header ─────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 px-3 pt-3 pb-1 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            isClassic
              ? 'bg-blue-100/80 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
              : 'bg-amber-100/80 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
          }`}>
            {isClassic ? '🎯 קלאסי' : '⚡ בליץ'}
          </span>

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
