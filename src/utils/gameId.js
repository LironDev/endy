import { GAME_ID_ALPHABET } from './constants';

/**
 * Generates a random 6-character game ID using crypto.getRandomValues.
 * Uses a restricted alphabet to avoid ambiguous characters.
 */
export function generateGameId(length = 6) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => GAME_ID_ALPHABET[byte % GAME_ID_ALPHABET.length]).join('');
}

/**
 * Builds a shareable URL for a game.
 * Uses query param so it works on GitHub Pages without SPA redirect tricks.
 */
export function buildShareUrl(gameId) {
  const base = `${window.location.origin}${import.meta.env.BASE_URL}`;
  return `${base}?game=${gameId}`;
}

/**
 * Shares a game via native share API or clipboard fallback.
 */
export async function shareGame(gameId) {
  const url = buildShareUrl(gameId);
  const text = `הצטרפו אליי למשחק אנדי! קוד: ${gameId}`;

  if (navigator.share) {
    try {
      await navigator.share({ title: 'אנדי', text, url });
      return { method: 'share' };
    } catch {
      // User cancelled share, fall through to clipboard
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return { method: 'clipboard' };
  } catch {
    // Last resort fallback
    const input = document.createElement('input');
    input.value = url;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    return { method: 'clipboard' };
  }
}
