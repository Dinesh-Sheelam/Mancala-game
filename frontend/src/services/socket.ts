import { io, Socket } from 'socket.io-client';
import type { MancalaState } from '../types/mancala';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

let socket: Socket | null = null;

export function connectSocket(): Socket {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinRoom(roomId: string): void {
  if (socket) {
    if (socket.connected) {
      socket.emit('join-room', roomId);
    } else {
      // Wait for connection before joining room
      socket.once('connect', () => {
        socket?.emit('join-room', roomId);
      });
      // If not connected at all, connect first
      if (!socket.connected) {
        socket.connect();
      }
    }
  }
}

export function leaveRoom(roomId: string): void {
  if (socket) {
    socket.emit('leave-room', roomId);
  }
}

export function makeMove(roomId: string, pitIndex: number, roomCode?: string, playerId?: string): void {
  if (socket && socket.connected) {
    socket.emit('game-move', { roomId, pitIndex, roomCode, playerId });
  } else {
    console.error('Socket not connected. Cannot make move.');
  }
}

export function onGameUpdate(callback: (data: { gameState: MancalaState; extraTurn: boolean; captured: boolean }) => void): void {
  if (socket) {
    socket.on('game-update', callback);
  }
}

export function onGameOver(callback: (data: { winner: 1 | 2 | 'tie'; finalState: MancalaState }) => void): void {
  if (socket) {
    socket.on('game-over', callback);
  }
}

export function onError(callback: (error: { message: string }) => void): void {
  if (socket) {
    socket.on('error', callback);
  }
}

export function offGameUpdate(callback?: (data: any) => void): void {
  if (socket) {
    socket.off('game-update', callback);
  }
}

export function offGameOver(callback?: (data: any) => void): void {
  if (socket) {
    socket.off('game-over', callback);
  }
}

export function offError(callback?: (error: any) => void): void {
  if (socket) {
    socket.off('error', callback);
  }
}

export function onRoomUpdate(callback: (room: any) => void): void {
  if (socket) {
    socket.on('room-update', callback);
  }
}

export function onGameStarted(callback: (data: { gameState: MancalaState }) => void): void {
  if (socket) {
    socket.on('game-started', callback);
  }
}

export function offRoomUpdate(callback?: (room: any) => void): void {
  if (socket) {
    socket.off('room-update', callback);
  }
}

export function offGameStarted(callback?: (data: any) => void): void {
  if (socket) {
    socket.off('game-started', callback);
  }
}
