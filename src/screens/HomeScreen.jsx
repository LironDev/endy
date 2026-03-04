import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { homeLogoVariants, homeCardVariants } from '../animations/variants';
import { AppLogo } from '../components/AppLogo';

// Floating star background particles
function CosmicStars() {
  const stars = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    delay: Math.random() * 3,
    duration: 3 + Math.random() * 4,
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {stars.map(star => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-purple-300/50"
          style={{ left: `${star.x}%`, top: `${star.y}%`, width: star.size, height: star.size }}
          animate={{ y: [-12, 12], opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: star.duration, repeat: Infinity, delay: star.delay }}
        />
      ))}
    </div>
  );
}

export function HomeScreen({ onCreateGame, onJoinGame }) {
  const [name, setName] = useState(() => localStorage.getItem('endy_name') || '');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'join'

  // Auto-fill join code from URL ?game= param
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('game');
    if (code) {
      setJoinCode(code.toUpperCase());
      setActiveTab('join');
    }
  }, []);

  const saveName = (n) => {
    localStorage.setItem('endy_name', n.trim());
  };

  const handleCreate = async () => {
    if (!name.trim()) { toast.error('הכנס/י שם קודם'); return; }
    saveName(name);
    setLoading(true);
    try {
      await onCreateGame(name.trim());
    } catch (e) {
      toast.error(e.message || 'שגיאה ביצירת המשחק');
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!name.trim()) { toast.error('הכנס/י שם קודם'); return; }
    if (joinCode.length !== 6) { toast.error('קוד המשחק חייב להיות 6 תווים'); return; }
    saveName(name);
    setLoading(true);
    try {
      await onJoinGame(joinCode.toUpperCase(), name.trim());
    } catch (e) {
      toast.error(e.message || 'לא הצלחנו להצטרף למשחק');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen cosmic-bg flex flex-col items-center justify-center p-4 relative" dir="rtl">
      <CosmicStars />

      {/* Logo / Header */}
      <motion.div
        variants={homeLogoVariants}
        initial="initial"
        animate="animate"
        className="mb-8 text-center z-10"
      >
        <div className="flex justify-center mb-3">
          <AppLogo size={72} />
        </div>
        <h1 className="text-7xl sm:text-8xl font-black neon-text text-white leading-none mb-2">
          אנדי
        </h1>
        <p className="text-purple-300/60 text-base tracking-wide">
          שרשרת מילים עברית • מרובה שחקנים
        </p>
      </motion.div>

      {/* Main card */}
      <motion.div
        variants={homeCardVariants}
        initial="initial"
        animate="animate"
        className="w-full max-w-sm glass-card z-10"
      >
        {/* Name input */}
        <div className="mb-5">
          <label className="block text-purple-300/70 text-sm mb-1.5">השם שלך</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="איך קוראים לך?"
            className="rtl-input text-lg"
            maxLength={20}
            autoFocus
          />
        </div>

        {/* Tab buttons */}
        <div className="flex gap-1 mb-5 bg-purple-950/60 rounded-xl p-1">
          {[{ id: 'create', label: '✨ צור משחק' }, { id: 'join', label: '🎮 הצטרף' }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50'
                  : 'text-purple-400 hover:text-purple-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Create game tab */}
        {activeTab === 'create' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <button
              onClick={handleCreate}
              disabled={loading}
              className="neon-btn w-full py-4 text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
                  />
                  יוצר משחק...
                </span>
              ) : (
                'צור משחק חדש'
              )}
            </button>
            <p className="text-purple-400/50 text-xs text-center mt-3">
              תהיה/י המארח/ת ותוכל/י להגדיר את חוקי המשחק
            </p>
          </motion.div>
        )}

        {/* Join game tab */}
        {activeTab === 'join' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
            <div>
              <label className="block text-purple-300/70 text-sm mb-1.5">קוד משחק</label>
              <input
                type="text"
                dir="ltr"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                onPaste={e => {
                  e.preventDefault();
                  const pasted = e.clipboardData.getData('text');
                  // If they pasted a full URL, extract the ?game= code
                  const urlMatch = pasted.match(/[?&]game=([A-Za-z0-9]{4,8})/i);
                  if (urlMatch) {
                    setJoinCode(urlMatch[1].toUpperCase().slice(0, 6));
                    return;
                  }
                  // Otherwise take first 6 alphanumeric chars
                  setJoinCode(pasted.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6));
                }}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                placeholder="ABCDEF"
                className="rtl-input text-center text-2xl tracking-[0.35em] font-mono uppercase"
                maxLength={6}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
              />
              <p className="text-purple-400/40 text-xs text-center mt-1">
                אפשר גם להדביק את הקישור כולו
              </p>
            </div>
            <button
              onClick={handleJoin}
              disabled={loading || joinCode.length !== 6}
              className="neon-btn w-full py-4 text-lg disabled:opacity-40"
            >
              {loading ? 'מצטרף...' : 'הצטרף למשחק'}
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Version footer */}
      <p className="absolute bottom-4 text-purple-700/40 text-xs z-10">אנדי v0.1</p>
    </div>
  );
}
