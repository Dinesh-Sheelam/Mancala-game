import { MancalaState, Player } from '../types';

const INITIAL_BOARD = [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0];

export function initializeGame(): MancalaState {
  const gameState: MancalaState = {
    board: [...INITIAL_BOARD],
    currentPlayer: 1, // Player 1 (room creator) always starts
    gameStatus: 'playing',
  };
  
  // Double-check currentPlayer is 1
  if (gameState.currentPlayer !== 1) {
    console.error('❌ CRITICAL: initializeGame() returned wrong currentPlayer!', {
      currentPlayer: gameState.currentPlayer,
      expected: 1
    });
    gameState.currentPlayer = 1; // Force to 1
  }
  
  return gameState;
}

export interface MoveResult {
  newState: MancalaState;
  extraTurn: boolean;
  captured: boolean;
  gameOver: boolean;
  winner?: Player | 'tie';
}

export function makeMove(state: MancalaState, pitIndex: number): MoveResult {
  const { board, currentPlayer } = state;
  const newBoard = [...board];

  // Validate move
  if (!isValidMove(state, pitIndex)) {
    throw new Error('Invalid move');
  }

  // Get seeds from selected pit
  let seeds = newBoard[pitIndex];
  newBoard[pitIndex] = 0;

  // Distribute seeds counter-clockwise
  let currentIndex = pitIndex;
  let extraTurn = false;
  let captured = false;

  while (seeds > 0) {
    currentIndex = (currentIndex + 1) % 14;

    // Skip opponent's store
    if (currentPlayer === 1 && currentIndex === 13) {
      continue;
    }
    if (currentPlayer === 2 && currentIndex === 6) {
      continue;
    }

    newBoard[currentIndex]++;
    seeds--;

    // Check for extra turn (last seed lands in own store)
    if (seeds === 0) {
      if (currentPlayer === 1 && currentIndex === 6) {
        extraTurn = true;
      } else if (currentPlayer === 2 && currentIndex === 13) {
        extraTurn = true;
      }
      // Check for capture (last seed lands in own empty pit)
      else if (isOwnPit(currentPlayer, currentIndex) && newBoard[currentIndex] === 1) {
        const oppositeIndex = getOppositePit(currentIndex);
        if (oppositeIndex !== -1 && newBoard[oppositeIndex] > 0) {
          // Capture
          const capturedSeeds = newBoard[oppositeIndex];
          newBoard[oppositeIndex] = 0;
          newBoard[currentIndex] = 0;
          
          if (currentPlayer === 1) {
            newBoard[6] += capturedSeeds + 1;
          } else {
            newBoard[13] += capturedSeeds + 1;
          }
          captured = true;
        }
      }
    }
  }

  // Check for game over
  const player1PitsEmpty = newBoard.slice(0, 6).every((seeds) => seeds === 0);
  const player2PitsEmpty = newBoard.slice(7, 13).every((seeds) => seeds === 0);

  let gameOver = false;
  let winner: Player | 'tie' | undefined;

  if (player1PitsEmpty || player2PitsEmpty) {
    gameOver = true;
    // Collect remaining seeds
    if (player1PitsEmpty) {
      const remaining = newBoard.slice(7, 13).reduce((sum, seeds) => sum + seeds, 0);
      newBoard[13] += remaining;
      newBoard.splice(7, 6, ...new Array(6).fill(0));
    } else {
      const remaining = newBoard.slice(0, 6).reduce((sum, seeds) => sum + seeds, 0);
      newBoard[6] += remaining;
      newBoard.splice(0, 6, ...new Array(6).fill(0));
    }

    // Determine winner
    if (newBoard[6] > newBoard[13]) {
      winner = 1;
    } else if (newBoard[13] > newBoard[6]) {
      winner = 2;
    } else {
      winner = 'tie';
    }
  }

  const newState: MancalaState = {
    board: newBoard,
    currentPlayer: extraTurn ? currentPlayer : (currentPlayer === 1 ? 2 : 1),
    gameStatus: gameOver ? 'finished' : 'playing',
    winner,
    lastMove: {
      pitIndex,
      player: currentPlayer,
    },
  };

  return {
    newState,
    extraTurn,
    captured,
    gameOver,
    winner,
  };
}

function isValidMove(state: MancalaState, pitIndex: number): boolean {
  const { board, currentPlayer } = state;

  // Check if pit is valid for current player
  if (currentPlayer === 1) {
    if (pitIndex < 0 || pitIndex > 5) return false;
  } else {
    if (pitIndex < 7 || pitIndex > 12) return false;
  }

  // Check if pit has seeds
  return board[pitIndex] > 0;
}

function isOwnPit(player: Player, index: number): boolean {
  if (player === 1) {
    return index >= 0 && index <= 5;
  } else {
    return index >= 7 && index <= 12;
  }
}

function getOppositePit(index: number): number {
  // P1 pits (0-5) map to P2 pits (12-7)
  if (index >= 0 && index <= 5) {
    return 12 - index;
  }
  // P2 pits (7-12) map to P1 pits (5-0)
  if (index >= 7 && index <= 12) {
    return 12 - index;
  }
  return -1;
}
