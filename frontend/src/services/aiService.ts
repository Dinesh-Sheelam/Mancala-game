import type { MancalaState, Difficulty, Player } from '../types/mancala';
import { makeMove } from './mancalaGame';

export function getAIMove(state: MancalaState, difficulty: Difficulty): number {
  const availableMoves = getAvailableMoves(state);

  if (availableMoves.length === 0) {
    return -1;
  }

  switch (difficulty) {
    case 'easy':
      return getEasyMove(availableMoves);
    case 'medium':
      return getMediumMove(state, availableMoves);
    case 'hard':
      return getHardMove(state, availableMoves);
    default:
      return getEasyMove(availableMoves);
  }
}

function getAvailableMoves(state: MancalaState): number[] {
  const { board, currentPlayer } = state;
  const moves: number[] = [];

  if (currentPlayer === 1) {
    for (let i = 0; i < 6; i++) {
      if (board[i] > 0) {
        moves.push(i);
      }
    }
  } else {
    for (let i = 7; i < 13; i++) {
      if (board[i] > 0) {
        moves.push(i);
      }
    }
  }

  return moves;
}

function getEasyMove(availableMoves: number[]): number {
  // Random move
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function getMediumMove(state: MancalaState, availableMoves: number[]): number {
  // Prioritize moves that:
  // 1. Land in own store (extra turn)
  // 2. Capture opponent seeds
  // 3. Avoid giving opponent capture opportunities

  let bestMove = availableMoves[0];
  let bestScore = -Infinity;

  for (const move of availableMoves) {
    try {
      const result = makeMove(state, move);
      let score = 0;

      // Extra turn is very valuable
      if (result.extraTurn) {
        score += 100;
      }

      // Capture is valuable
      if (result.captured) {
        score += 50;
      }

      // Store difference
      const storeDiff = result.newState.board[13] - result.newState.board[6];
      score += storeDiff * 10;

      // Avoid moves that give opponent extra turns or captures
      // (simplified check - look at opponent's next possible moves)
      if (!result.gameOver) {
        const opponentMoves = getOpponentAvailableMoves(result.newState);
        for (const oppMove of opponentMoves) {
          try {
            const oppResult = makeMove(result.newState, oppMove);
            if (oppResult.extraTurn) {
              score -= 30;
            }
            if (oppResult.captured) {
              score -= 20;
            }
          } catch {
            // Ignore invalid moves
          }
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    } catch {
      // Skip invalid moves
    }
  }

  return bestMove;
}

function getHardMove(state: MancalaState, availableMoves: number[]): number {
  // Minimax with alpha-beta pruning (simplified)
  let bestMove = availableMoves[0];
  let bestScore = -Infinity;
  const depth = 4;

  for (const move of availableMoves) {
    try {
      const result = makeMove(state, move);
      const score = minimax(result.newState, depth - 1, false, -Infinity, Infinity, state.currentPlayer);
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    } catch {
      // Skip invalid moves
    }
  }

  return bestMove;
}

function minimax(
  state: MancalaState,
  depth: number,
  maximizing: boolean,
  alpha: number,
  beta: number,
  originalPlayer: Player
): number {
  if (depth === 0 || state.gameStatus === 'finished') {
    return evaluateState(state, originalPlayer);
  }

  const availableMoves = getAvailableMoves(state);

  if (availableMoves.length === 0) {
    return evaluateState(state, originalPlayer);
  }

  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of availableMoves) {
      try {
        const result = makeMove(state, move);
        const evaluation = minimax(
          result.newState,
          result.extraTurn ? depth : depth - 1,
          result.extraTurn,
          alpha,
          beta,
          originalPlayer
        );
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      } catch {
        // Skip invalid moves
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of availableMoves) {
      try {
        const result = makeMove(state, move);
        const evaluation = minimax(
          result.newState,
          result.extraTurn ? depth : depth - 1,
          !result.extraTurn,
          alpha,
          beta,
          originalPlayer
        );
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      } catch {
        // Skip invalid moves
      }
    }
    return minEval;
  }
}

function evaluateState(state: MancalaState, player: Player): number {
  if (state.gameStatus === 'finished') {
    if (state.winner === player) return 1000;
    if (state.winner === 'tie') return 0;
    return -1000;
  }

  const storeDiff = player === 1
    ? state.board[6] - state.board[13]
    : state.board[13] - state.board[6];

  // Count seeds in own pits (potential)
  const ownPits = player === 1
    ? state.board.slice(0, 6).reduce((sum, seeds) => sum + seeds, 0)
    : state.board.slice(7, 13).reduce((sum, seeds) => sum + seeds, 0);

  return storeDiff * 10 + ownPits;
}

function getOpponentAvailableMoves(state: MancalaState): number[] {
  const { board, currentPlayer } = state;
  const moves: number[] = [];

  if (currentPlayer === 1) {
    for (let i = 7; i < 13; i++) {
      if (board[i] > 0) {
        moves.push(i);
      }
    }
  } else {
    for (let i = 0; i < 6; i++) {
      if (board[i] > 0) {
        moves.push(i);
      }
    }
  }

  return moves;
}
