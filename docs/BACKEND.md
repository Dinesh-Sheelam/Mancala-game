# Mancala Game - Backend Documentation

## Overview

The backend is built with Node.js, Express.js, and Socket.io, providing REST API endpoints and real-time WebSocket communication for the Mancala game.

## Project Structure

```
backend/
├── src/
│   ├── server.ts              # Main server entry point
│   ├── routes/
│   │   └── rooms.ts           # REST API routes
│   ├── sockets/
│   │   └── gameSocket.ts      # Socket.io event handlers
│   ├── services/
│   │   ├── roomService.ts     # Room management logic
│   │   └── mancalaService.ts  # Game logic implementation
│   └── types/
│       └── index.ts           # TypeScript type definitions
├── package.json
├── tsconfig.json
└── .env (optional)
```

## Server Setup (`server.ts`)

### Responsibilities
- Initialize Express server
- Configure CORS
- Set up Socket.io server
- Register routes
- Start HTTP server

### Key Code
```typescript
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());
app.use('/api/rooms', roomsRouter);
setupGameSocket(io);
```

### Port Configuration
- Default: `3000`
- Configurable via `PORT` environment variable

## REST API Routes (`routes/rooms.ts`)

### Endpoints

#### POST `/api/rooms/create`
**Purpose**: Create a new game room

**Request Body**:
```typescript
{
  playerId: string;
  playerName: string;
}
```

**Response**:
```typescript
{
  id: string;           // UUID
  code: string;         // 6-character alphanumeric
  player1: string;      // Player ID
  player2: null;
  player1Name: string;
  player2Name: null;
  gameState: null;
  createdAt: number;
  lastActivity: number;
}
```

**Flow**:
1. Validate request body
2. Call `roomService.createRoom()`
3. Return room object

---

#### POST `/api/rooms/join`
**Purpose**: Join an existing room

**Request Body**:
```typescript
{
  code: string;         // Room code
  playerId: string;
  playerName: string;
}
```

**Response**: Updated room object with player2 set

**Flow**:
1. Validate request body
2. Call `roomService.joinRoom()`
   - Finds room by code
   - Adds player2
   - **Initializes game** (if both players present)
3. Emit socket events to notify all players
4. Return updated room

**Critical Logic**:
- Game initialization happens **only here** (single source of truth)
- Verifies `currentPlayer = 1` before emitting
- Broadcasts `room-update` and `game-started` events

---

#### GET `/api/rooms/:code`
**Purpose**: Get room information

**Response**: Room object or 404

**Use Case**: Polling fallback (though not recommended in production)

## Socket.io Handlers (`sockets/gameSocket.ts`)

### Event Handlers

#### `join-room`
**Purpose**: Add socket to a room for receiving broadcasts

**Flow**:
1. Socket joins the room
2. Get current room state
3. Broadcast `room-update` to all in room
4. If game exists, broadcast `game-started`

**Important**: This handler **never creates** game state, only broadcasts existing state.

---

#### `leave-room`
**Purpose**: Remove socket from room

**Flow**:
1. Socket leaves the room
2. Log the action

---

#### `game-move`
**Purpose**: Process a player's move

**Request Data**:
```typescript
{
  roomId: string;
  pitIndex: number;
  roomCode?: string;    // Fallback if roomId fails
  playerId?: string;     // For player identification
}
```

**Validation Steps**:
1. **Find Room**: Try by ID, fallback to code
2. **Check Game State**: Verify game exists and is playing
3. **Identify Player**: Match playerId to room.player1 or room.player2
4. **Validate Turn**: Check `movingPlayer === room.gameState.currentPlayer`
5. **Validate Pit**:
   - Index range (0-13)
   - Not a store (6 or 13)
   - Belongs to current player
   - Has seeds
6. **Process Move**: Call `mancalaService.makeMove()`
7. **Update Room**: Save new game state
8. **Broadcast**: Emit `game-update` to all in room
9. **Check Game Over**: If finished, emit `game-over`

**Error Handling**:
- Invalid room → `error` event
- Wrong turn → `error` event with message
- Invalid move → `error` event with details

## Room Service (`services/roomService.ts`)

### Data Structure

**Storage**: In-memory `Map<string, Room>`
- Key: Room ID (UUID)
- Value: Room object

### Functions

#### `createRoom(playerId, playerName)`
- Generates unique 6-character room code
- Creates room object with player1
- Stores in map
- Returns room

#### `joinRoom(code, playerId, playerName)`
- Finds room by code
- Validates room exists and has space
- Adds player2
- **CRITICAL**: Initializes game if both players present
  ```typescript
  if (room.player1 && room.player2 && !room.gameState) {
    const gameState = initializeGame();
    gameState.currentPlayer = 1; // Force to 1
    room.gameState = gameState;
  }
  ```
- Updates map
- Returns updated room

#### `getRoomByCode(code)`
- Searches all rooms for matching code
- Returns room or undefined

#### `getRoomById(id)`
- Direct map lookup
- Returns room or undefined

#### `updateRoom(roomId, updates)`
- Merges updates into room
- Updates lastActivity timestamp
- Saves back to map
- Returns updated room

#### `deleteRoom(roomId)`
- Removes room from map
- Returns boolean (success/failure)

#### `cleanupInactiveRooms()`
- Runs every 30 minutes
- Removes rooms inactive > 1 hour
- Prevents memory leaks

## Mancala Service (`services/mancalaService.ts`)

### Game State Structure

```typescript
interface MancalaState {
  board: number[];        // 14 elements: [P1 pits, P1 store, P2 pits, P2 store]
  currentPlayer: 1 | 2;  // Whose turn it is
  gameStatus: 'playing' | 'finished';
}
```

### Board Layout

```
Indices: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
         └─────────────┘ └─┘ └─────────────────┘ └─┘
         Player 1 Pits   Store  Player 2 Pits    Store
```

### Functions

#### `initializeGame()`
**Returns**: Fresh game state
- Board: `[4,4,4,4,4,4,0,4,4,4,4,4,4,0]`
- currentPlayer: `1` (always)
- gameStatus: `'playing'`

**Validation**: Double-checks currentPlayer is 1

---

#### `makeMove(gameState, pitIndex)`
**Purpose**: Process a single move

**Returns**: `MoveResult` object
```typescript
{
  newState: MancalaState;
  extraTurn: boolean;
  captured: boolean;
  gameOver: boolean;
  winner?: 1 | 2 | 'tie';
}
```

**Algorithm**:
1. **Get Seeds**: `seeds = board[pitIndex]`
2. **Clear Pit**: `board[pitIndex] = 0`
3. **Distribute**:
   - Start from next pit
   - Move counter-clockwise
   - Skip opponent's store
   - Add 1 seed per pit
4. **Check Last Seed**:
   - **Own Store**: Extra turn
   - **Empty Own Pit**: Capture opponent's seeds
   - **Other**: Switch turn
5. **Check Game Over**:
   - If one player's pits are empty
   - Collect remaining seeds
   - Calculate winner
6. **Return Result**

**Rules Implemented**:
- Counter-clockwise movement
- Skip opponent's store
- Extra turn on landing in own store
- Capture on landing in empty own pit
- Game end detection
- Winner calculation

## Type Definitions (`types/index.ts`)

### Core Types

```typescript
type Player = 1 | 2;
type GameStatus = 'playing' | 'finished';

interface MancalaState {
  board: number[];
  currentPlayer: Player;
  gameStatus: GameStatus;
}

interface Room {
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
```

## State Management

### Single Source of Truth

**Backend is authoritative** for:
- Game state (board, currentPlayer, gameStatus)
- Room state (players, gameState)
- Turn validation
- Move validation

**Frontend**:
- Receives state via REST or Socket events
- Displays state
- Sends user actions (pit clicks)
- Never mutates game state independently

### Game Initialization Flow

```
Player 2 Joins → joinRoom() → initializeGame() → 
Set room.gameState → Emit socket events → 
Both clients receive game-started event
```

**Critical**: Game is initialized **only once** in `roomService.joinRoom()`

## Error Handling

### Validation Errors
- Invalid room code → 404
- Room full → 404
- Invalid move → Socket error event
- Wrong turn → Socket error event

### Error Events
All errors sent via Socket.io `error` event:
```typescript
socket.emit('error', { message: 'Error description' });
```

## Security Considerations

### Input Validation
- All inputs validated server-side
- Type checking with TypeScript
- Range validation for pit indices
- Player identity verification

### CORS Configuration
- Restricted to frontend origin
- Prevents unauthorized access

### Player Identification
- UUID-based player IDs
- Server-side verification
- Normalized string comparison

## Performance

### In-Memory Storage
- Fast access (O(1) lookup)
- No database overhead
- Suitable for small-scale deployment

### Room Cleanup
- Automatic removal of inactive rooms
- Prevents memory leaks
- Configurable timeout (1 hour)

## Logging

### Console Logs
- Room creation/joining
- Game initialization
- Move processing
- Error conditions
- Socket connections

### Log Levels
- Info: Normal operations
- Warn: Unusual conditions
- Error: Failures and validation errors

## Testing Considerations

### Unit Testing
- Service functions (roomService, mancalaService)
- Game logic (move processing, rules)
- Validation logic

### Integration Testing
- REST API endpoints
- Socket.io events
- End-to-end game flow

## Deployment

### Environment Variables
- `PORT`: Server port (default: 3000)
- `FRONTEND_URL`: CORS origin (default: http://localhost:5173)

### Build Process
```bash
npm run build  # Compile TypeScript
npm start      # Run compiled JavaScript
npm run dev    # Development with nodemon
```

## Future Improvements

### Scalability
- Replace in-memory storage with Redis
- Socket.io adapter for multi-server
- Database for persistence
- Load balancing

### Features
- Game history
- Player statistics
- Room persistence
- Spectator mode
- Reconnection handling

## Conclusion

The backend provides:
- **RESTful API** for room management
- **Real-time communication** via Socket.io
- **Authoritative game state** management
- **Robust validation** and error handling
- **Clean architecture** with service layer

All game logic is centralized on the backend, ensuring consistency and preventing cheating.
