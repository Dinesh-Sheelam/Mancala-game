import { motion, AnimatePresence } from 'framer-motion';
import AnimatedSeed from './AnimatedSeed';

interface StoreProps {
  seeds: number;
  player: 1 | 2;
  isActive: boolean;
  playerName?: string;
}

export default function Store({ seeds, player, isActive, playerName }: StoreProps) {
  const displayName = playerName || `Player ${player}`;
  
  // Calculate seed positions for store (vertical oval layout)
  const getSeedPositions = (count: number) => {
    const positions: Array<{ x: number; y: number }> = [];
    const cols = 4;
    
    for (let i = 0; i < Math.min(count, 20); i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const spacingX = 20;
      const spacingY = 18;
      const startX = 50 - ((cols - 1) * spacingX) / 2;
      const startY = 20 + (row * spacingY);
      
      // Add slight randomness for natural look
      const offsetX = (Math.sin(i * 0.5) * 3);
      const offsetY = (Math.cos(i * 0.7) * 3);
      
      positions.push({
        x: startX + col * spacingX + offsetX,
        y: startY + offsetY,
      });
    }
    
    return positions;
  };
  
  const seedPositions = getSeedPositions(seeds);

  return (
    <motion.div 
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Wooden number plaque at top */}
      <motion.div 
        className="px-4 py-2 rounded"
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
          className="text-white text-lg font-bold block" 
          style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.5)' }}
          key={seeds}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {seeds}
        </motion.span>
      </motion.div>

      {/* Store - vertical oval depression with enhanced styling */}
      <motion.div
        className="flex flex-col items-center justify-center p-5 relative overflow-hidden"
        whileHover={isActive ? { scale: 1.02 } : {}}
        style={{
          width: '100px',
          minHeight: '240px',
          clipPath: 'ellipse(50% 50%)',
          background: isActive
            ? 'radial-gradient(ellipse at 50% 30%, rgba(212, 165, 116, 0.4), rgba(139, 111, 71, 0.85) 35%, rgba(107, 85, 55, 0.95) 65%, rgba(74, 58, 38, 1))'
            : 'radial-gradient(ellipse at 50% 30%, rgba(212, 165, 116, 0.25), rgba(139, 111, 71, 0.75) 35%, rgba(107, 85, 55, 0.85) 65%, rgba(74, 58, 38, 0.95))',
          boxShadow: isActive
            ? 'inset 0 6px 12px rgba(0,0,0,0.5), inset 0 -2px 4px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.4), 0 0 0 4px rgba(251, 191, 36, 0.6), 0 0 20px rgba(251, 191, 36, 0.3)'
            : 'inset 0 6px 12px rgba(0,0,0,0.4), inset 0 -2px 4px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.3)',
          border: isActive ? '3px solid rgba(251, 191, 36, 0.7)' : '2px solid rgba(107, 85, 55, 0.4)',
        }}
      >
        {/* Animated seeds in store */}
        <div className="relative w-full h-full flex flex-wrap items-center justify-center gap-1 p-3">
          <AnimatePresence mode="popLayout">
            {seedPositions.map((pos, i) => (
              <AnimatedSeed
                key={`store-seed-${player}-${i}`}
                index={i}
                colorIndex={i}
                x={pos.x}
                y={pos.y}
                delay={i * 0.02}
                size="small"
              />
            ))}
          </AnimatePresence>
          
          {seeds > 20 && (
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
                +{seeds - 20}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Player name label at bottom */}
      <motion.div 
        className="text-sm font-semibold text-white/90" 
        style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.5)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {displayName}
      </motion.div>
    </motion.div>
  );
}
