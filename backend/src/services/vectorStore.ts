/**
 * Vector Store
 * 
 * Simple in-memory vector store for storing and retrieving document embeddings.
 * Uses cosine similarity for search.
 * 
 * IMPORTANT: Uses the same embedding function (generateEmbedding) for both:
 * - Document chunks (during initialization)
 * - User queries (during search)
 * This ensures embeddings are in the same vector space.
 */

import type { PDFChunk } from './pdfService';
import { generateEmbedding } from './embeddingService';

export interface VectorDocument {
  chunk: PDFChunk;
  embedding: number[];
}

class VectorStore {
  private documents: VectorDocument[] = [];
  private initialized = false;

  /**
   * Initialize the vector store with PDF chunks
   * If embeddings are provided, uses them directly (from cache)
   */
  async initialize(chunks: PDFChunk[], embeddings?: number[][]) {
    if (this.initialized) {
      console.log('Vector store already initialized');
      return;
    }
    
    if (chunks.length === 0) {
      console.warn('No chunks provided to vector store');
      return;
    }

    // If embeddings are provided (from cache), use them directly
    if (embeddings && embeddings.length === chunks.length) {
      console.log(`Loading ${chunks.length} chunks with pre-computed embeddings from cache...`);
      for (let i = 0; i < chunks.length; i++) {
        this.documents.push({
          chunk: chunks[i],
          embedding: embeddings[i],
        });
      }
      this.initialized = true;
      console.log(`Vector store initialized with ${this.documents.length} documents from cache`);
      return;
    }

    // Otherwise, generate embeddings (first time or cache invalid)
    console.log(`Generating embeddings for ${chunks.length} chunks...`);
    const startTime = Date.now();
    
    // Process in very small batches to manage memory
    const batchSize = 2; // Very small batches to reduce memory pressure
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      
      for (const chunk of batch) {
        try {
          const embedding = await generateEmbedding(chunk.text);
          this.documents.push({ chunk, embedding });
        } catch (error) {
          console.error(`Error generating embedding for chunk ${i}:`, error);
          // Continue processing even if one fails
        }
      }
      
      // Progress indicator
      const processed = Math.min(i + batchSize, chunks.length);
      if (processed % 10 === 0 || processed === chunks.length) {
        console.log(`Processed ${processed}/${chunks.length} chunks...`);
      }
      
      // Force garbage collection opportunity between batches
      if (i + batchSize < chunks.length) {
        if (global.gc) {
          global.gc();
        }
        // Longer delay to allow memory cleanup
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    this.initialized = true;
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`Vector store initialized with ${this.documents.length} documents in ${elapsed}s`);
  }

  /**
   * Get all embeddings (for caching)
   */
  getEmbeddings(): number[][] {
    return this.documents.map(doc => doc.embedding);
  }

  /**
   * Search for similar documents using cosine similarity
   */
  async search(query: string, topK: number = 3): Promise<VectorDocument[]> {
    if (!this.initialized) {
      throw new Error('Vector store not initialized');
    }

    if (this.documents.length === 0) {
      return [];
    }

    try {
      // Normalize query text to match chunk preprocessing
      // This ensures embeddings are created from similarly preprocessed text
      // Chunks are preprocessed with: text.replace(/\s+/g, ' ').trim()
      const normalizedQuery = query.replace(/\s+/g, ' ').trim();
      
      console.log(`🔍 Searching with normalized query: "${normalizedQuery}" (original: "${query}")`);
      const queryEmbedding = await generateEmbedding(normalizedQuery);
      
      // Calculate cosine similarity for all documents
      const scored = this.documents.map(doc => ({
        doc,
        score: cosineSimilarity(queryEmbedding, doc.embedding),
      }));

      // Sort by score (descending) and return top K
      const sorted = scored.sort((a, b) => b.score - a.score);
      const topResults = sorted.slice(0, topK).map(item => item.doc);
      
      // Log top similarity scores for debugging
      console.log(`📊 Top ${topK} similarity scores:`, 
        sorted.slice(0, topK).map((item, idx) => 
          `[${idx + 1}] ${item.score.toFixed(3)} (${item.doc.chunk.source})`
        ).join(', ')
      );

      return topResults;
    } catch (error) {
      console.error('Error searching vector store:', error);
      return [];
    }
  }

  /**
   * Get the number of documents in the store
   */
  getDocumentCount(): number {
    return this.documents.length;
  }

  /**
   * Check if store is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Reset the store (useful for reloading)
   */
  reset() {
    this.documents = [];
    this.initialized = false;
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

export const vectorStore = new VectorStore();
