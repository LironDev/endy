import { FINAL_LETTER_MAP, SCORE_BONUSES, MIN_WORD_LENGTH } from './constants';

/**
 * Normalizes the last letter of a Hebrew word.
 * Converts final-form letters (ך,ם,ן,ף,ץ) → regular form (כ,מ,נ,פ,צ).
 * This enables consistent chain-rule checks and dictionary lookups.
 */
export function normalizeWord(word) {
  if (!word) return '';
  const trimmed = word.trim();
  const chars = [...trimmed]; // Unicode-safe spread
  const last = chars[chars.length - 1];
  if (FINAL_LETTER_MAP[last]) {
    chars[chars.length - 1] = FINAL_LETTER_MAP[last];
  }
  return chars.join('').toLowerCase();
}

/**
 * Returns the required starting letter for the next word.
 * Takes the last character of the current word and normalizes it.
 */
export function getRequiredStart(word) {
  if (!word) return null;
  const chars = [...word.trim()];
  if (chars.length === 0) return null;
  const last = chars[chars.length - 1];
  return FINAL_LETTER_MAP[last] || last;
}

/**
 * Checks if newWord correctly continues the chain from previousWord.
 */
export function isValidChain(newWord, previousWord) {
  if (!previousWord) return true; // first word: any valid word accepted
  const required = getRequiredStart(previousWord);
  const normalized = normalizeWord(newWord);
  return normalized.startsWith(required);
}

/**
 * Calculates the score for a submitted word.
 * Base: 1 pt per letter. Bonus: +2 for 5+ letters, +5 for 8+ letters (cumulative).
 */
export function calculateScore(word) {
  const len = [...word.trim()].length; // Unicode-safe length
  let score = len;
  if (len >= 5) score += SCORE_BONUSES.LONG_5;
  if (len >= 8) score += SCORE_BONUSES.LONG_8;
  return score;
}

/**
 * Checks minimum word length.
 */
export function isWordLongEnough(word) {
  return [...word.trim()].length >= MIN_WORD_LENGTH;
}

/**
 * Returns a human-readable description of the score breakdown.
 */
export function getScoreBreakdown(word) {
  const len = [...word.trim()].length;
  const parts = [`${len} אותיות = ${len} נקודות`];
  if (len >= 8) parts.push('+5 בונוס מילה ארוכה');
  else if (len >= 5) parts.push('+2 בונוס מילה ארוכה');
  return parts.join(' | ');
}
