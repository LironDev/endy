import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { particleVariants } from '../animations/variants';

function Particle({ particle }) {
  return (
    <motion.div
      custom={particle}
      variants={particleVariants}
      initial="initial"
      animate="animate"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        fontWeight: 900,
        fontSize: '1.5rem',
        color: '#a855f7',
        textShadow: '0 0 12px #a855f7, 0 0 24px rgba(168,85,247,0.5)',
        userSelect: 'none',
      }}
    >
      {particle.label}
    </motion.div>
  );
}

export function ScoreParticleLayer({ particles }) {
  if (!particles.length) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      {particles.map(p => (
        <Particle key={p.id} particle={p} />
      ))}
    </div>,
    document.body
  );
}
