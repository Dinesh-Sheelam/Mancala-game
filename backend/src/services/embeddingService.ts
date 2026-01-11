/**
 * Embedding Service
 * 
 * Generates embeddings for text using local transformers model.
 * Uses @xenova/transformers for local embeddings (no API costs).
 * 
 * IMPORTANT: This same model and function is used for BOTH:
 * - Source document chunks (during indexing)
 * - User queries (during search)
 * 
 * This ensures embeddings are in the same vector space for accurate similarity matching.
 */

import { pipeline } from '@xenova/transformers';

let embedder: any = null;
let isInitializing = false;
let initPromise: Promise<any> | null = null;

/**
 * Initialize the embedding model (lazy loading)
 */
async function initializeEmbedder() {
  if (embedder) return embedder;
  
  if (isInitializing && initPromise) {
    return initPromise;
  }

  isInitializing = true;
  initPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
    .then((model: any) => {
      embedder = model;
      isInitializing = false;
      console.log('Embedding model loaded');
      return model;
    })
    .catch((error: any) => {
      isInitializing = false;
      console.error('Error loading embedding model:', error);
      throw error;
    });

  return initPromise;
}

/**
 * Generate embedding for a single text
 * 
 * Used for:
 * - Document chunks (during PDF processing/indexing)
 * - User queries (during semantic search)
 * 
 * Both use the same model (Xenova/all-MiniLM-L6-v2) and parameters
 * to ensure consistent embedding space.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const model = await initializeEmbedder();
  
  try {
    // Truncate very long texts to prevent memory issues
    const maxLength = 1000;
    const processedText = text.length > maxLength 
      ? text.substring(0, maxLength) 
      : text;
    
    const output = await model(processedText, { 
      pooling: 'mean', 
      normalize: true 
    });
    
    // Convert tensor to array and immediately release tensor memory
    const embedding = Array.from(output.data) as number[];
    
    // Clean up tensor if possible
    if (output.delete) {
      output.delete();
    }
    
    return embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Generate embeddings for multiple texts (batch processing)
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const model = await initializeEmbedder();
  const embeddings: number[][] = [];
  
  // Process in batches to avoid memory issues
  const batchSize = 10;
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    
    for (const text of batch) {
      try {
        const embedding = await generateEmbedding(text);
        embeddings.push(embedding);
      } catch (error) {
        console.error(`Error generating embedding for text ${i}:`, error);
        // Push zero vector as fallback
        embeddings.push(new Array(384).fill(0));
      }
    }
    
    // Small delay to prevent overwhelming the system
    if (i + batchSize < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return embeddings;
}
