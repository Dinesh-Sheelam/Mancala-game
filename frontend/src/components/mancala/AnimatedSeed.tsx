/**
 * Animated Seed Component
 * 
 * Individual seed/marble with smooth animations
 */

import { motion } from 'framer-motion';

interface AnimatedSeedProps {
  index: number;
  colorIndex: number;
  x: number;
  y: number;
  delay?: number;
  isMoving?: boolean;
  targetX?: number;
  targetY?: number;
  size?: 'small' | 'medium'; // 'small' for stores (w-4 h-4), 'medium' for pits (w-5 h-5)
}

const marbleColors = [
  { gradient: 'from-red-500 via-red-600 to-red-700', shadow: 'shadow-[0_2px_4px_rgba(220,38,38,0.6),inset_0_1px_2px_rgba(255,255,255,0.4)]' },
  { gradient: 'from-green-500 via-green-600 to-green-700', shadow: 'shadow-[0_2px_4px_rgba(34,197,94,0.6),inset_0_1px_2px_rgba(255,255,255,0.4)]' },
  { gradient: 'from-blue-500 via-blue-600 to-blue-700', shadow: 'shadow-[0_2px_4px_rgba(59,130,246,0.6),inset_0_1px_2px_rgba(255,255,255,0.4)]' },
  { gradient: 'from-purple-500 via-purple-600 to-purple-700', shadow: 'shadow-[0_2px_4px_rgba(168,85,247,0.6),inset_0_1px_2px_rgba(255,255,255,0.4)]' },
];

export default function AnimatedSeed({ 
  index, 
  colorIndex, 
  x, 
  y, 
  delay = 0,
  isMoving = false,
  targetX,
  targetY,
  size = 'medium'
}: AnimatedSeedProps) {
  const marbleColor = marbleColors[colorIndex % 4];
  const sizeClass = size === 'small' ? 'w-4 h-4' : 'w-5 h-5';
  const offset = size === 'small' ? 2 : 2.5;

  if (isMoving && targetX !== undefined && targetY !== undefined) {
    // Animate seed moving to target position
    return (
      <motion.div
        key={`seed-moving-${index}`}
        className={`absolute ${sizeClass} rounded-full bg-gradient-to-br ${marbleColor.gradient} ${marbleColor.shadow} border border-white/30 z-50`}
        initial={{
          left: `${x - offset}%`,
          top: `${y - offset}%`,
          scale: 1,
        }}
        animate={{
          left: `${targetX - offset}%`,
          top: `${targetY - offset}%`,
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 0.4,
          delay,
          ease: 'easeInOut',
        }}
      />
    );
  }

  // Static seed with entrance animation
  return (
    <motion.div
      key={`seed-${index}`}
      className={`absolute ${sizeClass} rounded-full bg-gradient-to-br ${marbleColor.gradient} ${marbleColor.shadow} border border-white/30`}
      style={{
        left: `${x - offset}%`,
        top: `${y - offset}%`,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        duration: 0.3,
        delay: delay * 0.05,
        type: 'spring',
        stiffness: 200,
        damping: 15,
      }}
      whileHover={{ scale: 1.2, zIndex: 10 }}
    />
  );
}
