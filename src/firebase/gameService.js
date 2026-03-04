import {
  doc, setDoc, updateDoc, getDoc,
  arrayUnion, increment, serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { generateGameId } from '../utils/gameId';
import { GAME_STATUS, DEFAULT_CONFIG } from '../utils/constants';

/**
 * Creates a new game in Firestore and returns the generated game ID.
 */
export async function createGame(hostUid, hostName, config = {}) {
  const gameId = generateGameId();
  const mergedConfig = { ...DEFAULT_CONFIG, ...config, hostId: hostUid };

  const gameData = {
    status: GAME_STATUS.LOBBY,
    config: mergedConfig,
    state: {
      lastWord: '',
      lastPlayerId: null,
      currentTurnUid: hostUid,
      usedWords: [],
      startedAt: null,
      winnerId: null,
    },
    players: {
      [hostUid]: {
        name: hostName,
        score: 0,
        isOnline: true,
        isHost: true,
        joinedAt: Date.now(),
      },
    },
    createdAt: serverTimestamp(),
  };

  await setDoc(doc(db, 'games', gameId), gameData);
  return gameId;
}

/**
 * Joins an existing lobby game.
 */
export async function joinGame(gameId, uid, name) {
  const gameRef = doc(db, 'games', gameId);
  const snap = await getDoc(gameRef);

  if (!snap.exists()) throw new Error('המשחק לא נמצא');
  const data = snap.data();
  if (data.status !== GAME_STATUS.LOBBY) throw new Error('המשחק כבר התחיל');
  if (Object.keys(data.players).length >= 8) throw new Error('המשחק מלא (מקסימום 8 שחקנים)');
  if (data.players[uid]) return; // already in game

  await updateDoc(gameRef, {
    [`players.${uid}`]: {
      name,
      score: 0,
      isOnline: true,
      isHost: false,
      joinedAt: Date.now(),
    },
  });
}

/**
 * Starts the game (host only). Sets status to 'playing' and records start time.
 * Accepts optional config to override settings the host changed in the lobby.
 */
export async function startGame(gameId, hostUid, config = null) {
  const gameRef = doc(db, 'games', gameId);
  const snap = await getDoc(gameRef);
  const data = snap.data();

  if (data.config.hostId !== hostUid) throw new Error('רק המארח יכול להתחיל את המשחק');
  if (Object.keys(data.players).length < 1) throw new Error('נדרש לפחות שחקן אחד');

  const playerUids = Object.keys(data.players);

  const updates = {
    status: GAME_STATUS.PLAYING,
    'state.currentTurnUid': playerUids[0],
    'state.startedAt': serverTimestamp(),
    'state.lastWord': '',
    'state.lastPlayerId': null,
    'state.usedWords': [],
    'state.winnerId': null,
  };

  if (config) {
    if (config.mode !== undefined) updates['config.mode'] = config.mode;
    if (config.target !== undefined) updates['config.target'] = config.target;
    if ('timeLimit' in config) updates['config.timeLimit'] = config.timeLimit;
  }

  await updateDoc(gameRef, updates);
}

/**
 * Submits a valid word. Updates chain state, scores, and advances the turn.
 * Uses `increment` to safely handle concurrent Blitz submissions.
 *
 * displayWord  — original word as typed (may contain final letters ך/ם/ן/ף/ץ).
 *                Stored in state.lastWord so the bubble shows the original spelling.
 * normalizedWord — last-letter normalized form used for deduplication in usedWords.
 */
export async function submitWord(gameId, uid, displayWord, normalizedWord, score, gameDoc) {
  const gameRef = doc(db, 'games', gameId);
  const playerUids = Object.keys(gameDoc.players);

  // Calculate next turn player (Classic mode cycles; Blitz is open)
  let nextTurnUid = uid;
  if (gameDoc.config.mode === 'classic') {
    const currentIdx = playerUids.indexOf(uid);
    nextTurnUid = playerUids[(currentIdx + 1) % playerUids.length];
  }

  const updates = {
    'state.lastWord': displayWord,       // original spelling for display
    'state.lastPlayerId': uid,
    'state.currentTurnUid': nextTurnUid,
    'state.usedWords': arrayUnion(normalizedWord), // normalized for dedup
    [`players.${uid}.score`]: increment(score),
  };

  // Check score win condition
  const currentScore = (gameDoc.players[uid]?.score || 0) + score;
  const target = gameDoc.config.target;
  if (target && currentScore >= target) {
    updates.status = GAME_STATUS.ENDED;
    updates['state.winnerId'] = uid;
  }

  await updateDoc(gameRef, updates);
  return { nextTurnUid };
}

/**
 * Skips the current player's turn (Classic mode only).
 * We derive the current player from state.currentTurnUid (not the passed uid)
 * to guard against stale-uid edge cases that could cause backward advancement.
 */
export async function skipTurn(gameId, uid, gameDoc) {
  const gameRef = doc(db, 'games', gameId);
  const playerUids = Object.keys(gameDoc.players);

  // Use the authoritative currentTurnUid from state, falling back to uid
  const currentUid = gameDoc.state?.currentTurnUid || uid;
  const currentIdx = playerUids.indexOf(currentUid);

  // If not found (shouldn't happen), default to first player
  const safeIdx = currentIdx === -1 ? 0 : currentIdx;
  const nextTurnUid = playerUids[(safeIdx + 1) % playerUids.length];

  await updateDoc(gameRef, {
    'state.currentTurnUid': nextTurnUid,
  });
}

/**
 * Ends the game immediately (host or timer expiry).
 */
export async function endGame(gameId) {
  await updateDoc(doc(db, 'games', gameId), {
    status: GAME_STATUS.ENDED,
  });
}

/**
 * Resets the game back to lobby state for a rematch.
 */
export async function resetGame(gameId, hostUid) {
  const gameRef = doc(db, 'games', gameId);
  const snap = await getDoc(gameRef);
  const data = snap.data();

  const scoreResets = {};
  Object.keys(data.players).forEach(uid => {
    scoreResets[`players.${uid}.score`] = 0;
  });

  await updateDoc(gameRef, {
    status: GAME_STATUS.LOBBY,
    'state.lastWord': '',
    'state.lastPlayerId': null,
    'state.currentTurnUid': hostUid,
    'state.usedWords': [],
    'state.startedAt': null,
    'state.winnerId': null,
    ...scoreResets,
  });
}

/**
 * Updates player online status.
 */
export async function setPlayerOnline(gameId, uid, isOnline) {
  try {
    await updateDoc(doc(db, 'games', gameId), {
      [`players.${uid}.isOnline`]: isOnline,
    });
  } catch {
    // Silently fail — game might have ended
  }
}
