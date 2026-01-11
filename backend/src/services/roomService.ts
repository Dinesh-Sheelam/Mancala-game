import { v4 as uuidv4 } from 'uuid';
import { Room } from '../types';
import { initializeGame } from './mancalaService';

const rooms = new Map<string, Room>();

// Generate a 6-character alphanumeric code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function createRoom(playerId: string, playerName: string): Room {
  let code: string;
  let attempts = 0;
  
  // Ensure unique code
  do {
    code = generateRoomCode();
    attempts++;
    if (attempts > 100) {
      throw new Error('Failed to generate unique room code');
    }
  } while (Array.from(rooms.values()).some((room) => room.code === code));

  const room: Room = {
    id: uuidv4(),
    code,
    player1: playerId,
    player2: null,
    player1Name: playerName,
    player2Name: null,
    gameState: null,
    createdAt: Date.now(),
    lastActivity: Date.now(),
  };

  rooms.set(room.id, room);
  return room;
}

export function getRoomByCode(code: string): Room | undefined {
  return Array.from(rooms.values()).find((room) => room.code === code);
}

export function getRoomById(id: string): Room | undefined {
  return rooms.get(id);
}

export function joinRoom(code: string, playerId: string, playerName: string): Room | null {
  console.log('=== ROOM SERVICE: joinRoom called ===', {
    code,
    playerId,
    playerName,
    roomsCount: rooms.size
  });
  
  const room = getRoomByCode(code);
  if (!room) {
    console.log('=== ROOM SERVICE: Room not found ===', { code });
    return null;
  }

  console.log('=== ROOM SERVICE: Room found ===', {
    roomId: room.id,
    roomCode: room.code,
    currentPlayer1: room.player1,
    currentPlayer2: room.player2,
    joiningPlayerId: playerId,
    isPlayer1: room.player1 === playerId,
    isPlayer2: room.player2 === playerId
  });

  if (room.player1 === playerId || room.player2 === playerId) {
    console.log('=== ROOM SERVICE: Player already in room ===', { playerId });
    return room; // Already in room
  }

  if (room.player2) {
    console.log('=== ROOM SERVICE: Room is full ===', {
      roomId: room.id,
      player1: room.player1,
      player2: room.player2
    });
    return null; // Room is full
  }

  // Add player2
  console.log('=== ROOM SERVICE: Adding player2 ===', {
    roomId: room.id,
    roomCode: room.code,
    player1: room.player1,
    player2Before: room.player2,
    newPlayer2: playerId
  });
  
  room.player2 = playerId;
  room.player2Name = playerName;
  room.lastActivity = Date.now();
  
  console.log('=== ROOM SERVICE: After adding player2 ===', {
    roomId: room.id,
    roomCode: room.code,
    player1: room.player1,
    player2: room.player2,
    bothPlayersPresent: !!(room.player1 && room.player2),
    hasGameState: !!room.gameState
  });
  
  // SINGLE POINT OF GAME INITIALIZATION
  if (room.player1 && room.player2 && !room.gameState) {
    console.log('=== ROOM SERVICE: Initializing game ===', {
      roomId: room.id,
      player1: room.player1,
      player2: room.player2
    });
    
    const gameState = initializeGame();
    
    // CRITICAL: Force currentPlayer to 1 (room creator always goes first)
    // This is the single source of truth for game initialization
    gameState.currentPlayer = 1;
    
    console.log('=== ROOM SERVICE: Game initialized ===', {
      roomId: room.id,
      roomCode: room.code,
      player1: room.player1,
      player2: room.player2,
      currentPlayer: gameState.currentPlayer,
      verified: gameState.currentPlayer === 1 ? '✅ CORRECT' : '❌ WRONG - FORCED TO 1'
    });
    
    room.gameState = gameState;
  }
  
  rooms.set(room.id, room); // Ensure room is updated in the map
  
  // CRITICAL: Get fresh reference from Map to ensure we return the updated room
  const updatedRoom = rooms.get(room.id);
  if (!updatedRoom) {
    console.error('=== ROOM SERVICE: CRITICAL ERROR - Room disappeared from Map! ===', {
      roomId: room.id,
      roomCode: room.code
    });
    return null;
  }
  
  console.log('=== ROOM SERVICE: Final room state before return ===', {
    roomId: updatedRoom.id,
    roomCode: updatedRoom.code,
    player1: updatedRoom.player1,
    player2: updatedRoom.player2,
    hasGameState: !!updatedRoom.gameState,
    roomInMap: rooms.has(updatedRoom.id),
    mapRoomPlayer2: rooms.get(updatedRoom.id)?.player2,
    roomObjectMatch: updatedRoom === room,
    player2Match: updatedRoom.player2 === room.player2
  });
  
  // Verify player2 was actually set
  if (!updatedRoom.player2 && room.player2) {
    console.error('=== ROOM SERVICE: CRITICAL ERROR - player2 lost during Map update! ===', {
      roomId: room.id,
      originalPlayer2: room.player2,
      mapPlayer2: updatedRoom.player2
    });
    // Force update
    updatedRoom.player2 = room.player2;
    updatedRoom.player2Name = room.player2Name;
    rooms.set(updatedRoom.id, updatedRoom);
  }
  
  return updatedRoom;
}

export function updateRoom(roomId: string, updates: Partial<Room>): Room | null {
  const room = rooms.get(roomId);
  if (!room) {
    console.error('Cannot update room - room not found:', roomId);
    return null;
  }

  Object.assign(room, updates);
  room.lastActivity = Date.now();
  rooms.set(roomId, room); // Ensure room is saved back to map
  return room;
}

export function deleteRoom(roomId: string): boolean {
  return rooms.delete(roomId);
}

// Cleanup inactive rooms (older than 1 hour)
export function cleanupInactiveRooms(): void {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [id, room] of rooms.entries()) {
    if (room.lastActivity < oneHourAgo) {
      rooms.delete(id);
    }
  }
}

// Run cleanup every 30 minutes
setInterval(cleanupInactiveRooms, 30 * 60 * 1000);
