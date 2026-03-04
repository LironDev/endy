/**
 * Centralized Framer Motion variant objects.
 * Import from here in all components to keep animation logic consistent.
 */

// ── Word Bubble ──────────────────────────────────────────────────────────────

export const bubbleEnterVariants = {
  initial: { scale: 0.6, opacity: 0, y: 20 },
  animate: {
    scale: 1, opacity: 1, y: 0,
    transition: { type: 'spring', stiffness: 280, damping: 22 },
  },
  exit: {
    scale: 1.15, opacity: 0, y: -15,
    transition: { duration: 0.18 },
  },
};

// Continuous outer glow pulse
export const bubbleGlowVariants = {
  animate: {
    scale: [1, 1.06, 1],
    opacity: [0.25, 0.5, 0.25],
    transition: { duration: 2.2, repeat: Infinity, ease: 'easeInOut' },
  },
};

// ── Last Letter Badge ─────────────────────────────────────────────────────────

export const lastLetterPulse = {
  animate: {
    boxShadow: [
      '0 0 8px #a855f7, 0 0 16px #a855f7',
      '0 0 18px #a855f7, 0 0 40px #a855f7, 0 0 60px rgba(168,85,247,0.4)',
      '0 0 8px #a855f7, 0 0 16px #a855f7',
    ],
    transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
  },
};

// ── Word Input Shake ──────────────────────────────────────────────────────────

export const shakeVariants = {
  idle: { x: 0 },
  shake: {
    x: [0, -10, 10, -10, 10, -6, 6, -3, 3, 0],
    transition: { duration: 0.5, ease: 'linear' },
  },
};

// ── Score Particle ────────────────────────────────────────────────────────────

// Positions are injected at runtime via the `custom` prop
export const particleVariants = {
  initial: (c) => ({
    x: c.startX,
    y: c.startY,
    opacity: 1,
    scale: 1.3,
  }),
  animate: (c) => ({
    x: c.endX,
    y: c.endY,
    opacity: 0,
    scale: 0.5,
    transition: {
      duration: 0.75,
      ease: [0.15, 0.85, 0.35, 1],
    },
  }),
};

// ── Leaderboard ───────────────────────────────────────────────────────────────

export const leaderboardRowVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 220, damping: 24 } },
  exit: { opacity: 0, x: -16, transition: { duration: 0.15 } },
};

// Score pop when a player gets points
export const scorePop = {
  initial: { scale: 1 },
  pop: {
    scale: [1, 1.4, 1],
    color: ['#e9d5ff', '#a855f7', '#e9d5ff'],
    transition: { duration: 0.4 },
  },
};

// ── Player Join (Lobby) ───────────────────────────────────────────────────────

export const playerJoinVariants = {
  initial: { opacity: 0, x: 40 },
  animate: {
    opacity: 1, x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
  exit: {
    opacity: 0, x: -20,
    transition: { duration: 0.15 },
  },
};

// ── Game Over ─────────────────────────────────────────────────────────────────

export const gameOverContainerVariants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.07 } },
};

export const gameOverItemVariants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1, y: 0,
    transition: { type: 'spring', stiffness: 200, damping: 22 },
  },
};

// ── Home Screen ───────────────────────────────────────────────────────────────

export const homeCardVariants = {
  initial: { opacity: 0, y: 30, scale: 0.96 },
  animate: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export const homeLogoVariants = {
  initial: { opacity: 0, y: -30 },
  animate: {
    opacity: 1, y: 0,
    transition: { duration: 0.7, type: 'spring', stiffness: 120 },
  },
};

// ── Generic ───────────────────────────────────────────────────────────────────

export const fadeInVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const slideUpVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};
