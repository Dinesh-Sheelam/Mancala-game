# Project Context

## Purpose
A complete web-based Mancala game application with modern UI/UX. The application supports user profiles, offline single-player (with AI), offline local multiplayer, and online multiplayer via room codes. The game implements classic Mancala rules with a beautiful, modern interface.

## Tech Stack

### Frontend
- **React 18** with TypeScript - Stable, widely adopted, excellent ecosystem
- **Vite** - Fast build tool, stable and production-ready
- **Tailwind CSS** - Modern utility-first CSS for beautiful UI/UX
- **Zustand** - Lightweight state management with localStorage persistence
- **React Router** - Client-side routing
- **Framer Motion** - Smooth animations for better UX
- **Howler.js** - Robust audio library for background music and sound effects
- **Socket.io Client** - Real-time communication for online multiplayer

### Backend
- **Node.js** with **Express** - Stable, production-ready
- **Socket.io** - Real-time communication for online multiplayer (stable, not beta)
- **TypeScript** - Type safety across the stack
- **UUID** - Generate unique room codes

### Development Tools
- **ESLint** + **Prettier** - Code quality and formatting
- **TypeScript** - Type safety

## Project Conventions

### Code Style
- TypeScript strict mode enabled
- Functional components with hooks
- Component-based architecture
- CamelCase for variables and functions
- PascalCase for components and types
- Kebab-case for file names (where applicable)
- 2-space indentation
- Single quotes for strings (where consistent with project)

### Architecture Patterns
- **Component-based architecture**: Reusable, modular components
- **State management**: Zustand stores for global state (user, audio, game)
- **Service layer**: Business logic separated into services (game logic, AI, API, socket)
- **Separation of concerns**: UI components, business logic, and state management are separated
- **Type safety**: TypeScript throughout for better developer experience

### Testing Strategy
- Manual testing during development
- TypeScript provides compile-time error checking
- Future: Unit tests for game logic, integration tests for multiplayer

### Git Workflow
- Main branch for production-ready code
- Feature branches for new features
- Descriptive commit messages

## Domain Context

### Mancala Game Rules
- **Board Layout**: 6 pits per player + 1 store per player (14 positions total)
- **Initial Setup**: 4 seeds per pit (configurable to 3 for shorter games)
- **Movement**: Counter-clockwise (to the right)
- **Special Rules**:
  1. **Extra Turn**: If last seed lands in player's own store, player gets another turn
  2. **Capture**: If last seed lands in player's own empty pit, capture all seeds from opponent's opposite pit
- **Game End**: When one player's pits are completely empty
- **Win Condition**: Player with most seeds in their store wins

### Game Modes
1. **Offline Single Player**: Play against AI with three difficulty levels (Easy, Medium, Hard)
2. **Offline Multiplayer**: Local pass-and-play mode
3. **Online Multiplayer**: Create or join rooms using 6-character codes

### AI Difficulty Levels
- **Easy**: Random valid moves
- **Medium**: Basic strategy (prioritizes extra turns and captures)
- **Hard**: Minimax algorithm with look-ahead (3-4 moves deep)

## Important Constraints
- Web-based only (no mobile app)
- Requires modern browser with JavaScript enabled
- Online multiplayer requires backend server
- Audio files are optional (placeholders provided, can be added later)

## External Dependencies
- **Frontend**: React, React Router, Zustand, Framer Motion, Howler.js, Socket.io Client, Tailwind CSS
- **Backend**: Express, Socket.io, UUID
- **Development**: TypeScript, Vite, ESLint

## Project Structure
```
/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── store/        # Zustand state stores
│   │   ├── services/     # Business logic services
│   │   └── types/        # TypeScript type definitions
│   └── public/           # Static assets
│
├── backend/          # Node.js backend server
│   ├── src/
│   │   ├── routes/       # Express routes
│   │   ├── sockets/      # Socket.io handlers
│   │   ├── services/     # Business logic
│   │   └── types/        # TypeScript types
│
└── openspec/         # Project documentation
```
