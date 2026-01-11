import { create } from 'zustand';
import { makeMove as makeGameMove } from '../services/mancalaGame';
import type { GameMode, Difficulty, MancalaState } from '../types/mancala';

// Re-export types for convenience
export type { Player, GameMode, Difficulty, MancalaState } from '../types/mancala';

interface MancalaStore {
  gameState: MancalaState | null;
  initializeGame: (mode: GameMode, difficulty?: Difficulty, player2Name?: string) => void;
  makeMove: (pitIndex: number) => boolean;
  resetGame: () => void;
  setGameState: (state: MancalaState) => void;
}

const INITIAL_BOARD = [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0]; // 6 pits per player + 1 store each

export const useMancalaStore = create<MancalaStore>((set, get) => ({
  gameState: null,
  initializeGame: (mode, difficulty, player2Name) =>
    set({
      gameState: {
        board: [...INITIAL_BOARD],
        currentPlayer: 1,
        gameStatus: 'playing',
        gameMode: mode,
        difficulty,
        player2Name,
      },
    }),
  makeMove: (pitIndex) => {
    const state = get().gameState;
    if (!state) return false;

    try {
      const result = makeGameMove(state, pitIndex);
      set({ gameState: result.newState });
      return true;
    } catch (error) {
      console.error('Invalid move:', error);
      return false;
    }
  },
  resetGame: () =>
    set({
      gameState: null,
    }),
  setGameState: (state) =>
    set({
      gameState: state,
    }),
}));
