# Mancala Game - Frontend Documentation

## Overview

The frontend is a React 18 application built with TypeScript, using Zustand for state management, React Router for navigation, and Socket.io Client for real-time communication.

## Project Structure

```
frontend/
├── src/
│   ├── pages/              # Route components
│   │   ├── NameEntry.tsx
│   │   ├── LandingPage.tsx
│   │   ├── GameSelection.tsx
│   │   ├── OfflineGame.tsx
│   │   └── OnlineGame.tsx
│   ├── components/         # Reusable components
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
│   ├── store/              # Zustand stores
│   │   ├── userStore.ts
│   │   ├── audioStore.ts
│   │   └── mancalaStore.ts
│   ├── services/           # Business logic
│   │   ├── api.ts
│   │   ├── socket.ts
│   │   ├── mancalaGame.ts
│   │   ├── aiService.ts
│   │   └── audioService.ts
│   ├── types/
│   │   └── mancala.ts
│   ├── App.tsx
│   └── main.tsx
```

## Routing (`App.tsx`)

### Route Structure

```typescript
<BrowserRouter>
  <Routes>
    <Route path="/" element={<NameEntry />} />
    <Route path="/landing" element={<LandingPage />} />
    <Route path="/game-selection" element={<GameSelection />} />
    <Route path="/offline-game" element={<OfflineGame />} />
    <Route path="/online-game" element={<OnlineGame />} />
  </Routes>
</BrowserRouter>
```

### Navigation Flow

```
NameEntry → LandingPage → GameSelection → 
  ├─ OfflineGame (Single/Multiplayer)
  └─ OnlineGame (Create/Join Room)
```

## State Management (Zustand Stores)

### User Store (`store/userStore.ts`)

**Purpose**: Manage user profile

**State**:
```typescript
{
  name: string | null;
}
```

**Actions**:
- `setName(name: string)` - Update user name
- Persisted to localStorage

**Usage**: User name displayed throughout app

---

### Audio Store (`store/audioStore.ts`)

**Purpose**: Manage audio preferences

**State**:
```typescript
{
  volume: number;      // 0-1
  muted: boolean;
}
```

**Actions**:
- `setVolume(volume: number)`
- `setMuted(muted: boolean)`
- Persisted to localStorage

**Usage**: Controls background music and sound effects

---

### Mancala Store (`store/mancalaStore.ts`)

**Purpose**: Manage game state

**State**:
```typescript
{
  gameState: MancalaState | null;
}
```

**Actions**:
- `initializeGame()` - Start new game
- `makeMove(pitIndex)` - Process move
- `resetGame()` - Clear game state
- `setGameState(state)` - Update from backend
- Persisted to localStorage (offline games)

**Usage**: Central game state for all game modes

## Pages

### NameEntry (`pages/NameEntry.tsx`)

**Purpose**: First screen - collect user name

**Features**:
- Input validation
- Framer Motion animations
- Persist to userStore
- Navigate to LandingPage

---

### LandingPage (`pages/LandingPage.tsx`)

**Purpose**: Main menu screen

**Components**:
- `ProfileSection` - Display/edit name
- `AudioControls` - Music/sound controls
- `HowToPlayModal` - Game rules
- Play button
- Power off button

**Features**:
- Background music
- Animated transitions
- Profile management

---

### GameSelection (`pages/GameSelection.tsx`)

**Purpose**: Choose game mode

**Options**:
- Offline Single Player (AI)
- Offline Multiplayer
- Online Multiplayer

**Navigation**: Routes to appropriate game page

---

### OfflineGame (`pages/OfflineGame.tsx`)

**Purpose**: Handle offline games (single/multiplayer)

**Features**:
- Single player with AI (Easy/Medium/Hard)
- Local multiplayer (pass-and-play)
- Game board rendering
- Move processing
- Game over modal
- Sound effects

**AI Integration**:
- Easy: Random moves
- Medium: Basic strategy
- Hard: Minimax algorithm

---

### OnlineGame (`pages/OnlineGame.tsx`)

**Purpose**: Handle online multiplayer games

**Key Features**:

#### Room Creation Flow
1. User clicks "Create Room"
2. POST `/api/rooms/create`
3. Receive room with code
4. Join socket room
5. Display room code
6. Wait for opponent

#### Room Joining Flow
1. User enters room code
2. POST `/api/rooms/join`
3. Receive updated room
4. Join socket room
5. If game started, display board
6. Otherwise, show waiting screen

#### Socket Event Handling
```typescript
useEffect(() => {
  connectSocket();
  
  // Event handlers
  onGameUpdate(handleGameUpdate);
  onGameOver(handleGameOver);
  onError(handleError);
  onRoomUpdate(handleRoomUpdate);
  onGameStarted(handleGameStarted);
  
  return () => {
    // Cleanup
    offGameUpdate(handleGameUpdate);
    // ... other cleanup
  };
}, [setGameState]); // Note: room NOT in deps to prevent reconnection
```

#### Move Handling
```typescript
const handlePitClick = async (pitIndex: number) => {
  // Minimal validation
  if (!room || !gameState || !room.id) return;
  if (gameState.gameStatus !== 'playing') return;
  
  // Send to backend - backend validates everything
  socketMakeMove(room.id, pitIndex, room.code, playerId);
};
```

**Important**: Frontend does NOT validate turns or moves - backend is source of truth

## Components

### MancalaBoard (`components/mancala/MancalaBoard.tsx`)

**Purpose**: Render the game board

**Props**:
```typescript
{
  onPitClick: (pitIndex: number) => void;
  player1Name?: string;
  player2Name?: string;
  currentUserPlayer?: 1 | 2;  // For online games
}
```

**Features**:
- Dynamic layout based on `currentUserPlayer`
- Your pits always at bottom
- Opponent pits always at top
- Highlighting based on turn
- Circular pit display (opponent pits reversed)

**Turn Logic**:
```typescript
const isMyTurn = currentUserPlayer 
  ? (currentPlayer === currentUserPlayer)  // Backend tells us
  : (currentPlayer === 1);  // Offline default
```

---

### Pit (`components/mancala/Pit.tsx`)

**Purpose**: Render individual pit

**Props**:
```typescript
{
  seeds: number;
  pitIndex: number;
  player: 1 | 2;
  isActive: boolean;        // Clickable?
  isHighlighted?: boolean;
  highlightColor?: 'orange' | 'blue';
  onClick: (pitIndex: number) => void;
}
```

**Visual Features**:
- Seed visualization (circles/coins)
- Different patterns for seed counts
- Gradient backgrounds
- Hover animations (Framer Motion)
- Disabled state styling

**Seed Display**:
- ≤8 seeds: Individual circles arranged in circle
- 9-16 seeds: Grid pattern
- >16 seeds: Grid + count overlay

---

### Store (`components/mancala/Store.tsx`)

**Purpose**: Render player's store (Mancala)

**Props**:
```typescript
{
  seeds: number;
  player: 1 | 2;
  isActive: boolean;
  playerName: string;
}
```

**Features**:
- Large seed count display
- Player name
- Visual seed representation
- Active state highlighting

## Services

### API Service (`services/api.ts`)

**Purpose**: REST API client

**Functions**:
- `createRoom(playerId, playerName)` - Create room
- `joinRoom(code, playerId, playerName)` - Join room
- `getRoom(code)` - Get room info

**Base URL**: Configurable via `VITE_API_URL`

---

### Socket Service (`services/socket.ts`)

**Purpose**: Socket.io client wrapper

**Functions**:
- `connectSocket()` - Establish connection
- `disconnectSocket()` - Close connection
- `joinRoom(roomId)` - Join socket room
- `leaveRoom(roomId)` - Leave socket room
- `makeMove(roomId, pitIndex, roomCode, playerId)` - Send move
- `onGameUpdate(callback)` - Listen for updates
- `onGameOver(callback)` - Listen for game end
- `onError(callback)` - Listen for errors
- `onRoomUpdate(callback)` - Listen for room changes
- `onGameStarted(callback)` - Listen for game start

**Connection Handling**:
- Automatic reconnection
- Fallback to polling if WebSocket fails
- Connection state logging

---

### Mancala Game Service (`services/mancalaGame.ts`)

**Purpose**: Core game logic (for offline games)

**Functions**:
- `initializeGame()` - Create initial state
- `makeMove(gameState, pitIndex)` - Process move
- Returns `MoveResult` with new state and game events

**Note**: Same logic as backend for consistency

---

### AI Service (`services/aiService.ts`)

**Purpose**: AI opponent logic

**Difficulties**:

#### Easy
- Random valid move selection

#### Medium
- Prefer moves that:
  - Land in own store (extra turn)
  - Capture opponent seeds
  - Avoid giving opponent captures

#### Hard
- Minimax algorithm with alpha-beta pruning
- Evaluates all possible moves
- Looks ahead multiple turns
- Maximizes own score, minimizes opponent score

---

### Audio Service (`services/audioService.ts`)

**Purpose**: Audio playback management

**Features**:
- Background music
- Sound effects (move, capture, game over)
- Volume control
- Mute functionality

**Implementation**: Howler.js for cross-browser audio

## State Flow

### Online Game State Flow

```
User Action → Component → Service → Backend
                                      ↓
Backend Processes → Socket Event → Handler → Store → UI Update
```

### Example: Making a Move

```
1. User clicks pit
2. handlePitClick() called
3. socketMakeMove() sends event
4. Backend validates and processes
5. Backend broadcasts game-update
6. handleGameUpdate() receives event
7. setGameState() updates store
8. Component re-renders with new state
```

## Key Design Principles

### 1. Backend as Source of Truth
- Frontend never mutates game state
- Always receives state from backend
- Displays what backend sends

### 2. Minimal Client-Side Validation
- Only basic checks (room exists, game playing)
- All game logic validation on backend
- Trust backend for turn/rule validation

### 3. Reactive Updates
- Socket events trigger state updates
- Zustand store updates trigger re-renders
- No polling (socket events are sufficient)

### 4. Component Composition
- Small, focused components
- Props-based communication
- Reusable UI elements

## Error Handling

### Network Errors
- Socket reconnection automatic
- Error events displayed to user
- Graceful degradation

### Validation Errors
- Backend sends error via socket
- Frontend displays error message
- User can retry

### State Sync Issues
- Backend always authoritative
- Frontend overwrites local state on updates
- No client-side state inference

## Performance Optimizations

### React Optimizations
- Component memoization where needed
- Selective Zustand subscriptions
- Efficient re-renders

### Socket Optimizations
- Single connection per session
- Event handler cleanup
- Reconnection handling

### Asset Optimization
- Vite handles code splitting
- Lazy route loading
- Optimized builds

## Styling Approach

### Tailwind CSS
- Utility-first classes
- Responsive design
- Custom gradients
- Consistent spacing

### Animations
- Framer Motion for interactions
- Smooth transitions
- Hover effects
- Modal animations

## Accessibility

### Considerations
- Keyboard navigation
- Screen reader support (semantic HTML)
- Color contrast
- Focus indicators

## Browser Support

### Requirements
- Modern browsers (ES6+)
- WebSocket support
- localStorage support
- CSS Grid/Flexbox support

## Development Workflow

### Hot Module Replacement
- Vite provides instant updates
- State preserved during development
- Fast iteration

### TypeScript
- Type safety throughout
- IDE autocomplete
- Compile-time error detection

## Testing Considerations

### Unit Tests
- Component rendering
- Store actions
- Service functions

### Integration Tests
- User flows
- Socket communication
- API interactions

### E2E Tests
- Complete game scenarios
- Multiplayer flows
- Error handling

## Future Enhancements

### UI/UX
- Animations for seed movement
- Sound effects for captures
- Victory celebrations
- Tutorial mode

### Features
- Game history
- Statistics tracking
- Replay functionality
- Spectator mode

### Performance
- Virtual scrolling for large boards
- Image optimization
- Code splitting improvements

## Conclusion

The frontend provides:
- **Intuitive UI** with smooth animations
- **Real-time updates** via Socket.io
- **Reactive state** with Zustand
- **Type safety** with TypeScript
- **Clean architecture** with separation of concerns

All game state comes from the backend, ensuring consistency and preventing client-side manipulation.
