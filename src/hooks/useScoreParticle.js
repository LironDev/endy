import { useState, useCallback, useRef } from 'react';

/**
 * Manages score particles that fly from the input area to the player's
 * leaderboard row. Uses DOM measurements for accurate start/end positions.
 */
export function useScoreParticle() {
  const [particles, setParticles] = useState([]);
  const inputRef = useRef(null);
  const leaderboardRefs = useRef({}); // { [uid]: HTMLElement }

  const spawnParticle = useCallback((uid, score) => {
    const inputEl = inputRef.current;
    const targetEl = leaderboardRefs.current[uid];

    if (!inputEl || !targetEl) return;

    const inputRect = inputEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    const particle = {
      id: `${Date.now()}-${Math.random()}`,
      label: `+${score}`,
      startX: inputRect.left + inputRect.width / 2,
      startY: inputRect.top + inputRect.height / 2,
      endX: targetRect.left + targetRect.width / 2,
      endY: targetRect.top + targetRect.height / 2,
    };

    setParticles(prev => [...prev, particle]);

    // Auto-remove after animation completes
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== particle.id));
    }, 900);
  }, []);

  const registerLeaderboardRef = useCallback((uid, el) => {
    if (el) {
      leaderboardRefs.current[uid] = el;
    } else {
      delete leaderboardRefs.current[uid];
    }
  }, []);

  return {
    particles,
    spawnParticle,
    inputRef,
    registerLeaderboardRef,
  };
}
