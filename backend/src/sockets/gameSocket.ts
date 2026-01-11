import { Server, Socket } from 'socket.io';
import { getRoomById, getRoomByCode, updateRoom, deleteRoom } from '../services/roomService';
import { makeMove } from '../services/mancalaService';

export function setupGameSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-room', (roomId: string) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
      
      const room = getRoomById(roomId);
      if (room) {
        // Only broadcast existing state - never create it
        io.to(roomId).emit('room-update', room);
        
        // If game exists, broadcast it
        if (room.gameState) {
          io.to(roomId).emit('game-started', { gameState: room.gameState });
        }
      }
    });

    socket.on('leave-room', (roomId: string) => {
      socket.leave(roomId);
      console.log(`Socket ${socket.id} left room ${roomId}`);
    });

    socket.on('game-move', (data: { roomId: string; pitIndex: number; roomCode?: string; playerId?: string }) => {
      const { roomId, pitIndex, roomCode, playerId } = data;
      console.log('=== BACKEND: Game move received ===', { 
        roomId, 
        pitIndex, 
        roomCode, 
        playerId,
        socketId: socket.id,
        timestamp: new Date().toISOString()
      });
      
      // Try to find room by ID first, then by code as fallback
      let room = getRoomById(roomId);
      if (!room && roomCode) {
        room = getRoomByCode(roomCode);
        if (room) {
          console.log('Found room by code instead of ID');
        }
      }

      if (!room) {
        console.error('Room not found:', { roomId, roomCode });
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      if (!room.gameState) {
        console.error('Game state not found for room:', { roomId: room.id, roomCode: room.code, hasPlayers: !!(room.player1 && room.player2) });
        socket.emit('error', { message: 'Game not started yet' });
        return;
      }
      
      // Determine which player is making the move
      // Normalize playerId and room player IDs for comparison (trim whitespace, handle null/undefined)
      const normalizedPlayerId = playerId ? String(playerId).trim() : '';
      const normalizedPlayer1 = room.player1 ? String(room.player1).trim() : '';
      const normalizedPlayer2 = room.player2 ? String(room.player2).trim() : '';
      
      const isPlayer1 = normalizedPlayerId && (normalizedPlayer1 === normalizedPlayerId);
      const isPlayer2 = normalizedPlayerId && (normalizedPlayer2 === normalizedPlayerId);
      const movingPlayer = isPlayer1 ? 1 : (isPlayer2 ? 2 : null);
      
      console.log('=== BACKEND: Player identification ===', {
        playerId: normalizedPlayerId,
        roomPlayer1: normalizedPlayer1,
        roomPlayer2: normalizedPlayer2,
        isPlayer1,
        isPlayer2,
        movingPlayer,
        gameStateCurrentPlayer: room.gameState.currentPlayer,
        originalPlayerId: playerId,
        originalRoomPlayer1: room.player1,
        originalRoomPlayer2: room.player2
      });
      
      // Validate that the moving player matches the current player
      if (!movingPlayer) {
        console.error('=== BACKEND ERROR: Cannot identify moving player ===', {
          playerId: normalizedPlayerId,
          roomPlayer1: normalizedPlayer1,
          roomPlayer2: normalizedPlayer2,
          originalPlayerId: playerId,
          originalRoomPlayer1: room.player1,
          originalRoomPlayer2: room.player2,
          comparison: {
            player1Match: normalizedPlayer1 === normalizedPlayerId,
            player2Match: normalizedPlayer2 === normalizedPlayerId,
            player1Type: typeof room.player1,
            player2Type: typeof room.player2,
            playerIdType: typeof playerId
          }
        });
        socket.emit('error', { message: 'Cannot identify player. Please refresh and try again.' });
        return;
      }
      
      if (movingPlayer !== room.gameState.currentPlayer) {
        console.error('=== BACKEND ERROR: Wrong player trying to move ===', {
          movingPlayer,
          currentPlayer: room.gameState.currentPlayer,
          pitIndex,
          playerId: normalizedPlayerId,
          roomPlayer1: normalizedPlayer1,
          roomPlayer2: normalizedPlayer2
        });
        socket.emit('error', { message: `It's not your turn! Current player is ${room.gameState.currentPlayer}, but you are player ${movingPlayer}` });
        return;
      }
      
      // Log the gameState BEFORE validation
      console.log('=== BACKEND: Room gameState BEFORE validation ===', {
        roomId: room.id,
        roomCode: room.code,
        currentPlayer: room.gameState.currentPlayer,
        movingPlayer,
        gameStatus: room.gameState.gameStatus,
        board: room.gameState.board,
        fullGameState: JSON.stringify(room.gameState, null, 2)
      });
      
      // CRITICAL: Check if frontend and backend are in sync
      if (movingPlayer !== room.gameState.currentPlayer) {
        console.error('=== BACKEND: STATE MISMATCH DETECTED ===', {
          movingPlayer,
          backendCurrentPlayer: room.gameState.currentPlayer,
          playerId: normalizedPlayerId,
          roomPlayer1: normalizedPlayer1,
          roomPlayer2: normalizedPlayer2,
          message: 'Frontend thinks it\'s a different player\'s turn. State may be out of sync.'
        });
      }

      try {
        // Log full gameState for debugging
        console.log('=== BACKEND: Validating move ===', {
          roomId: room.id,
          roomCode: room.code,
          currentPlayer: room.gameState.currentPlayer,
          pitIndex,
          seedsInPit: room.gameState.board[pitIndex],
          board: room.gameState.board,
          gameStatus: room.gameState.gameStatus,
          fullGameState: JSON.stringify(room.gameState, null, 2)
        });
        
        // Check if pit index is valid
        if (pitIndex < 0 || pitIndex >= 14) {
          console.error('Invalid pit index:', pitIndex);
          socket.emit('error', { message: `Invalid pit index: ${pitIndex}. Must be between 0 and 13.` });
          return;
        }
        
        // Check if clicking on stores (cannot move from stores)
        if (pitIndex === 6 || pitIndex === 13) {
          console.error('Cannot move from store:', pitIndex);
          socket.emit('error', { message: 'Cannot move from store' });
          return;
        }
        
        // Validate the move belongs to the current player
        // Use movingPlayer if available, otherwise fall back to currentPlayer
        const currentPlayer = room.gameState.currentPlayer;
        const playerToValidate = movingPlayer || currentPlayer;
        
        console.log('=== BACKEND: Checking player validation ===', {
          currentPlayer,
          movingPlayer,
          playerToValidate,
          pitIndex,
          expectedRange: playerToValidate === 1 ? '0-5' : '7-12',
          isValid: playerToValidate === 1 
            ? (pitIndex >= 0 && pitIndex <= 5)
            : (pitIndex >= 7 && pitIndex <= 12)
        });
        
        // Validate pit belongs to the player making the move
        if (playerToValidate === 1) {
          if (pitIndex < 0 || pitIndex > 5) {
            console.error('=== BACKEND ERROR: Player 1 invalid move ===', {
              currentPlayer,
              movingPlayer,
              pitIndex,
              expectedRange: '0-5',
              board: room.gameState.board
            });
            socket.emit('error', { message: `Invalid move: Player 1 can only move from pits 0-5, got ${pitIndex}` });
            return;
          }
        } else if (playerToValidate === 2) {
          if (pitIndex < 7 || pitIndex > 12) {
            console.error('=== BACKEND ERROR: Player 2 invalid move ===', {
              currentPlayer,
              movingPlayer,
              pitIndex,
              expectedRange: '7-12',
              board: room.gameState.board
            });
            socket.emit('error', { message: `Invalid move: Player 2 can only move from pits 7-12, got ${pitIndex}` });
            return;
          }
        } else {
          console.error('=== BACKEND ERROR: Invalid player ===', {
            currentPlayer: room.gameState.currentPlayer,
            movingPlayer,
            gameState: room.gameState
          });
          socket.emit('error', { message: `Invalid game state: currentPlayer is ${room.gameState.currentPlayer}` });
          return;
        }

        // Check if pit has seeds
        if (room.gameState.board[pitIndex] === 0) {
          socket.emit('error', { message: 'Invalid move: Pit is empty' });
          return;
        }

        const result = makeMove(room.gameState, pitIndex);
        const updatedRoom = updateRoom(room.id, { gameState: result.newState });
        
        if (!updatedRoom) {
          socket.emit('error', { message: 'Failed to update room' });
          return;
        }

        // Broadcast to all clients in the room - use room.id to ensure correct room
        io.to(room.id).emit('game-update', {
          gameState: updatedRoom.gameState,
          extraTurn: result.extraTurn,
          captured: result.captured,
        });

        if (result.gameOver) {
          io.to(room.id).emit('game-over', {
            winner: result.winner,
            finalState: updatedRoom.gameState,
          });
        }
      } catch (error: any) {
        console.error('Move error:', error);
        socket.emit('error', { message: error.message || 'Invalid move' });
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}
