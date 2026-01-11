export type Player = 1 | 2;
export type GameStatus = 'waiting' | 'playing' | 'finished';

export interface MancalaState {
  board: number[];
  currentPlayer: Player;
  gameStatus: GameStatus;
  winner?: Player | 'tie';
  lastMove?: {
    pitIndex: number;
    player: Player;
  };
}

export interface Room {
  id: string;
  code: string;
  player1: string | null;
  player2: string | null;
  player1Name: string | null;
  player2Name: string | null;
  gameState: MancalaState | null;
  createdAt: number;
  lastActivity: number;
}
