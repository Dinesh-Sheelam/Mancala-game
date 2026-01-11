import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMancalaStore } from '../store/mancalaStore';
import { useUserStore } from '../store/userStore';
import MancalaBoard from '../components/mancala/MancalaBoard';
import Modal from '../components/common/Modal';
import AudioControls from '../components/landing/AudioControls';
import PageTransition from '../components/common/PageTransition';
import { getAIMove } from '../services/aiService';
import { playMoveSound, playCaptureSound, playGameEndSound } from '../services/audioService';
import { makeMove as makeGameMove } from '../services/mancalaGame';

export default function OfflineGame() {
  const navigate = useNavigate();
  const userName = useUserStore((state) => state.name);
  const gameState = useMancalaStore((state) => state.gameState);
  const makeMove = useMancalaStore((state) => state.makeMove);
  const resetGame = useMancalaStore((state) => state.resetGame);
  const [showGameOver, setShowGameOver] = useState(false);
  const [isAITurn, setIsAITurn] = useState(false);

  useEffect(() => {
    if (!gameState) {
      navigate('/game-selection');
      return;
    }
  }, [gameState, navigate]);

  useEffect(() => {
    if (!gameState) return;

    // Check if it's AI's turn (single player mode, player 2 is AI)
    if (
      gameState.gameMode === 'single-player' &&
      gameState.currentPlayer === 2 &&
      gameState.gameStatus === 'playing' &&
      !isAITurn
    ) {
      setIsAITurn(true);
      // Delay AI move for better UX
      setTimeout(() => {
        if (gameState.difficulty) {
          const aiMove = getAIMove(gameState, gameState.difficulty);
          if (aiMove !== -1) {
            const result = makeGameMove(gameState, aiMove);
            if (result.captured) {
              playCaptureSound();
            } else {
              playMoveSound();
            }
            makeMove(aiMove);
          }
        }
        setIsAITurn(false);
      }, 1000);
    }

    // Check for game over
    if (gameState.gameStatus === 'finished') {
      playGameEndSound();
      setShowGameOver(true);
    }
  }, [gameState, makeMove, isAITurn]);

  const handlePitClick = (pitIndex: number) => {
    if (!gameState) return;

    // Don't allow moves if it's AI's turn or game is over
    if (isAITurn || gameState.gameStatus !== 'playing') return;

    // In single player, only allow player 1 to move (AI is player 2)
    if (gameState.gameMode === 'single-player' && gameState.currentPlayer !== 1) {
      return;
    }

    // In multiplayer, validate that the pit belongs to the current player
    if (gameState.gameMode === 'multiplayer') {
      const isPlayer1Pit = pitIndex >= 0 && pitIndex <= 5;
      const isPlayer2Pit = pitIndex >= 7 && pitIndex <= 12;
      
      // Player 1 can only click their pits (0-5) when it's their turn
      if (gameState.currentPlayer === 1 && !isPlayer1Pit) {
        return;
      }
      // Player 2 can only click their pits (7-12) when it's their turn
      if (gameState.currentPlayer === 2 && !isPlayer2Pit) {
        return;
      }
    }

    // Play move sound and check for capture
    const result = makeGameMove(gameState, pitIndex);
    if (result.captured) {
      playCaptureSound();
    } else {
      playMoveSound();
    }

    makeMove(pitIndex);
  };

  const handleNewGame = () => {
    resetGame();
    setShowGameOver(false);
    navigate('/game-selection');
  };

  const handleBackToLanding = () => {
    resetGame();
    navigate('/landing');
  };

  if (!gameState) {
    return null;
  }

  const getWinnerText = () => {
    if (gameState.winner === 'tie') {
      return "It's a tie!";
    }
    if (gameState.gameMode === 'single-player') {
      if (gameState.winner === 1) {
        return 'You Win!';
      } else {
        return 'AI Wins!';
      }
    } else {
      // Multiplayer mode
      if (gameState.winner === 1) {
        return `${userName} Wins!`;
      } else {
        return `${gameState.player2Name || 'Player 2'} Wins!`;
      }
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 flex flex-col relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, 30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Audio Controls - Top Right */}
        <div className="absolute top-6 right-6 z-10">
          <AudioControls />
        </div>
        
        <div className="max-w-6xl mx-auto w-full flex flex-col flex-1 relative z-10">
          {/* Header - Top */}
          <motion.div
            className="mb-4 flex items-center justify-between flex-shrink-0"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.button
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBackToLanding}
              className="text-white/90 hover:text-white flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </motion.button>
            <div className="text-white">
              {gameState.gameMode === 'single-player' && gameState.difficulty && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30 shadow-lg"
                >
                  Difficulty: {gameState.difficulty.charAt(0).toUpperCase() + gameState.difficulty.slice(1)}
                </motion.span>
              )}
            </div>
          </motion.div>

        {/* Board - Centered */}
        <div className="flex-1 flex items-center justify-center">
          <MancalaBoard 
            onPitClick={handlePitClick}
            player1Name={userName}
            player2Name={gameState.gameMode === 'single-player' ? 'AI' : (gameState.player2Name || 'Player 2')}
          />
        </div>

          {/* Messages - Bottom with fixed height to prevent board movement */}
          <motion.div
            className="mt-6 flex-shrink-0 min-h-[120px] flex flex-col justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {isAITurn && (
              <motion.div
                className="flex justify-center mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="inline-block bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl border border-white/30 shadow-lg">
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    AI is thinking...
                  </motion.span>
                </div>
              </motion.div>
            )}

            {gameState.gameStatus === 'finished' && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-white text-xl font-semibold">
                  {userName}: {gameState.board[6]} seeds | {gameState.gameMode === 'multiplayer' ? (gameState.player2Name || 'Player 2') : 'AI'}: {gameState.board[13]} seeds
                </p>
              </motion.div>
            )}
            
            {/* Turn indicator for multiplayer */}
            {gameState.gameMode === 'multiplayer' && gameState.gameStatus === 'playing' && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={gameState.currentPlayer}
              >
                <p className="text-white text-lg font-semibold">
                  {gameState.currentPlayer === 1 
                    ? `${userName}'s Turn` 
                    : `${gameState.player2Name || 'Player 2'}'s Turn`}
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      <Modal isOpen={showGameOver} onClose={() => {}} title="Game Over">
        <div className="space-y-6">
          <motion.p
            className="text-3xl font-bold text-center text-gray-800"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {getWinnerText()}
          </motion.p>
          <p className="text-center text-gray-600 text-lg">
            Final Score: Player 1: {gameState.board[6]} | Player 2: {gameState.board[13]}
          </p>
          <div className="flex gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNewGame}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg font-semibold"
            >
              New Game
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBackToLanding}
              className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all shadow-lg font-semibold"
            >
              Back to Menu
            </motion.button>
          </div>
        </div>
      </Modal>
    </PageTransition>
  );
}
