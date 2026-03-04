import { useState, useEffect, useCallback } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { normalizeWord, isValidChain, calculateScore, isWordLongEnough } from '../utils/hebrew';
import {
  submitWord as fsSubmitWord,
  skipTurn as fsSkipTurn,
  endGame as fsEndGame,
  setPlayerOnline,
} from '../firebase/gameService';
import { GAME_MODES } from '../utils/constants';

/**
 * Core game state hook. Manages a single Firestore onSnapshot listener and
 * exposes derived state and action handlers.
 */
export function useGame(gameId) {
  const [gameDoc, setGameDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shaking, setShaking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  // ── Firestore listener ────────────────────────────────────────────────────

  useEffect(() => {
    if (!gameId) {
      setGameDoc(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = onSnapshot(
      doc(db, 'games', gameId),
      (snap) => {
        if (snap.exists()) {
          setGameDoc({ id: snap.id, ...snap.data() });
        } else {
          setError('המשחק לא נמצא');
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsub;
  }, [gameId]);

  // ── Online presence ───────────────────────────────────────────────────────

  useEffect(() => {
    if (!gameId || !gameDoc) return;
    // Will be called by App.jsx with the actual uid
  }, [gameId, gameDoc]);

  // ── Timer (time-limit mode) ───────────────────────────────────────────────

  useEffect(() => {
    if (!gameDoc || gameDoc.status !== 'playing') return;
    if (!gameDoc.config?.timeLimit || !gameDoc.state?.startedAt) return;

    const startedAt = gameDoc.state.startedAt.toMillis
      ? gameDoc.state.startedAt.toMillis()
      : gameDoc.state.startedAt;

    const timeLimitMs = gameDoc.config.timeLimit * 1000;

    const tick = () => {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, timeLimitMs - elapsed);
      setTimeLeft(remaining);
      return remaining;
    };

    const remaining = tick();
    if (remaining <= 0) return;

    const interval = setInterval(() => {
      const remaining = tick();
      if (remaining <= 0) clearInterval(interval);
    }, 200);

    return () => clearInterval(interval);
  }, [gameDoc?.status, gameDoc?.state?.startedAt, gameDoc?.config?.timeLimit]);

  // ── Shake animation ───────────────────────────────────────────────────────

  const triggerShake = useCallback(() => {
    setShaking(true);
    setTimeout(() => setShaking(false), 600);
  }, []);

  // ── Turn logic ────────────────────────────────────────────────────────────

  const isMyTurn = useCallback((uid) => {
    if (!gameDoc || !uid || gameDoc.status !== 'playing') return false;
    const { mode } = gameDoc.config;
    if (mode === GAME_MODES.BLITZ) {
      return gameDoc.state.lastPlayerId !== uid;
    }
    return gameDoc.state.currentTurnUid === uid;
  }, [gameDoc]);

  // ── Submit word ───────────────────────────────────────────────────────────

  const submitWord = useCallback(async (word, uid, dictionary) => {
    if (!gameDoc || !uid) return { success: false, error: 'לא מוכן' };

    const normalized = normalizeWord(word);

    if (!isWordLongEnough(normalized)) {
      triggerShake();
      return { success: false, error: 'מילה קצרה מדי' };
    }

    if (!isValidChain(normalized, gameDoc.state.lastWord)) {
      triggerShake();
      const required = gameDoc.state.lastWord
        ? `המילה חייבת להתחיל ב-${getRequiredStartForDisplay(gameDoc.state.lastWord)}`
        : 'שגיאה בשרשרת';
      return { success: false, error: required };
    }

    if (gameDoc.state.usedWords?.includes(normalized)) {
      triggerShake();
      return { success: false, error: 'המילה כבר שומשה' };
    }

    if (dictionary && !dictionary.has(normalized)) {
      triggerShake();
      return { success: false, error: 'המילה לא נמצאה במילון' };
    }

    const score = calculateScore(normalized);

    try {
      // Pass original word (for display) and normalized word (for dedup separately)
      await fsSubmitWord(gameId, uid, word, normalized, score, gameDoc);
      return { success: true, score };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [gameDoc, gameId, triggerShake]);

  // ── Skip turn ─────────────────────────────────────────────────────────────

  const skipTurn = useCallback(async (uid) => {
    if (!gameDoc || !uid) return;
    try {
      await fsSkipTurn(gameId, uid, gameDoc);
    } catch (err) {
      console.error('skip error', err);
    }
  }, [gameDoc, gameId]);

  // ── End game ──────────────────────────────────────────────────────────────

  const endGame = useCallback(async () => {
    try {
      await fsEndGame(gameId);
    } catch (err) {
      console.error('endGame error', err);
    }
  }, [gameId]);

  return {
    gameDoc,
    loading,
    error,
    shaking,
    timeLeft,
    isMyTurn,
    submitWord,
    skipTurn,
    endGame,
    triggerShake,
  };
}

// Helper: get required start letter for display (no import cycle)
function getRequiredStartForDisplay(word) {
  const FINAL_MAP = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };
  const chars = [...word];
  const last = chars[chars.length - 1];
  return FINAL_MAP[last] || last;
}
