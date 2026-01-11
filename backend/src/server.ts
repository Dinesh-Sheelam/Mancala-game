// Load environment variables from .env file
import 'dotenv/config';

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import roomsRouter from './routes/rooms';
import chatbotRouter from './routes/chatbot';

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

const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/rooms', (req, res, next) => {
  // Attach io instance to request for use in routes
  (req as any).io = io;
  next();
}, roomsRouter);

app.use('/api/chatbot', chatbotRouter);

// Serve static files from public directory (frontend build)
// Try multiple possible locations (similar to ragService pattern)
const getPublicPath = (): string => {
  const possiblePaths = [
    path.join(__dirname, '../public'),   // Production (compiled, dist/server.js -> dist/../public)
    path.resolve(process.cwd(), 'public'), // Fallback from cwd
    path.resolve(process.cwd(), 'backend/public'), // If running from root
  ];

  for (const folderPath of possiblePaths) {
    if (fs.existsSync(folderPath)) {
      return folderPath;
    }
  }

  // Default to relative to __dirname
  return path.join(__dirname, '../public');
};

// Serve static files from public directory (frontend build)
const publicPath = getPublicPath();

if (fs.existsSync(publicPath)) {
  // Serve static files first
  app.use(express.static(publicPath));
  console.log('✅ Serving static files from:', publicPath);
  
  // SPA fallback: serve index.html for all non-API routes
  // Express 5.x doesn't support '*' wildcard, so we use app.use as catch-all middleware
  // This runs after static file serving, so existing files are served first
  app.use((req, res, next) => {
    // Skip API routes, Socket.io, and static assets
    if (req.path.startsWith('/api/') || 
        req.path.startsWith('/socket.io/') ||
        req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
      return next();
    }
    
    // For all other routes, serve index.html (SPA routing)
    const indexPath = path.join(publicPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Not found');
    }
  });
} else {
  console.log('ℹ️  Public directory not found, running in development mode');
}

// Socket.io will be handled in sockets/gameSocket.ts
import { setupGameSocket } from './sockets/gameSocket';
setupGameSocket(io);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('RAG system will initialize in the background...');
});
