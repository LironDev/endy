export const FINAL_LETTER_MAP = {
  'ך': 'כ',
  'ם': 'מ',
  'ן': 'נ',
  'ף': 'פ',
  'ץ': 'צ',
};

export const SCORE_BONUSES = {
  LONG_5: 2,
  LONG_8: 5,
};

export const GAME_MODES = {
  CLASSIC: 'classic',
  BLITZ: 'blitz',
};

export const GAME_STATUS = {
  LOBBY: 'lobby',
  PLAYING: 'playing',
  ENDED: 'ended',
};

// No ambiguous chars (0/O, 1/I/l)
export const GAME_ID_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export const DEFAULT_CONFIG = {
  mode: GAME_MODES.CLASSIC,
  target: 50,
  timeLimit: 300,
};

export const MAX_PLAYERS = 8;
export const MIN_WORD_LENGTH = 2;
export const TURN_TIME_LIMIT = 20; // seconds per turn
