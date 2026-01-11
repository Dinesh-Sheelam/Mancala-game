/**
 * Cache Service
 * 
 * Persists PDF chunks and embeddings to disk to avoid reprocessing on every startup.
 * Only regenerates if PDF files are newer than the cache.
 */

import fs from 'fs/promises';
import path from 'path';
import type { PDFChunk } from './pdfService';
import type { VectorDocument } from './vectorStore';

export interface CacheMetadata {
  pdfFiles: Array<{
    filename: string;
    mtime: number; // Modification time
    size: number;
  }>;
  chunkCount: number;
  createdAt: number;
  version: string; // Cache format version
}

const CACHE_VERSION = '1.0.0';
const CACHE_DIR = path.join(process.cwd(), 'backend/data/cache');
const CHUNKS_CACHE_FILE = path.join(CACHE_DIR, 'chunks.json');
const EMBEDDINGS_CACHE_FILE = path.join(CACHE_DIR, 'embeddings.json');
const METADATA_CACHE_FILE = path.join(CACHE_DIR, 'metadata.json');

/**
 * Ensure cache directory exists
 */
async function ensureCacheDir(): Promise<void> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating cache directory:', error);
  }
}

/**
 * Get file modification time
 */
async function getFileMtime(filePath: string): Promise<number> {
  try {
    const stats = await fs.stat(filePath);
    return stats.mtime.getTime();
  } catch {
    return 0;
  }
}

/**
 * Get metadata for all PDF files in a folder
 */
export async function getPDFMetadata(pdfFolder: string): Promise<CacheMetadata['pdfFiles']> {
  const metadata: CacheMetadata['pdfFiles'] = [];
  
  try {
    const files = await fs.readdir(pdfFolder);
    const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));

    for (const file of pdfFiles) {
      const filePath = path.join(pdfFolder, file);
      const stats = await fs.stat(filePath);
      metadata.push({
        filename: file,
        mtime: stats.mtime.getTime(),
        size: stats.size,
      });
    }
  } catch (error) {
    console.error('Error reading PDF metadata:', error);
  }

  return metadata;
}

/**
 * Check if cache is valid (PDFs haven't changed)
 */
export async function isCacheValid(
  pdfFolder: string,
  currentPDFMetadata: CacheMetadata['pdfFiles']
): Promise<boolean> {
  try {
    // Check if cache files exist
    const [chunksExists, embeddingsExists, metadataExists] = await Promise.all([
      fs.access(CHUNKS_CACHE_FILE).then(() => true).catch(() => false),
      fs.access(EMBEDDINGS_CACHE_FILE).then(() => true).catch(() => false),
      fs.access(METADATA_CACHE_FILE).then(() => true).catch(() => false),
    ]);

    if (!chunksExists || !embeddingsExists || !metadataExists) {
      return false;
    }

    // Load cached metadata
    const metadataContent = await fs.readFile(METADATA_CACHE_FILE, 'utf-8');
    const cachedMetadata: CacheMetadata = JSON.parse(metadataContent);

    // Check version
    if (cachedMetadata.version !== CACHE_VERSION) {
      console.log('Cache version mismatch, invalidating cache');
      return false;
    }

    // Check if PDF files match
    if (cachedMetadata.pdfFiles.length !== currentPDFMetadata.length) {
      console.log('PDF file count changed, invalidating cache');
      return false;
    }

    // Check if any PDF file was modified
    for (const currentFile of currentPDFMetadata) {
      const cachedFile = cachedMetadata.pdfFiles.find(
        f => f.filename === currentFile.filename
      );

      if (!cachedFile) {
        console.log(`New PDF file detected: ${currentFile.filename}, invalidating cache`);
        return false;
      }

      if (cachedFile.mtime !== currentFile.mtime || cachedFile.size !== currentFile.size) {
        console.log(`PDF file modified: ${currentFile.filename}, invalidating cache`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error checking cache validity:', error);
    return false;
  }
}

/**
 * Save chunks and embeddings to cache
 */
export async function saveCache(
  chunks: PDFChunk[],
  embeddings: number[][],
  pdfMetadata: CacheMetadata['pdfFiles']
): Promise<void> {
  try {
    await ensureCacheDir();

    const metadata: CacheMetadata = {
      pdfFiles: pdfMetadata,
      chunkCount: chunks.length,
      createdAt: Date.now(),
      version: CACHE_VERSION,
    };

    // Save chunks
    await fs.writeFile(CHUNKS_CACHE_FILE, JSON.stringify(chunks, null, 2));

    // Save embeddings (as JSON array)
    await fs.writeFile(EMBEDDINGS_CACHE_FILE, JSON.stringify(embeddings, null, 2));

    // Save metadata
    await fs.writeFile(METADATA_CACHE_FILE, JSON.stringify(metadata, null, 2));

    console.log(`Cache saved: ${chunks.length} chunks and embeddings`);
  } catch (error) {
    console.error('Error saving cache:', error);
    throw error;
  }
}

/**
 * Load chunks and embeddings from cache
 */
export async function loadCache(): Promise<{
  chunks: PDFChunk[];
  embeddings: number[][];
} | null> {
  try {
    const [chunksContent, embeddingsContent] = await Promise.all([
      fs.readFile(CHUNKS_CACHE_FILE, 'utf-8'),
      fs.readFile(EMBEDDINGS_CACHE_FILE, 'utf-8'),
    ]);

    const chunks: PDFChunk[] = JSON.parse(chunksContent);
    const embeddings: number[][] = JSON.parse(embeddingsContent);

    if (chunks.length !== embeddings.length) {
      console.error('Cache mismatch: chunks and embeddings count differ');
      return null;
    }

    console.log(`Cache loaded: ${chunks.length} chunks and embeddings`);
    return { chunks, embeddings };
  } catch (error) {
    console.error('Error loading cache:', error);
    return null;
  }
}

/**
 * Clear cache (useful for forcing regeneration)
 */
export async function clearCache(): Promise<void> {
  try {
    await Promise.all([
      fs.unlink(CHUNKS_CACHE_FILE).catch(() => {}),
      fs.unlink(EMBEDDINGS_CACHE_FILE).catch(() => {}),
      fs.unlink(METADATA_CACHE_FILE).catch(() => {}),
    ]);
    console.log('Cache cleared');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}
