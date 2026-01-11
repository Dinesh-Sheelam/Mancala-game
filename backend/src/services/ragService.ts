/**
 * RAG Service
 * 
 * Retrieval-Augmented Generation service that orchestrates:
 * 1. Loading PDFs
 * 2. Generating embeddings
 * 3. Storing vectors
 * 4. Retrieving relevant context
 * 5. Generating responses
 */

import { vectorStore } from './vectorStore';
import { loadPDFsFromFolder } from './pdfService';
import {
  getPDFMetadata,
  isCacheValid,
  saveCache,
  loadCache,
} from './cacheService';
import { generateAnswerWithGemini, isGeminiAvailable, generateSimpleResponse } from './geminiService';
import path from 'path';
import fs from 'fs';

// Resolve PDF folder path - works in both dev (ts-node) and production (compiled)
const getPDFFolder = (): string => {
  // Try multiple possible locations
  const possiblePaths = [
    path.join(__dirname, '../../data/pdfs'), // Dev mode (ts-node)
    path.join(__dirname, '../data/pdfs'),   // Production (compiled)
    path.resolve(process.cwd(), 'data/pdfs'), // Fallback from cwd
    path.resolve(process.cwd(), 'backend/data/pdfs'), // If running from root
  ];

  for (const folderPath of possiblePaths) {
    if (fs.existsSync(folderPath)) {
      return folderPath;
    }
  }

  // Default to relative to __dirname
  return path.join(__dirname, '../../data/pdfs');
};

const PDF_FOLDER = getPDFFolder();

let initialized = false;
let isInitializing = false;
let initializationPromise: Promise<void> | null = null;

/**
 * Initialize the RAG system in the background (non-blocking)
 * Loads PDFs, generates embeddings, and populates the vector store
 */
export async function initializeRAG(): Promise<void> {
  if (initialized) {
    return;
  }

  // If already initializing, return the existing promise
  if (isInitializing && initializationPromise) {
    return initializationPromise;
  }

  // Start initialization in background (don't await)
  initializationPromise = (async () => {
    isInitializing = true;
    try {
      console.log('Initializing RAG system in background...');
      console.log(`PDF folder: ${PDF_FOLDER}`);
      console.log(`PDF folder exists: ${fs.existsSync(PDF_FOLDER)}`);

      // Get current PDF metadata
      const pdfMetadata = await getPDFMetadata(PDF_FOLDER);
      
      if (pdfMetadata.length === 0) {
        console.warn('No PDF files found. Please add PDF files to backend/data/pdfs/');
        initialized = true;
        isInitializing = false;
        return;
      }

      // Check if cache is valid
      const cacheValid = await isCacheValid(PDF_FOLDER, pdfMetadata);
      
      if (cacheValid) {
        console.log('Valid cache found. Loading from cache...');
        const cached = await loadCache();
        
        if (cached) {
          // Load from cache (fast!)
          await vectorStore.initialize(cached.chunks, cached.embeddings);
          initialized = true;
          isInitializing = false;
          console.log('RAG system ready (loaded from cache)');
          return;
        } else {
          console.log('Cache file corrupted, regenerating...');
        }
      } else {
        console.log('Cache invalid or missing. Processing PDFs...');
      }

      // Cache invalid or missing - process PDFs
      const chunks = await loadPDFsFromFolder(PDF_FOLDER);
      
      if (chunks.length === 0) {
        console.warn('No PDF chunks found. Please add PDF files to backend/data/pdfs/');
        initialized = true;
        isInitializing = false;
        return;
      }

      console.log(`Found ${chunks.length} chunks. Generating embeddings...`);
      
      // Initialize vector store with chunks (generates embeddings)
      await vectorStore.initialize(chunks);
      
      // Get embeddings for caching
      const embeddings = vectorStore.getEmbeddings();
      
      // Save to cache for next time
      if (embeddings && embeddings.length > 0) {
        await saveCache(chunks, embeddings, pdfMetadata);
      }
      
      initialized = true;
      isInitializing = false;
      console.log('RAG system ready');
    } catch (error) {
      console.error('Error initializing RAG system:', error);
      isInitializing = false;
      // Don't throw - allow server to continue running
    } finally {
      initializationPromise = null;
    }
  })();

  // Don't await - let it run in background
  return initializationPromise;
}

/**
 * Start background initialization (non-blocking)
 */
export function startBackgroundInitialization() {
  if (!isInitializing && !initialized) {
    initializeRAG().catch(console.error);
  }
}

/**
 * Query the RAG system with a question
 */
export async function queryRAG(question: string): Promise<string> {
  // Start initialization if not already started
  if (!isInitializing && !initialized) {
    startBackgroundInitialization();
  }

  const lowerQuestion = question.toLowerCase().trim();
  
  // Handle greetings and simple conversational queries WITHOUT retrieving chunks
  const greetings = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'howdy'];
  const isGreeting = greetings.some(greeting => lowerQuestion === greeting || lowerQuestion.startsWith(greeting + ' '));
  
  if (isGreeting) {
    // Use LLM to generate a friendly greeting response (no chunk retrieval needed)
    if (isGeminiAvailable()) {
      try {
        console.log('👋 Detected greeting, generating friendly response with LLM...');
        const greetingPrompt = `You are a friendly Mancala assistant. The user just greeted you with "${question}". 
Respond warmly and welcome them. Mention that you're here to help with Mancala - its rules, history, and strategies.
Keep it brief (1-2 sentences) and conversational.`;
        
        const response = await generateSimpleResponse(greetingPrompt);
        console.log('✅ Greeting response generated');
        return response;
      } catch (error) {
        console.warn('⚠️  LLM greeting failed, using default:', error);
        return "Hello! Welcome to Mancala! I'm here to help you learn about Mancala — its history, rules, and strategies. What would you like to know?";
      }
    } else {
      // Fallback greeting if LLM not available
      return "Hello! Welcome to Mancala! I'm here to help you learn about Mancala — its history, rules, and strategies. What would you like to know?";
    }
  }

  // If not ready yet, provide helpful message
  if (!vectorStore.isInitialized() || vectorStore.getDocumentCount() === 0) {
    if (isInitializing) {
      return "The knowledge base is still being processed. Please wait a moment and try again. This may take a few minutes for large documents.";
    }
    return "I'm sorry, but the knowledge base hasn't been loaded yet. Please ensure PDF files are placed in the backend/data/pdfs/ folder.";
  }

  // Check if question is Mancala-related
  const mancalaKeywords = [
    'mancala', 'pit', 'store', 'seed', 'capture', 'turn', 'game', 'board',
    'player', 'opponent', 'sow', 'sowing', 'oware', 'kalah', 'bao', 'sungka',
    'strategy', 'rule', 'history', 'origin', 'ancient', 'africa'
  ];
  
  const isMancalaRelated = mancalaKeywords.some(keyword => 
    lowerQuestion.includes(keyword)
  );

  if (!isMancalaRelated && lowerQuestion.length > 10) {
    return "I'm here to help with Mancala — its rules, history, and strategies. Could you ask me something about Mancala instead?";
  }

  try {
    // Retrieve relevant chunks from vector store
    const relevantDocs = await vectorStore.search(question, 3);
    
    if (relevantDocs.length === 0) {
      return "I couldn't find relevant information in the knowledge base. Could you try rephrasing your question about Mancala?";
    }

    // Combine context from top chunks
    const context = relevantDocs
      .map(doc => doc.chunk.text)
      .join('\n\n---\n\n');

    // Create context with ranking labels for Gemini (makes it clear these are ranked chunks)
    const contextWithRanking = relevantDocs
      .map((doc, index) => `[Rank ${index + 1}] ${doc.chunk.text}`)
      .join('\n\n---\n\n');

    // Generate response using Gemini LLM
    try {
      const geminiAvailable = isGeminiAvailable();
      
      if (geminiAvailable) {
        console.log('📝 Using Gemini API to generate synthesized answer...');
        console.log(`📝 Question: "${question}"`);
        console.log(`📝 Context length: ${contextWithRanking.length} characters`);
        console.log(`📝 Number of chunks: ${relevantDocs.length}`);
        
        const answer = await generateAnswerWithGemini(question, contextWithRanking);
        
        console.log(`✅ Generated answer length: ${answer.length} characters`);
        console.log(`✅ Answer preview: ${answer.substring(0, 100)}...`);
        
        // Verify answer doesn't look like raw chunks
        if (answer.includes('[Rank') || answer.includes('Digital Mancala Game Context') || answer.includes('AI Assistant Usage Rules')) {
          console.warn('⚠️  WARNING: Answer appears to contain raw chunk markers or metadata!');
        }
        
        return answer;
      } else {
        // Fallback if Gemini not configured
        console.warn('⚠️  Gemini API not available, using fallback response');
        console.warn('⚠️  To enable LLM synthesis, set GEMINI_API_KEY in .env file');
        console.warn('⚠️  Check backend/.env file for GEMINI_API_KEY');
        const fallbackAnswer = generateResponseFromContext(question, context, relevantDocs);
        return fallbackAnswer;
      }
    } catch (llmError) {
      // Fallback to simple extraction if LLM fails
      console.error('❌ Gemini API failed, using fallback:', llmError);
      if (llmError instanceof Error) {
        console.error('Error details:', llmError.message);
        console.error('Error stack:', llmError.stack);
      }
      console.warn('⚠️  Falling back to simple chunk extraction (will look like raw chunks)');
      const fallbackAnswer = generateResponseFromContext(question, context, relevantDocs);
      return fallbackAnswer;
    }
  } catch (error) {
    console.error('Error querying RAG:', error);
    return "I encountered an error while processing your question. Please try again.";
  }
}

/**
 * Generate a response from retrieved context
 * This is a simple implementation - can be enhanced with an LLM later
 */
function generateResponseFromContext(
  question: string,
  context: string,
  sources: Array<{ chunk: { source: string } }>
): string {
  const lowerQuestion = question.toLowerCase();
  const questionWords = lowerQuestion.split(/\s+/).filter(w => w.length > 3);
  
  // Split context into sentences
  const sentences = context
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);

  // Find sentences that contain question keywords
  const relevantSentences: string[] = [];
  const usedIndices = new Set<number>();

  for (const word of questionWords) {
    for (let i = 0; i < sentences.length; i++) {
      if (!usedIndices.has(i) && sentences[i].toLowerCase().includes(word)) {
        relevantSentences.push(sentences[i]);
        usedIndices.add(i);
        if (relevantSentences.length >= 5) break;
      }
    }
    if (relevantSentences.length >= 5) break;
  }

  // If we found relevant sentences, use them
  if (relevantSentences.length > 0) {
    let answer = relevantSentences.join('. ');
    
    // Ensure proper punctuation
    if (!answer.endsWith('.') && !answer.endsWith('!') && !answer.endsWith('?')) {
      answer += '.';
    }
    
    return answer;
  }

  // Fallback: return first part of context
  const fallback = context.substring(0, 500).trim();
  if (fallback.length < 50) {
    return "I found some information, but couldn't generate a clear answer. Could you try asking your question differently?";
  }
  
  return fallback + (fallback.length < context.length ? '...' : '');
}

/**
 * Get RAG system status
 */
export function getRAGStatus() {
  return {
    initialized,
    isInitializing,
    documentCount: vectorStore.getDocumentCount(),
    isVectorStoreReady: vectorStore.isInitialized(),
  };
}

/**
 * Reload the RAG system (useful after adding new PDFs)
 */
export async function reloadRAG(): Promise<void> {
  initialized = false;
  vectorStore.reset();
  await initializeRAG();
}
