# Mancala Game - Architecture & Flow Documentation

## System Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph Client["Client (Browser)"]
        UI[React UI Components]
        State[Zustand State Stores]
        Router[React Router]
        SocketClient[Socket.io Client]
    end
    
    subgraph Server["Server (Node.js)"]
        Express[Express.js Server]
        SocketServer[Socket.io Server]
        Routes[REST API Routes]
        Services[Game Services]
        Storage[In-Memory Storage]
    end
    
    UI --> State
    UI --> Router
    UI --> SocketClient
    SocketClient <--> SocketServer
    Router -->|HTTP REST| Express
    Express --> Routes
    Routes --> Services
    Services --> Storage
    SocketServer --> Services
    Services --> Storage
```

## Application Flow

### 1. User Entry & Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant NameEntry
    participant UserStore
    participant LandingPage
    
    User->>NameEntry: Enter name
    NameEntry->>UserStore: Save name to Zustand
    UserStore->>localStorage: Persist name
    NameEntry->>LandingPage: Navigate
    LandingPage->>UserStore: Read name
```

### 2. Room Creation Flow

```mermaid
sequenceDiagram
    participant Creator
    participant Frontend
    participant Backend
    participant RoomService
    participant SocketServer
    
    Creator->>Frontend: Click "Create Room"
    Frontend->>Backend: POST /api/rooms/create
    Backend->>RoomService: createRoom(playerId, playerName)
    RoomService->>RoomService: Generate room code
    RoomService->>RoomService: Store room in Map
    RoomService-->>Backend: Return room
    Backend-->>Frontend: Return room JSON
    Frontend->>Frontend: Set room state
    Frontend->>SocketServer: join-room (roomId)
    SocketServer->>SocketServer: Add socket to room
    SocketServer-->>Frontend: room-update event
    Frontend->>Frontend: Display room code
```

### 3. Room Joining Flow

```mermaid
sequenceDiagram
    participant Joiner
    participant Frontend
    participant Backend
    participant RoomService
    participant MancalaService
    participant SocketServer
    participant Creator
    
    Joiner->>Frontend: Enter room code
    Frontend->>Backend: POST /api/rooms/join
    Backend->>RoomService: joinRoom(code, playerId, playerName)
    RoomService->>RoomService: Find room by code
    RoomService->>RoomService: Add player2
    RoomService->>MancalaService: initializeGame()
    MancalaService-->>RoomService: gameState (currentPlayer: 1)
    RoomService->>RoomService: Set room.gameState
    RoomService-->>Backend: Return updated room
    Backend->>SocketServer: Emit room-update to room
    Backend->>SocketServer: Emit game-started to room
    SocketServer-->>Creator: room-update event
    SocketServer-->>Creator: game-started event
    SocketServer-->>Joiner: room-update event
    SocketServer-->>Joiner: game-started event
    Backend-->>Frontend: Return room JSON
    Frontend->>Frontend: Set room & gameState
    Frontend->>SocketServer: join-room (roomId)
```

### 4. Game Move Flow

```mermaid
sequenceDiagram
    participant Player
    participant Frontend
    participant SocketClient
    participant SocketServer
    participant GameSocket
    participant MancalaService
    participant RoomService
    participant Opponent
    
    Player->>Frontend: Click pit
    Frontend->>Frontend: Validate basic checks (room exists, game playing)
    Frontend->>SocketClient: emit game-move (roomId, pitIndex, playerId)
    SocketClient->>SocketServer: game-move event
    SocketServer->>GameSocket: Handle game-move
    GameSocket->>GameSocket: Validate player identity
    GameSocket->>GameSocket: Validate turn (currentPlayer === movingPlayer)
    GameSocket->>GameSocket: Validate pit ownership
    GameSocket->>GameSocket: Validate pit has seeds
    GameSocket->>MancalaService: makeMove(gameState, pitIndex)
    MancalaService->>MancalaService: Distribute seeds
    MancalaService->>MancalaService: Check for capture
    MancalaService->>MancalaService: Check for extra turn
    MancalaService->>MancalaService: Check for game over
    MancalaService-->>GameSocket: MoveResult
    GameSocket->>RoomService: updateRoom(roomId, { gameState })
    RoomService-->>GameSocket: Updated room
    GameSocket->>SocketServer: Broadcast game-update to room
    SocketServer-->>Player: game-update event
    SocketServer-->>Opponent: game-update event
    Player->>Frontend: Update gameState
    Opponent->>Frontend: Update gameState
    Frontend->>Frontend: Re-render board
```

## Backend Architecture

### Service Layer Structure

```
backend/
├── src/
│   ├── server.ts           # Express + Socket.io setup
│   ├── routes/
│   │   └── rooms.ts        # REST API endpoints
│   ├── sockets/
│   │   └── gameSocket.ts   # Socket.io event handlers
│   ├── services/
│   │   ├── roomService.ts  # Room management
│   │   └── mancalaService.ts # Game logic
│   └── types/
│       └── index.ts        # TypeScript type definitions
```

### Backend Data Flow

```mermaid
graph LR
    A[HTTP Request] --> B[Express Router]
    B --> C[Route Handler]
    C --> D[Service Layer]
    D --> E[In-Memory Map]
    E --> D
    D --> C
    C --> B
    B --> F[HTTP Response]
    
    G[Socket Event] --> H[Socket Handler]
    H --> D
    D --> E
    E --> D
    D --> H
    H --> I[Broadcast to Room]
```

### Room Service Responsibilities

1. **Room Creation**
   - Generate unique room code
   - Create room object
   - Store in memory map

2. **Room Joining**
   - Validate room code
   - Add player2
   - **Initialize game** (single point of initialization)
   - Return updated room

3. **Room Updates**
   - Update room properties
   - Update game state
   - Maintain last activity timestamp

4. **Room Cleanup**
   - Remove inactive rooms (>1 hour)
   - Periodic cleanup job

### Mancala Service Responsibilities

1. **Game Initialization**
   - Create initial board state
   - Set currentPlayer to 1
   - Set gameStatus to 'playing'

2. **Move Processing**
   - Validate move legality
   - Distribute seeds counter-clockwise
   - Handle captures
   - Check for extra turns
   - Detect game end
   - Calculate winner

## Frontend Architecture

### Component Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── NameEntry.tsx
│   │   ├── LandingPage.tsx
│   │   ├── GameSelection.tsx
│   │   ├── OfflineGame.tsx
│   │   └── OnlineGame.tsx
│   ├── components/
│   │   ├── mancala/
│   │   │   ├── MancalaBoard.tsx
│   │   │   ├── Pit.tsx
│   │   │   └── Store.tsx
│   │   ├── landing/
│   │   │   ├── ProfileSection.tsx
│   │   │   ├── AudioControls.tsx
│   │   │   └── HowToPlayModal.tsx
│   │   └── common/
│   │       └── Modal.tsx
│   ├── store/
│   │   ├── userStore.ts
│   │   ├── audioStore.ts
│   │   └── mancalaStore.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── socket.ts
│   │   ├── mancalaGame.ts
│   │   ├── aiService.ts
│   │   └── audioService.ts
│   └── types/
│       └── mancala.ts
```

### Frontend State Management Flow

```mermaid
graph TB
    A[User Action] --> B[Component Handler]
    B --> C{Action Type}
    C -->|Local State| D[useState Hook]
    C -->|Global State| E[Zustand Store]
    C -->|API Call| F[API Service]
    C -->|Socket Event| G[Socket Service]
    F --> H[Backend]
    G --> H
    H --> G
    G --> I[Socket Event Handler]
    I --> E
    E --> J[Component Re-render]
    D --> J
```

### State Stores

#### User Store
- User name
- Persisted to localStorage

#### Audio Store
- Volume level
- Muted state
- Persisted to localStorage

#### Mancala Store
- Game state (board, currentPlayer, gameStatus)
- Game actions (initializeGame, makeMove, resetGame)
- Persisted to localStorage (for offline games)

## Real-time Communication Architecture

### Socket.io Room Management

```mermaid
graph TB
    A[Client 1] -->|join-room| B[Socket Server]
    C[Client 2] -->|join-room| B
    B --> D[Room: roomId]
    D --> E[Socket 1]
    D --> F[Socket 2]
    G[Game Event] --> B
    B -->|Broadcast| D
    D --> E
    D --> F
```

### Event Types

#### Client → Server Events
- `join-room` - Join a game room
- `leave-room` - Leave a game room
- `game-move` - Make a move

#### Server → Client Events
- `room-update` - Room state changed
- `game-started` - Game initialized
- `game-update` - Game state updated
- `game-over` - Game finished
- `error` - Error occurred

## Game Logic Flow

### Mancala Move Processing

```mermaid
flowchart TD
    A[Player Clicks Pit] --> B{Validate}
    B -->|Invalid| C[Show Error]
    B -->|Valid| D[Send to Backend]
    D --> E[Backend Validates]
    E -->|Invalid| F[Emit Error]
    E -->|Valid| G[Get Seeds from Pit]
    G --> H[Distribute Counter-clockwise]
    H --> I{Last Seed?}
    I -->|Own Store| J[Extra Turn]
    I -->|Empty Own Pit| K[Capture Opponent]
    I -->|Other| L[Switch Turn]
    J --> M[Update Game State]
    K --> M
    L --> M
    M --> N{Game Over?}
    N -->|Yes| O[Calculate Winner]
    N -->|No| P[Broadcast Update]
    O --> P
    P --> Q[Both Clients Update]
```

### Board State Representation

```
Board Array (14 indices):
[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
 │  │  │  │  │  │  │  │  │  │  │   │   │   │
 │  │  │  │  │  │  │  │  │  │  │   │   │   └─ Player 2 Store
 │  │  │  │  │  │  │  │  │  │  │   │   └───── Player 2 Pit 5
 │  │  │  │  │  │  │  │  │  │  │   └───────── Player 2 Pit 4
 │  │  │  │  │  │  │  │  │  │  └───────────── Player 2 Pit 3
 │  │  │  │  │  │  │  │  │  └──────────────── Player 2 Pit 2
 │  │  │  │  │  │  │  │  └─────────────────── Player 2 Pit 1
 │  │  │  │  │  │  │  └─────────────────────── Player 2 Pit 0
 │  │  │  │  │  │  └────────────────────────── Player 1 Store
 │  │  │  │  │  └───────────────────────────── Player 1 Pit 5
 │  │  │  │  └──────────────────────────────── Player 1 Pit 4
 │  │  │  └────────────────────────────────── Player 1 Pit 3
 │  │  └────────────────────────────────────── Player 1 Pit 2
 │  └───────────────────────────────────────── Player 1 Pit 1
 └────────────────────────────────────────────── Player 1 Pit 0
```

## Error Handling Flow

```mermaid
flowchart TD
    A[Error Occurs] --> B{Error Type}
    B -->|Network Error| C[Socket Reconnection]
    B -->|Validation Error| D[Display Error Message]
    B -->|Game Logic Error| E[Log & Emit Error]
    C --> F[Retry Connection]
    D --> G[User Sees Error]
    E --> H[Client Receives Error]
    H --> D
```

## Security & Validation

### Backend Validation Layers

1. **Player Identity Validation**
   - Verify playerId matches room player
   - Normalize string comparison

2. **Turn Validation**
   - Check currentPlayer === movingPlayer
   - Prevent out-of-turn moves

3. **Move Validation**
   - Validate pit index range (0-13)
   - Prevent moving from stores (6, 13)
   - Validate pit ownership
   - Check pit has seeds

4. **Game State Validation**
   - Verify game is in 'playing' status
   - Check game hasn't ended

## Performance Optimizations

### Frontend
- React component memoization
- Zustand selective subscriptions
- Lazy route loading
- Optimized re-renders

### Backend
- In-memory storage (fast access)
- Event-driven architecture (non-blocking)
- Efficient room lookup (Map data structure)
- Automatic cleanup (prevent memory leaks)

## Conclusion

This architecture provides:
- **Clear Separation** - Frontend/Backend responsibilities
- **Real-time Updates** - Socket.io for multiplayer
- **Type Safety** - TypeScript throughout
- **Scalable Design** - Service layer pattern
- **Maintainable Code** - Well-organized structure
