import { useState, useEffect } from 'react';
import wordsRaw from '../data/he-words.json';
import { normalizeWord } from '../utils/hebrew';

/**
 * Loads the Hebrew dictionary into a normalized Set<string> for O(1) lookups.
 * Pre-normalizes all words (converts final letters) to match how we validate input.
 * Returns null while loading, then the Set once ready.
 */
export function useHebrewDictionary() {
  const [dictionary, setDictionary] = useState(null);

  useEffect(() => {
    // Defer to next tick so it doesn't block first render
    const timer = setTimeout(() => {
      const normalized = new Set(wordsRaw.map(w => normalizeWord(w)));
      setDictionary(normalized);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return dictionary;
}
