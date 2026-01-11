import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useMancalaStore } from '../../store/mancalaStore';
import Pit from './Pit';
import Store from './Store';

interface MancalaBoardProps {
  onPitClick: (pitIndex: number) => void;
  player1Name?: string;
  player2Name?: string;
  currentUserPlayer?: 1 | 2; // Which player is the current user (for online games)
}

export default function MancalaBoard({ onPitClick, player1Name = 'Player 1', player2Name = 'Player 2', currentUserPlayer }: MancalaBoardProps) {
  const gameState = useMancalaStore((state) => state.gameState);
  const prevBoardRef = useRef<number[] | null>(null);

  if (!gameState) {
    return <div className="text-white">No game in progress</div>;
  }

  const { board, currentPlayer } = gameState;

  // Track board changes for animations
  useEffect(() => {
    if (prevBoardRef.current && prevBoardRef.current.length === board.length) {
      // Board changed - animations will be handled by individual components
    }
    prevBoardRef.current = [...board];
  }, [board]);

  // Board layout: [P1 pits (0-5), P1 store (6), P2 pits (7-12), P2 store (13)]
  const player1Pits = board.slice(0, 6); // Pits 0-5 for Player 1
  const player1Store = board[6];
  const player2Pits = board.slice(7, 13); // Pits 7-12 for Player 2
  const player2Store = board[13];

  // Determine which player is viewing (for online games)
  // If currentUserPlayer is set, that's the viewing player
  // Otherwise, assume Player 1 is viewing (offline games)
  const viewingPlayer = currentUserPlayer || 1;
  
  // For offline multiplayer: both players see the same screen, so we need to allow clicks based on currentPlayer
  // For online games: use currentUserPlayer to determine whose turn it is
  // For single player: only Player 1 can click (AI is Player 2)
  const isMultiplayer = gameState.gameMode === 'multiplayer';
  const isPlayer1Turn = currentPlayer === 1;
  const isPlayer2Turn = currentPlayer === 2;
  
  // Determine which pits should be highlighted
  // Your pits: highlighted (amber/orange) when it's your turn (clickable)
  // Your pits: highlighted (blue) when it's NOT your turn (waiting indicator)
  // Opponent's pits: always grey (never highlighted, never clickable)
  
  // Render based on viewing player
  // If viewingPlayer === 1: Show Player 1 at bottom, Player 2 at top
  // If viewingPlayer === 2: Show Player 2 at bottom, Player 1 at top
  const isPlayer1Viewing = viewingPlayer === 1;
  
  // Determine which pits/stores to show at top (opponent) and bottom (you)
  // IMPORTANT: Opponent's pits must be REVERSED to maintain circular flow
  // Your pits: 0,1,2,3,4,5 (left to right)
  // Opponent's pits: 12,11,10,9,8,7 (right to left from your perspective) for circular flow
  const topPitsRaw = isPlayer1Viewing ? player2Pits : player1Pits;
  const topPits = [...topPitsRaw].reverse(); // Reverse for circular display
  const topStore = isPlayer1Viewing ? player2Store : player1Store;
  const topPlayer = isPlayer1Viewing ? 2 : 1;
  const topPlayerName = isPlayer1Viewing ? player2Name : player1Name;
  
  const bottomPits = isPlayer1Viewing ? player1Pits : player2Pits;
  const bottomStore = isPlayer1Viewing ? player1Store : player2Store;
  const bottomPlayer = isPlayer1Viewing ? 1 : 2;
  const bottomPlayerName = isPlayer1Viewing ? player1Name : player2Name;
  
  // For multiplayer: top pits (Player 2) are clickable when it's Player 2's turn
  // For multiplayer: bottom pits (Player 1) are clickable when it's Player 1's turn
  // For single player: only bottom pits (Player 1) are clickable
  // For online: use currentUserPlayer logic
  const topPitsClickable = isMultiplayer ? isPlayer2Turn : false;
  const bottomPitsClickable = currentUserPlayer 
    ? (currentPlayer === viewingPlayer) // Online: check if it's viewing player's turn
    : (isMultiplayer ? isPlayer1Turn : isPlayer1Turn); // Offline: Player 1 can always click in single-player, or when it's their turn in multiplayer
  
  // Highlighting: highlight your pits when it's your turn
  const topPitsHighlighted = isMultiplayer && isPlayer2Turn;
  const bottomPitsHighlighted = isPlayer1Turn || (currentUserPlayer && currentPlayer === viewingPlayer);
  const topPitsHighlightColor = 'orange';
  const bottomPitsHighlightColor = 'orange';

  return (
    <motion.div 
      className="rounded-3xl p-20 shadow-2xl relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        marginTop: '0.75in',
        background: `
          linear-gradient(135deg, #d4a574 0%, #b8956a 20%, #8b6f47 40%, #6b5537 60%, #4a3a26 80%, #3a2d1f 100%),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 3px,
            rgba(0,0,0,0.04) 3px,
            rgba(0,0,0,0.04) 6px
          ),
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(0,0,0,0.03) 3px,
            rgba(0,0,0,0.03) 6px
          ),
          radial-gradient(ellipse at 30% 30%, rgba(212, 165, 116, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 70%, rgba(139, 111, 71, 0.1) 0%, transparent 50%)
        `,
        boxShadow: `
          inset 0 4px 8px rgba(0,0,0,0.15),
          inset 0 -2px 4px rgba(0,0,0,0.1),
          0 12px 24px rgba(0,0,0,0.4),
          0 0 0 6px rgba(139, 111, 71, 0.3),
          0 0 0 10px rgba(107, 85, 55, 0.2),
          0 0 40px rgba(139, 111, 71, 0.3)
        `,
        border: '4px solid rgba(107, 85, 55, 0.8)',
        borderTopColor: 'rgba(212, 165, 116, 0.6)',
        borderLeftColor: 'rgba(212, 165, 116, 0.4)',
        borderRightColor: 'rgba(74, 58, 38, 0.9)',
        borderBottomColor: 'rgba(74, 58, 38, 0.9)',
      }}
    >
      {/* Enhanced wood grain overlay with depth */}
      <div 
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 30%, rgba(139, 111, 71, 0.4) 0%, transparent 40%),
            radial-gradient(ellipse at 80% 70%, rgba(107, 85, 55, 0.4) 0%, transparent 40%),
            radial-gradient(ellipse at 50% 50%, rgba(74, 58, 38, 0.3) 0%, transparent 50%),
            linear-gradient(45deg, transparent 48%, rgba(0,0,0,0.05) 49%, rgba(0,0,0,0.05) 51%, transparent 52%)
          `,
        }}
      />
      
      {/* Subtle shine effect */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
        }}
      />
      
      {/* Layout: Store (left) | Pits (middle) | Store (right) */}
      <div className="grid grid-cols-[auto,auto,auto] items-center justify-center gap-8 relative z-10">
        {/* Left Store - Top Player's Store */}
        <div className="flex items-center justify-center">
          <Store seeds={topStore} player={topPlayer} isActive={currentPlayer === topPlayer} playerName={topPlayerName} />
        </div>

        {/* Middle Section - Two Rows of Pits */}
        <div className="space-y-8">
          {/* Top Row - Player 2's pits (clickable in multiplayer when it's Player 2's turn) */}
          <div className="flex gap-4 justify-center">
            {topPits.map((seeds, displayIdx) => {
              const actualIndex = isPlayer1Viewing 
                ? 12 - displayIdx  // Player 2's pits: 12,11,10,9,8,7 (reversed)
                : 5 - displayIdx;  // Player 1's pits: 5,4,3,2,1,0 (reversed)
              
              return (
                <Pit
                  key={`top-${actualIndex}`}
                  seeds={seeds}
                  pitIndex={actualIndex}
                  player={topPlayer}
                  isActive={topPitsClickable}
                  isHighlighted={topPitsHighlighted && seeds > 0}
                  highlightColor={topPitsHighlightColor}
                  position="top"
                  onClick={(pitIdx) => {
                    onPitClick(pitIdx);
                  }}
                />
              );
            })}
          </div>

          {/* Bottom Row - Player 1's pits (clickable when it's Player 1's turn) */}
          <div className="flex gap-4 justify-center">
            {bottomPits.map((seeds, displayIdx) => {
              const actualIndex = isPlayer1Viewing 
                ? displayIdx      // Player 1's pits: 0-5
                : 7 + displayIdx; // Player 2's pits: 7-12
              
              return (
                <Pit
                  key={`bottom-${actualIndex}`}
                  seeds={seeds}
                  pitIndex={actualIndex}
                  player={bottomPlayer}
                  isActive={bottomPitsClickable}
                  isHighlighted={bottomPitsHighlighted && seeds > 0}
                  highlightColor={bottomPitsHighlightColor}
                  position="bottom"
                  onClick={(pitIdx) => {
                    onPitClick(pitIdx);
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Right Store - Bottom Player's Store */}
        <div className="flex items-center justify-center">
          <Store seeds={bottomStore} player={bottomPlayer} isActive={currentPlayer === bottomPlayer} playerName={bottomPlayerName} />
        </div>
      </div>
    </motion.div>
  );
}
