import { motion } from 'framer-motion';

const COLORS = [
  'bg-purple-600', 'bg-pink-600', 'bg-blue-600', 'bg-emerald-600',
  'bg-amber-600', 'bg-rose-600', 'bg-cyan-600', 'bg-indigo-600',
];

function getColor(name) {
  let hash = 0;
  for (const ch of (name || '?')) hash = hash * 31 + ch.charCodeAt(0);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name) {
  if (!name) return '?';
  const words = name.trim().split(/\s+/);
  return words.length >= 2
    ? words[0][0] + words[1][0]
    : name.slice(0, 2);
}

const EMOJI_SIZES = { xs: 'text-xs', sm: 'text-sm', md: 'text-xl', lg: 'text-3xl' };

export function PlayerAvatar({
  name,
  size = 'md',
  isOnline = false,
  isHost = false,
  emoji = null,
  avatarColor = null,
  onClick = null,
}) {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
  };

  const bgClass = avatarColor ? '' : getColor(name);
  const bgStyle = avatarColor ? { backgroundColor: avatarColor } : {};

  return (
    <div className="relative inline-block flex-shrink-0">
      <div
        className={`${sizes[size]} ${bgClass} rounded-full flex items-center justify-center font-bold text-white select-none transition-all ${
          onClick ? 'cursor-pointer hover:brightness-110 ring-2 ring-white/30 hover:ring-white/60' : ''
        }`}
        style={bgStyle}
        aria-label={name}
        onClick={onClick || undefined}
      >
        {emoji ? (
          <span
            className={EMOJI_SIZES[size]}
            style={{ lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {emoji}
          </span>
        ) : (
          getInitials(name)
        )}
      </div>

      {/* Edit badge — only when avatar is clickable */}
      {onClick && (
        <span className="absolute -bottom-0.5 -left-0.5 w-4 h-4 bg-white dark:bg-purple-900 rounded-full flex items-center justify-center text-[9px] shadow-sm pointer-events-none">
          ✏️
        </span>
      )}

      {/* Online indicator — border color adapts to theme via CSS variable */}
      {isOnline !== undefined && (
        <motion.span
          animate={isOnline ? { scale: [1, 1.3, 1], opacity: 1 } : { opacity: 0.4 }}
          transition={{ duration: 2, repeat: isOnline ? Infinity : 0 }}
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[var(--bg-surface)] ${
            isOnline ? 'bg-emerald-400' : 'bg-gray-400'
          }`}
        />
      )}

      {/* Host crown */}
      {isHost && (
        <span className="absolute -top-1 -right-1 text-xs leading-none">👑</span>
      )}
    </div>
  );
}
