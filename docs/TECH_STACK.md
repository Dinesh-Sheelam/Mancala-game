# Mancala Game - Technical Stack Documentation

## Overview

This document provides a comprehensive overview of the technologies, frameworks, and tools used to build the Mancala web-based game application.

## Technology Stack

### Frontend

#### Core Framework
- **React 18** - Modern UI library for building interactive user interfaces
  - Component-based architecture
  - Hooks for state management and side effects
  - Virtual DOM for efficient rendering

#### Language
- **TypeScript** - Typed superset of JavaScript
  - Type safety for better code quality
  - Enhanced IDE support and autocomplete
  - Compile-time error detection

#### Build Tool
- **Vite** - Next-generation frontend build tool
  - Fast Hot Module Replacement (HMR)
  - Optimized production builds
  - Native ES modules support

#### Styling
- **Tailwind CSS v3.4.0** - Utility-first CSS framework
  - Rapid UI development
  - Responsive design utilities
  - Custom gradient and animation support
- **PostCSS** - CSS processing tool
- **Autoprefixer** - Automatic vendor prefixing

#### State Management
- **Zustand** - Lightweight state management library
  - Simple API with minimal boilerplate
  - Built-in persistence support
  - Used for:
    - User profile state (name)
    - Audio preferences (volume, muted)
    - Game state (board, current player, game status)

#### Routing
- **React Router v6** - Client-side routing
  - Declarative route definitions
  - Navigation between game screens
  - URL-based state management

#### Real-time Communication
- **Socket.io Client** - WebSocket library for real-time updates
  - Bidirectional communication with backend
  - Automatic reconnection handling
  - Event-based messaging

#### Animations
- **Framer Motion** - Production-ready animation library
  - Smooth transitions and animations
  - Gesture support
  - Used for:
    - Page transitions
    - Button hover effects
    - Modal animations
    - Pit click animations

#### Audio
- **Howler.js** - Audio library for web
  - Background music playback
  - Sound effects management
  - Volume control and muting

### Backend

#### Runtime
- **Node.js** - JavaScript runtime environment
  - Event-driven, non-blocking I/O
  - Single-threaded with event loop

#### Framework
- **Express.js** - Web application framework
  - RESTful API endpoints
  - Middleware support
  - Request/response handling

#### Language
- **TypeScript** - Type-safe backend development
  - Shared types with frontend
  - Better code maintainability

#### Real-time Communication
- **Socket.io** - Real-time bidirectional communication
  - WebSocket fallback to HTTP long-polling
  - Room-based messaging
  - Automatic reconnection

#### Utilities
- **UUID** - Unique identifier generation
  - Room ID generation
  - Player identification

#### CORS
- **CORS Middleware** - Cross-Origin Resource Sharing
  - Allows frontend to communicate with backend
  - Configurable origin whitelist

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              React Frontend Application               │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │  │
│  │  │   Zustand    │  │  React Router│  │ Socket.io   │ │  │
│  │  │   Stores     │  │   (Routing)  │  │   Client    │ │  │
│  │  └──────────────┘  └──────────────┘  └─────────────┐ │  │
│  └──────────────────────────────────────────────────────┘  │  │
│                            │                                │  │
│                            │ HTTP REST API                  │  │
│                            │ WebSocket (Socket.io)          │  │
└────────────────────────────┼────────────────────────────────┘  │
                             │                                   │
┌────────────────────────────┼────────────────────────────────┐ │
│                        SERVER (Node.js)                      │ │
│  ┌──────────────────────────────────────────────────────┐   │ │
│  │              Express.js + Socket.io                  │   │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐│   │ │
│  │  │ REST Routes  │  │ Socket       │  │ Services    ││   │ │
│  │  │ (/api/rooms) │  │ Handlers     │  │ (Game Logic)││   │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘│   │ │
│  └──────────────────────────────────────────────────────┘   │ │
│                            │                                  │ │
│                            │ In-Memory Storage                │ │
│                            ▼                                  │ │
│                   ┌──────────────────┐                       │ │
│                   │  Room Service    │                       │ │
│                   │  (Map<id, Room>) │                       │ │
│                   └──────────────────┘                       │ │
└──────────────────────────────────────────────────────────────┘ │
```

## Data Flow Architecture

### REST API Flow
```
Frontend Request → Express Router → Service Layer → In-Memory Store → Response
```

### WebSocket Flow
```
Frontend Event → Socket.io Client → Socket.io Server → Event Handler → Broadcast to Room
```

### State Synchronization Flow
```
Backend (Source of Truth) → Socket Event → Frontend Handler → Zustand Store → UI Update
```

## Key Design Patterns

### 1. Single Source of Truth
- **Backend** maintains authoritative game state
- Frontend receives and displays state, never mutates independently
- All game logic (moves, validation) happens on backend

### 2. Event-Driven Architecture
- Socket.io events for real-time updates
- React hooks for event handling
- Decoupled components through event system

### 3. Component-Based UI
- Reusable React components
- Separation of concerns (UI, logic, state)
- Props-based data flow

### 4. Service Layer Pattern
- Backend services encapsulate business logic
- Routes delegate to services
- Clean separation of HTTP and game logic

## Storage Strategy

### Frontend Storage
- **localStorage** - Client-side persistence
  - User name
  - Player ID
  - Audio preferences
  - Game state (for offline games)

### Backend Storage
- **In-Memory Map** - Server-side storage
  - Active game rooms
  - Room state and game state
  - Player associations
  - Automatic cleanup of inactive rooms

## Development Tools

### Frontend
- **Vite Dev Server** - Development server with HMR
- **TypeScript Compiler** - Type checking and compilation
- **ESLint** - Code linting (if configured)

### Backend
- **ts-node** - TypeScript execution
- **nodemon** - Automatic server restart on changes
- **TypeScript Compiler** - Type checking

## Build & Deployment

### Frontend Build
```bash
npm run build  # Vite production build
```
- Outputs optimized static files
- Tree-shaking and minification
- Code splitting for performance

### Backend Build
```bash
npm run build  # TypeScript compilation
```
- Compiles TypeScript to JavaScript
- Outputs to `dist/` directory

## Performance Considerations

### Frontend
- **Code Splitting** - Lazy loading of routes
- **Virtual DOM** - Efficient re-rendering
- **Memoization** - Prevent unnecessary recalculations
- **Optimized Assets** - Vite handles asset optimization

### Backend
- **In-Memory Storage** - Fast access (no database overhead)
- **Event-Driven** - Non-blocking I/O
- **Room Cleanup** - Automatic removal of inactive rooms
- **Connection Pooling** - Socket.io manages connections efficiently

## Security Considerations

### CORS Configuration
- Restricted origin whitelist
- Prevents unauthorized access

### Input Validation
- Backend validates all moves
- Type checking with TypeScript
- Server-side game state validation

### Player Identification
- UUID-based player IDs
- Server-side player verification
- Turn validation on every move

## Browser Compatibility

### Supported Browsers
- Modern browsers with ES6+ support
- WebSocket support required
- localStorage support required

### Polyfills
- Socket.io handles WebSocket fallback
- Vite handles modern JavaScript transpilation

## Future Scalability

### Potential Improvements
- **Database Integration** - Replace in-memory storage with Redis/PostgreSQL
- **Horizontal Scaling** - Socket.io adapter for multi-server support
- **Caching Layer** - Redis for session management
- **Load Balancing** - Multiple server instances
- **CDN** - Static asset delivery
- **Monitoring** - Application performance monitoring

## Dependencies Summary

### Frontend Key Dependencies
```json
{
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "zustand": "^4.x",
  "socket.io-client": "^4.x",
  "framer-motion": "^10.x",
  "howler": "^2.x",
  "tailwindcss": "^3.4.0"
}
```

### Backend Key Dependencies
```json
{
  "express": "^4.x",
  "socket.io": "^4.x",
  "uuid": "^9.x",
  "cors": "^2.x",
  "typescript": "^5.x"
}
```

## Conclusion

The tech stack chosen provides:
- **Fast Development** - Modern tools with great DX
- **Type Safety** - TypeScript across the stack
- **Real-time Communication** - Socket.io for multiplayer
- **Scalable Architecture** - Clean separation of concerns
- **Maintainable Code** - Well-structured and documented

This stack enables rapid development while maintaining code quality and performance.
