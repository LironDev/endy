import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerAvatar } from './PlayerAvatar';
import { updatePlayerAvatar } from '../firebase/gameService';

const EMOJIS = [
  '😀', '😎', '🤩', '🥳', '🤖', '👾',
  '🦊', '🐱', '🐶', '🐸', '🦁', '🐼',
  '🐨', '🦄', '🐉', '🦋', '🌟', '⚡',
  '🔥', '💎', '🎯', '🏆', '✨', '🎪',
];

const COLOR_OPTIONS = [
  '#7c3aed', // purple
  '#db2777', // pink
  '#2563eb', // blue
  '#059669', // emerald
  '#d97706', // amber
  '#e11d48', // rose
  '#0891b2', // cyan
  '#4338ca', // indigo
];

export function AvatarPicker({ gameId, uid, playerName, currentEmoji, currentColor, onClose }) {
  const [selectedEmoji, setSelectedEmoji] = useState(currentEmoji || null);
  const [selectedColor, setSelectedColor] = useState(currentColor || COLOR_OPTIONS[0]);
  const [saving, setSaving] = useState(false);

  const save = async (emoji, color) => {
    setSaving(true);
    try {
      await updatePlayerAvatar(gameId, uid, emoji, color);
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setSelectedEmoji(emoji);
    save(emoji, selectedColor);
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    save(selectedEmoji, color);
  };

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 22, stiffness: 320 }}
          className="glass-card w-full max-w-xs"
          onClick={e => e.stopPropagation()}
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-purple-900 dark:text-white font-bold text-base">עיצוב דמות</h2>
            <button
              onClick={onClose}
              className="text-purple-400 hover:text-purple-700 dark:text-purple-500 dark:hover:text-purple-300 text-lg leading-none w-7 h-7 flex items-center justify-center rounded-full hover:bg-purple-100/60 dark:hover:bg-purple-800/40 transition-all"
            >
              ✕
            </button>
          </div>

          {/* Live preview */}
          <div className="flex justify-center mb-5">
            <motion.div
              animate={saving ? { opacity: 0.7 } : { opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <PlayerAvatar
                name={playerName}
                size="lg"
                emoji={selectedEmoji}
                avatarColor={selectedColor}
              />
            </motion.div>
          </div>

          {/* Emoji grid */}
          <p className="text-purple-600/80 dark:text-purple-400/70 text-xs mb-2 font-semibold">אימוגי</p>
          <div className="grid grid-cols-6 gap-1.5 mb-4">
            {EMOJIS.map(emoji => (
              <motion.button
                key={emoji}
                whileTap={{ scale: 0.85 }}
                onClick={() => handleEmojiSelect(emoji)}
                className={`w-full aspect-square rounded-xl text-xl flex items-center justify-center transition-all ${
                  selectedEmoji === emoji
                    ? 'bg-purple-500 shadow-lg shadow-purple-500/40 scale-105'
                    : 'bg-purple-100/70 dark:bg-purple-900/50 hover:bg-purple-200/80 dark:hover:bg-purple-800/60'
                }`}
              >
                {emoji}
              </motion.button>
            ))}
          </div>

          {/* Color swatches */}
          <p className="text-purple-600/80 dark:text-purple-400/70 text-xs mb-2.5 font-semibold">צבע רקע</p>
          <div className="flex gap-2 justify-center mb-1">
            {COLOR_OPTIONS.map(color => (
              <motion.button
                key={color}
                whileTap={{ scale: 0.85 }}
                onClick={() => handleColorSelect(color)}
                style={{ backgroundColor: color }}
                className={`w-8 h-8 rounded-full transition-all ${
                  selectedColor === color
                    ? 'scale-125 ring-2 ring-white dark:ring-purple-200 ring-offset-2 ring-offset-transparent'
                    : 'hover:scale-110 opacity-80 hover:opacity-100'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
