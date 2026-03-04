import { useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { WordBubble } from '../components/WordBubble';
import { WordInput } from '../components/WordInput';
import { Leaderboard } from '../components/Leaderboard';
import { ScoreParticleLayer } from '../components/ScoreParticle';
import { TimerBar } from '../components/TimerBar';
import { SkipButton } from '../components/SkipButton';
import { useScoreParticle } from '../hooks/useScoreParticle';
import { GAME_MODES } from '../utils/constants';
import { setPlayerOnline } from '../firebase/gameService';

export function GameScreen({ gameDoc, gameId, uid, dictionary, shaking, isMyTurn, submitWord, skipTurn, timeLeft, endGame }) {
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

  // ── Time's up: host ends the game ─────────────────────────────────────────

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
        style: { background: '#1a0533', color: '#e9d5ff', border: '1px solid rgba(168,85,247,0.4)', fontSize: '14px' },
      });
    } else if (result.error) {
      toast.error(result.error, {
        duration: 2000,
        style: { background: '#1a0533', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)', fontSize: '14px' },
      });
    }

    return result;
  }, [submitWord, uid, dictionary, spawnParticle]);

  // ── Turn status label ──────────────────────────────────────────────────────

  const getTurnLabel = () => {
    if (!gameDoc.state?.lastWord) return 'הזינו את המילה הראשונה!';
    if (isClassic) {
      const currentPlayer = gameDoc.players?.[gameDoc.state?.currentTurnUid];
      if (myTurn) return '✨ התורך!';
      return `ממתין ל-${currentPlayer?.name || '...'} `;
    }
    // Blitz
    if (myTurn) return '⚡ קדימה!';
    return 'שחק/י!';
  };

  return (
    <div className="game-screen cosmic-bg" dir="rtl">
      <ScoreParticleLayer particles={particles} />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="px-3 pt-3 pb-2 flex flex-col gap-1.5">

        {/* Top row: mode badge + turn indicator */}
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            isClassic ? 'bg-blue-900/60 text-blue-300' : 'bg-amber-900/60 text-amber-300'
          }`}>
            {isClassic ? '🎯 קלאסי' : '⚡ בליץ'}
          </span>

          <AnimatePresence mode="wait">
            <motion.span
              key={getTurnLabel()}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className={`text-sm font-bold ${myTurn ? 'text-purple-200' : 'text-purple-400/70'}`}
            >
              {getTurnLabel()}
            </motion.span>
          </AnimatePresence>

          {/* Target score indicator */}
          {gameDoc.config?.target && (
            <span className="text-xs text-purple-400/50">
              יעד: {gameDoc.config.target}
            </span>
          )}
        </div>

        {/* Timer bar */}
        {timeLimit && (
          <TimerBar timeLeft={timeLeft} totalTime={timeLimit} />
        )}
      </header>

      {/* ── Main: Word Bubble ─────────────────────────────────────────────── */}
      <main className="flex flex-col items-center justify-center px-4 overflow-hidden">
        <WordBubble word={currentWord} />

        {/* Last player who submitted */}
        {lastPlayerId && gameDoc.players?.[lastPlayerId] && (
          <motion.p
            key={lastPlayerId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-purple-400/50 text-xs text-center"
          >
            הוזן על ידי {gameDoc.players[lastPlayerId].name}
          </motion.p>
        )}
      </main>

      {/* ── Leaderboard ──────────────────────────────────────────────────── */}
      <section className="px-3 overflow-y-auto max-h-[30vh]">
        <Leaderboard
          players={gameDoc.players || {}}
          uid={uid}
          registerRef={registerLeaderboardRef}
          compact
        />
      </section>

      {/* ── Input Area ───────────────────────────────────────────────────── */}
      <footer className="px-3 pb-safe pb-4 pt-2 flex flex-col gap-2">
        {isClassic && (
          <div className="flex justify-end">
            <SkipButton
              onSkip={() => skipTurn(uid)}
              isMyTurn={myTurn}
              disabled={false}
            />
          </div>
        )}

        <WordInput
          ref={wordInputRef}
          inputRef={inputRef}
          onSubmit={handleSubmit}
          isMyTurn={myTurn}
          disabled={gameDoc.status !== 'playing'}
          placeholder={gameDoc.state?.lastWord ? `מילה שמתחילה ב...` : 'הזינו כל מילה...'}
        />
      </footer>
    </div>
  );
}
