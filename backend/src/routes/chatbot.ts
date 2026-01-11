/**
 * Chatbot API Routes
 * 
 * Handles RAG chatbot queries
 */

import express from 'express';
import { queryRAG, startBackgroundInitialization, getRAGStatus } from '../services/ragService';

const router = express.Router();

// Start background initialization (non-blocking - server starts immediately)
startBackgroundInitialization();

/**
 * POST /api/chatbot/query
 * Query the RAG chatbot with a question
 */
router.post('/query', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Question is required and must be a non-empty string' 
      });
    }

    const answer = await queryRAG(question.trim());
    
    res.json({ answer });
  } catch (error) {
    console.error('RAG query error:', error);
    res.status(500).json({ 
      error: 'Failed to process question',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/chatbot/health
 * Check RAG system status
 */
router.get('/health', async (req, res) => {
  try {
    const status = getRAGStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error',
      initialized: false,
      isInitializing: false,
      documentCount: 0,
      isVectorStoreReady: false
    });
  }
});

export default router;
