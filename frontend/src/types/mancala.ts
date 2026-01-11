export type Player = 1 | 2;
export type GameMode = 'single-player' | 'multiplayer' | 'online';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameStatus = 'waiting' | 'playing' | 'finished';

export interface MancalaState {
  // Board state: [player1 pits (6), player1 store, player2 pits (6), player2 store]
  board: number[];
  currentPlayer: Player;
  gameStatus: GameStatus;
  gameMode: GameMode;
  difficulty?: Difficulty;
  winner?: Player | 'tie';
  player2Name?: string; // Player 2 name for local multiplayer
  lastMove?: {
    pitIndex: number;
    player: Player;
  };
}
