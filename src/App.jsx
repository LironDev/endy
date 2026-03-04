import { useState, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import { HomeScreen } from './screens/HomeScreen';
import { LobbyScreen } from './screens/LobbyScreen';
import { GameScreen } from './screens/GameScreen';
import { GameOverScreen } from './screens/GameOverScreen';
import { createGame, joinGame } from './firebase/gameService';
import { getCurrentUid } from './firebase/auth';
import { useGame } from './hooks/useGame';
import { useHebrewDictionary } from './hooks/useHebrewDictionary';
import { GAME_STATUS } from './utils/constants';
import { motion, AnimatePresence } from 'framer-motion';

const TOAST_STYLE = {
  background: '#1a0533',
  color: '#e9d5ff',
  border: '1px solid rgba(168,85,247,0.3)',
  fontFamily: "'Segoe UI', 'Arial Hebrew', Arial, sans-serif",
  direction: 'rtl',
};

function LoadingSpinner() {
  return (
    <div className="min-h-screen cosmic-bg flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 border-3 border-purple-800 border-t-purple-400 rounded-full"
      />
    </div>
  );
}

export default function App() {
  // Always start on HomeScreen (null).
  // HomeScreen reads the ?game= param to pre-fill the join code.
  // Only set gameId AFTER the user has explicitly joined/created (handleJoinGame / handleCreateGame).
  const [gameId, setGameId] = useState(null);

  const uid = getCurrentUid();

  const {
    gameDoc,
    loading,
    error,
    shaking,
    timeLeft,
    turnTimeLeft,
    isMyTurn,
    submitWord,
    skipTurn,
    endGame,
  } = useGame(gameId);

  const dictionary = useHebrewDictionary();

  const updateUrl = (id) => {
    if (id) {
      window.history.replaceState({}, '', `?game=${id}`);
    } else {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  const handleCreateGame = useCallback(async (name, config) => {
    const id = await createGame(uid, name, config);
    setGameId(id);
    updateUrl(id);
  }, [uid]);

  const handleJoinGame = useCallback(async (code, name) => {
    await joinGame(code, uid, name);
    setGameId(code);
    updateUrl(code);
  }, [uid]);

  const handleHome = useCallback(() => {
    setGameId(null);
    updateUrl(null);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen cosmic-bg flex flex-col items-center justify-center gap-4 p-6" dir="rtl">
        <p className="text-red-400 text-lg text-center">{error}</p>
        <button onClick={handleHome} className="neon-btn px-6 py-3">
          חזור לדף הבית
        </button>
      </div>
    );
  }

  if (gameId && (loading || !gameDoc)) {
    return <LoadingSpinner />;
  }

  const screen = !gameId
    ? 'home'
    : gameDoc?.status === GAME_STATUS.LOBBY
    ? 'lobby'
    : gameDoc?.status === GAME_STATUS.PLAYING
    ? 'game'
    : 'gameover';

  return (
    <>
      <Toaster position="top-center" toastOptions={{ style: TOAST_STYLE }} />

      <AnimatePresence mode="wait">
        {screen === 'home' && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HomeScreen onCreateGame={handleCreateGame} onJoinGame={handleJoinGame} />
          </motion.div>
        )}

        {screen === 'lobby' && gameDoc && (
          <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LobbyScreen gameDoc={gameDoc} gameId={gameId} uid={uid} onLeave={handleHome} />
          </motion.div>
        )}

        {screen === 'game' && gameDoc && (
          <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
            <GameScreen
              gameDoc={gameDoc}
              gameId={gameId}
              uid={uid}
              dictionary={dictionary}
              shaking={shaking}
              isMyTurn={isMyTurn}
              submitWord={submitWord}
              skipTurn={skipTurn}
              timeLeft={timeLeft}
              turnTimeLeft={turnTimeLeft}
              endGame={endGame}
            />
          </motion.div>
        )}

        {screen === 'gameover' && gameDoc && (
          <motion.div key="gameover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GameOverScreen gameDoc={gameDoc} gameId={gameId} uid={uid} onHome={handleHome} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
