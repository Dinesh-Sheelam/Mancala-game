import { Router, Request, Response } from 'express';
import { Server } from 'socket.io';
import { createRoom, getRoomByCode, getRoomById, joinRoom, updateRoom } from '../services/roomService';

const router = Router();

router.post('/create', (req, res) => {
  const { playerId, playerName } = req.body;
  if (!playerId || !playerName) {
    return res.status(400).json({ error: 'Player ID and name required' });
  }

  const room = createRoom(playerId, playerName);
  res.json(room);
});

router.post('/join', (req: Request & { io?: Server }, res: Response) => {
  const { code, playerId, playerName } = req.body;
  
  console.log('=== REST /join: Request received ===', {
    code,
    playerId,
    playerName,
    hasIo: !!req.io
  });
  
  if (!code || !playerId || !playerName) {
    console.log('=== REST /join: Missing required fields ===', { code, playerId, playerName });
    return res.status(400).json({ error: 'Room code, player ID, and name required' });
  }

  const room = joinRoom(code, playerId, playerName);
  if (!room) {
    console.log('=== REST /join: joinRoom returned null ===', { code, playerId });
    return res.status(404).json({ error: 'Room not found or full' });
  }

  // Log the room state before sending response
  console.log('=== REST /join: Room state before response ===', {
    roomId: room.id,
    roomCode: room.code,
    player1: room.player1,
    player2: room.player2,
    player1Name: room.player1Name,
    player2Name: room.player2Name,
    hasGameState: !!room.gameState,
    gameState: room.gameState ? {
      currentPlayer: room.gameState.currentPlayer,
      gameStatus: room.gameState.gameStatus,
      board: room.gameState.board
    } : null,
    bothPlayersPresent: !!(room.player1 && room.player2),
    shouldHaveGameState: !!(room.player1 && room.player2),
    // Verify room in map matches returned room
    mapRoomPlayer2: getRoomById(room.id)?.player2,
    roomsMatch: getRoomById(room.id)?.player2 === room.player2
  });

  // Game is already initialized in joinRoom() if both players present
  // Emit socket events to notify all players in the room
  if (req.io && room.id) {
    console.log('=== REST /join: Emitting socket events ===', {
      roomId: room.id,
      roomCode: room.code,
      player1: room.player1,
      player2: room.player2,
      hasGameState: !!room.gameState,
      socketsInRoom: (req.io.sockets.adapter.rooms.get(room.id)?.size || 0)
    });
    
    // Notify all sockets in the room about the room update
    req.io.to(room.id).emit('room-update', room);
    
    // If game was just initialized, notify all players
    if (room.gameState) {
      // CRITICAL: Verify currentPlayer is 1 before emitting
      if (room.gameState.currentPlayer !== 1) {
        console.error('❌ CRITICAL: Game state has wrong currentPlayer before emitting!', {
          roomId: room.id,
          currentPlayer: room.gameState.currentPlayer,
          expected: 1
        });
        room.gameState.currentPlayer = 1; // Force to 1
        // Update room in map
        updateRoom(room.id, { gameState: room.gameState });
      }
      
      req.io.to(room.id).emit('game-started', { gameState: room.gameState });
      console.log('=== REST /join: Game started event emitted ===', {
        roomId: room.id,
        currentPlayer: room.gameState.currentPlayer,
        verified: room.gameState.currentPlayer === 1 ? '✅ CORRECT' : '❌ WRONG'
      });
    }
  } else {
    console.warn('=== REST /join: Cannot emit socket events ===', {
      hasIo: !!req.io,
      hasRoomId: !!room.id
    });
  }

  // Ensure gameState is included in response
  const responseRoom = {
    ...room,
    gameState: room.gameState || null // Explicitly include gameState (even if null)
  };

  console.log('=== REST /join: Sending response ===', {
    roomId: responseRoom.id,
    hasGameState: !!responseRoom.gameState,
    gameStateIncluded: 'gameState' in responseRoom
  });

  res.json(responseRoom);
});

router.get('/:code', (req, res) => {
  const { code } = req.params;
  const room = getRoomByCode(code);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json(room);
});

export default router;
