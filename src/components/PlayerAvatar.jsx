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

export function PlayerAvatar({ name, size = 'md', isOnline = false, isHost = false }) {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
  };

  return (
    <div className="relative inline-block flex-shrink-0">
      <div
        className={`${sizes[size]} ${getColor(name)} rounded-full flex items-center justify-center font-bold text-white select-none`}
        aria-label={name}
      >
        {getInitials(name)}
      </div>

      {/* Online indicator */}
      {isOnline !== undefined && (
        <motion.span
          animate={isOnline ? { scale: [1, 1.3, 1], opacity: 1 } : { opacity: 0.4 }}
          transition={{ duration: 2, repeat: isOnline ? Infinity : 0 }}
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#1a0533] ${
            isOnline ? 'bg-emerald-400' : 'bg-gray-500'
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
