import { motion, AnimatePresence } from 'framer-motion';
import AnimatedSeed from './AnimatedSeed';

interface PitProps {
  seeds: number;
  pitIndex: number;
  player: 1 | 2;
  isActive: boolean;
  isHighlighted?: boolean;
  highlightColor?: 'orange' | 'blue';
  onClick: (pitIndex: number) => void;
  position?: 'top' | 'bottom'; // For positioning the number plaque
}

export default function Pit({ 
  seeds, 
  pitIndex, 
  player, 
  isActive, 
  isHighlighted = false, 
  highlightColor: _highlightColor = 'orange', 
  onClick,
  position = 'bottom'
}: PitProps) {
  const canClick = isActive && seeds > 0;
  const shouldHighlight = isHighlighted && seeds > 0;
  
  const isValidPitIndex = (player === 1 && pitIndex >= 0 && pitIndex <= 5) ||
                          (player === 2 && pitIndex >= 7 && pitIndex <= 12);
  
  if (!isValidPitIndex) {
    console.error('CRITICAL: Invalid pitIndex for player!', { player, pitIndex, seeds });
  }

  const handleClick = () => {
    if (!canClick) return;
    
    if (player === 1 && (pitIndex < 0 || pitIndex > 5)) {
      console.error('ERROR: Player 1 clicked invalid pit!', { pitIndex, player });
      return;
    }
    if (player === 2 && (pitIndex < 7 || pitIndex > 12)) {
      console.error('ERROR: Player 2 clicked invalid pit!', { pitIndex, player });
      return;
    }
    onClick(pitIndex);
  };

  // Calculate seed positions
  const getSeedPositions = (count: number) => {
    const positions: Array<{ x: number; y: number }> = [];
    
    if (count === 0) return positions;
    
    // Special arrangement for exactly 4 seeds - square pattern
    if (count === 4) {
      return [
        { x: 40, y: 40 },
        { x: 60, y: 40 },
        { x: 40, y: 60 },
        { x: 60, y: 60 },
      ];
    }
    
    // Arrange in circular pattern for other counts
    for (let i = 0; i < Math.min(count, 12); i++) {
      const angle = (i / Math.min(count, 12)) * 2 * Math.PI;
      const radius = count <= 4 ? 18 : count <= 6 ? 22 : count <= 8 ? 28 : 32;
      const centerX = 50;
      const centerY = 50;
      let x = centerX + radius * Math.cos(angle);
      let y = centerY + radius * Math.sin(angle);
      
      // Add slight randomness for natural look
      if (count > 4) {
        const offsetX = (Math.sin(i * 0.5) * 2);
        const offsetY = (Math.cos(i * 0.7) * 2);
        x += offsetX;
        y += offsetY;
      }
      
      positions.push({ x, y });
    }
    
    return positions;
  };
  
  const seedPositions = getSeedPositions(seeds);

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Wooden number plaque - above for top row, below for bottom row */}
      {position === 'top' && (
        <motion.div 
          className="relative z-20 px-3 py-1.5 rounded"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            background: 'linear-gradient(135deg, #8b6f47 0%, #6b5537 50%, #4a3a26 100%)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3), 0 0 0 1px rgba(74, 58, 38, 0.6)',
            border: '2px solid rgba(74, 58, 38, 0.7)',
          }}
        >
          <motion.span 
            className="text-white text-base font-bold block" 
            style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.5)' }}
            key={seeds}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {seeds}
          </motion.span>
        </motion.div>
      )}

      {/* Pit - circular depression in wood with enhanced styling */}
      <motion.button
        whileHover={canClick ? { scale: 1.08, y: -2 } : {}}
        whileTap={canClick ? { scale: 0.95 } : {}}
        onClick={handleClick}
        disabled={!canClick}
        className={`
          relative w-28 h-28 rounded-full transition-all duration-300
          ${canClick ? 'cursor-pointer' : 'cursor-not-allowed'}
        `}
        style={{
          background: canClick
            ? 'radial-gradient(circle at 30% 30%, rgba(212, 165, 116, 0.4), rgba(139, 111, 71, 0.85) 35%, rgba(107, 85, 55, 0.95) 65%, rgba(74, 58, 38, 1))'
            : seeds > 0
            ? 'radial-gradient(circle at 30% 30%, rgba(212, 165, 116, 0.25), rgba(139, 111, 71, 0.75) 35%, rgba(107, 85, 55, 0.85) 65%, rgba(74, 58, 38, 0.95))'
            : 'radial-gradient(circle at 30% 30%, rgba(232, 212, 184, 0.35), rgba(212, 165, 116, 0.65) 35%, rgba(184, 149, 106, 0.75) 65%, rgba(139, 111, 71, 0.85))',
          boxShadow: canClick
            ? 'inset 0 6px 12px rgba(0,0,0,0.5), inset 0 -2px 4px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.4), 0 0 0 4px rgba(251, 191, 36, 0.6), 0 0 20px rgba(251, 191, 36, 0.3)'
            : shouldHighlight
            ? 'inset 0 6px 12px rgba(0,0,0,0.4), inset 0 -2px 4px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.3), 0 0 0 3px rgba(59, 130, 246, 0.5), 0 0 15px rgba(59, 130, 246, 0.2)'
            : 'inset 0 6px 12px rgba(0,0,0,0.4), inset 0 -2px 4px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.3)',
          border: canClick 
            ? '3px solid rgba(251, 191, 36, 0.7)' 
            : shouldHighlight
            ? '2px solid rgba(59, 130, 246, 0.5)'
            : '2px solid rgba(107, 85, 55, 0.4)',
        }}
      >
        {/* Animated seeds */}
        <div className="absolute inset-0 flex items-center justify-center flex-wrap p-3">
          <AnimatePresence mode="popLayout">
            {seedPositions.map((pos, i) => (
              <AnimatedSeed
                key={`seed-${pitIndex}-${i}`}
                index={i}
                colorIndex={i}
                x={pos.x}
                y={pos.y}
                delay={i * 0.02}
              />
            ))}
          </AnimatePresence>
          
          {seeds > 12 && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-10"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div
                className="text-xs font-bold text-white rounded-full px-2 py-1"
                style={{
                  background: 'rgba(0,0,0,0.8)',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                +{seeds - 12}
              </div>
            </motion.div>
          )}
        </div>
      </motion.button>

      {/* Wooden number plaque - below for bottom row */}
      {position === 'bottom' && (
        <motion.div 
          className="relative z-20 px-3 py-1.5 rounded"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            background: 'linear-gradient(135deg, #8b6f47 0%, #6b5537 50%, #4a3a26 100%)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3), 0 0 0 1px rgba(74, 58, 38, 0.6)',
            border: '2px solid rgba(74, 58, 38, 0.7)',
          }}
        >
          <motion.span 
            className="text-white text-base font-bold block" 
            style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.5)' }}
            key={seeds}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {seeds}
          </motion.span>
        </motion.div>
      )}
    </div>
  );
}
