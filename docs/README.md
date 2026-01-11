# Mancala Game - Documentation Index

Welcome to the Mancala game documentation! This directory contains comprehensive documentation about the technical implementation, architecture, and flow of the application.

## Documentation Files

### 📚 [TECH_STACK.md](./TECH_STACK.md)
Complete overview of all technologies, frameworks, and tools used in the project. Includes:
- Frontend and backend technology stack
- Architecture diagrams
- Dependencies and versions
- Performance considerations
- Browser compatibility

### 🏗️ [ARCHITECTURE.md](./ARCHITECTURE.md)
Detailed system architecture and flow documentation. Covers:
- High-level system architecture
- Application flow diagrams
- Component structure
- Data flow patterns
- Real-time communication architecture
- Game logic flow

### ⚙️ [BACKEND.md](./BACKEND.md)
Comprehensive backend documentation. Explains:
- Server setup and configuration
- REST API endpoints
- Socket.io event handlers
- Service layer implementation
- Game logic and rules
- State management
- Error handling

### 🎨 [FRONTEND.md](./FRONTEND.md)
Complete frontend documentation. Details:
- Component structure
- State management (Zustand)
- Page components
- Service layer
- Socket.io client integration
- UI/UX implementation
- Performance optimizations

### 🤖 [RAG_CHATBOT.md](./RAG_CHATBOT.md)
Comprehensive RAG chatbot architecture documentation. Explains:
- RAG (Retrieval-Augmented Generation) overview
- Complete architecture flow diagrams
- Component breakdown (PDF service, embeddings, vector store, cache, Gemini)
- Data flow examples
- Performance metrics
- Configuration and setup
- Troubleshooting guide

## Quick Start Guide

### For Developers

1. **Understanding the Stack**: Start with [TECH_STACK.md](./TECH_STACK.md) to understand what technologies are used and why.

2. **System Overview**: Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the overall system design and data flow.

3. **Backend Deep Dive**: Review [BACKEND.md](./BACKEND.md) to understand server-side implementation, API endpoints, and game logic.

4. **Frontend Deep Dive**: Review [FRONTEND.md](./FRONTEND.md) to understand client-side implementation, components, and state management.

5. **RAG Chatbot**: Review [RAG_CHATBOT.md](./RAG_CHATBOT.md) to understand the intelligent chatbot system, vector embeddings, and LLM integration.

### For Architects

- **System Design**: [ARCHITECTURE.md](./ARCHITECTURE.md) - Complete system architecture with diagrams
- **Technology Choices**: [TECH_STACK.md](./TECH_STACK.md) - Rationale for technology selection

### For New Team Members

1. Read [TECH_STACK.md](./TECH_STACK.md) for technology overview
2. Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system understanding
3. Study [BACKEND.md](./BACKEND.md) and [FRONTEND.md](./FRONTEND.md) for implementation details

## Key Concepts

### Single Source of Truth
The backend is the authoritative source for all game state. The frontend receives and displays state but never mutates it independently.

### Real-time Communication
Socket.io enables real-time updates between server and clients, allowing seamless multiplayer gameplay.

### Type Safety
TypeScript is used throughout the stack, ensuring type safety and better developer experience.

### Component-Based Architecture
React components are organized by feature and responsibility, promoting reusability and maintainability.

## Architecture Highlights

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│  React + TypeScript + Zustand + Socket.io Client        │
└──────────────────────┬──────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
   HTTP REST API              WebSocket (Socket.io)
        │                               │
        ▼                               ▼
┌─────────────────────────────────────────────────────────┐
│                    SERVER (Node.js)                     │
│  Express + Socket.io + TypeScript + In-Memory Storage  │
└─────────────────────────────────────────────────────────┘
```

## Important Flows

### Room Creation
1. User creates room → REST API → Backend creates room → Returns room code
2. Frontend joins socket room → Receives room updates
3. Displays room code to user

### Room Joining
1. User enters code → REST API → Backend adds player2 → Initializes game
2. Backend emits socket events → Both players receive updates
3. Game starts automatically

### Making a Move
1. User clicks pit → Frontend sends to backend via socket
2. Backend validates and processes move
3. Backend broadcasts update → Both clients receive
4. UI updates automatically

## Technology Summary

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Zustand** - State management
- **React Router** - Routing
- **Socket.io Client** - Real-time communication
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **Socket.io** - Real-time communication
- **TypeScript** - Type safety
- **UUID** - ID generation
- **@xenova/transformers** - Local embeddings
- **@google/generative-ai** - Gemini LLM API
- **pdf-parse** - PDF text extraction

## Development

### Running the Application

**Backend**:
```bash
cd backend
npm install
npm run dev
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

### Building for Production

**Backend**:
```bash
cd backend
npm run build
npm start
```

**Frontend**:
```bash
cd frontend
npm run build
# Serve dist/ directory
```

## Contributing

When contributing to this project:

1. Read the relevant documentation file
2. Follow the existing architecture patterns
3. Maintain type safety with TypeScript
4. Keep backend as source of truth
5. Update documentation if making significant changes

## Support

For questions or issues:
1. Check the relevant documentation file
2. Review code comments
3. Check console logs for debugging information

## License

[Add your license information here]

---

**Last Updated**: [Current Date]
**Version**: 1.0.0
