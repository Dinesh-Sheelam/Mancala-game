/**
 * PDF Service
 * 
 * Handles parsing PDF files and extracting text chunks for RAG.
 */

import pdf from 'pdf-parse';
import fs from 'fs/promises';
import path from 'path';

export interface PDFChunk {
  id: string;
  text: string;
  source: string; // PDF filename
  page?: number;
  chunkIndex: number;
}

const CHUNK_SIZE = 1000; // characters per chunk (larger chunks = fewer total chunks = less memory)
const CHUNK_OVERLAP = 150; // overlap between chunks

/**
 * Loads all PDFs from a folder and extracts text chunks
 * Limits total chunks to prevent memory issues
 */
export async function loadPDFsFromFolder(folderPath: string, maxChunks: number = 500): Promise<PDFChunk[]> {
  const chunks: PDFChunk[] = [];
  
  try {
    const files = await fs.readdir(folderPath);
    const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));

    if (pdfFiles.length === 0) {
      console.warn(`No PDF files found in ${folderPath}`);
      return chunks;
    }

    console.log(`Found ${pdfFiles.length} PDF file(s) to process`);

    for (const file of pdfFiles) {
      // Stop if we've reached the limit
      if (chunks.length >= maxChunks) {
        console.log(`Reached chunk limit of ${maxChunks}. Stopping processing.`);
        break;
      }

      try {
        const filePath = path.join(folderPath, file);
        const dataBuffer = await fs.readFile(filePath);
        const pdfData = await pdf(dataBuffer);
        
        console.log(`Processing ${file} (${pdfData.numpages} pages, ${pdfData.text.length} chars)`);
        
        if (!pdfData.text || pdfData.text.trim().length === 0) {
          console.warn(`No text extracted from ${file}. The PDF might be image-based or corrupted.`);
          continue;
        }
        
        // Split text into chunks
        const textChunks = splitIntoChunks(pdfData.text, CHUNK_SIZE, CHUNK_OVERLAP);
        
        if (textChunks.length === 0) {
          console.warn(`No valid chunks created from ${file}. Text might be too short.`);
          continue;
        }
        
        // Add chunks up to the limit
        const remainingSlots = maxChunks - chunks.length;
        const chunksToAdd = textChunks.slice(0, remainingSlots);
        
        chunksToAdd.forEach((chunk, index) => {
          chunks.push({
            id: `${file}-chunk-${index}`,
            text: chunk,
            source: file,
            chunkIndex: index,
          });
        });

        console.log(`Extracted ${chunksToAdd.length} chunks from ${file} (${textChunks.length} total available)`);
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
        if (error instanceof Error) {
          console.error(`Error details: ${error.message}`);
          console.error(`Stack: ${error.stack}`);
        }
      }
    }

    console.log(`Total chunks extracted: ${chunks.length}`);
    if (chunks.length >= maxChunks) {
      console.warn(`Chunk limit reached. Some content may not be indexed.`);
    }
    return chunks;
  } catch (error) {
    console.error(`Error reading PDF folder ${folderPath}:`, error);
    return chunks;
  }
}

/**
 * Splits text into overlapping chunks
 */
function splitIntoChunks(text: string, size: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;

  if (!text || text.trim().length === 0) {
    return chunks;
  }

  // Clean up text - normalize whitespace but keep structure
  const cleanedText = text.replace(/\s+/g, ' ').trim();

  if (cleanedText.length === 0) {
    return chunks;
  }

  while (start < cleanedText.length) {
    const end = Math.min(start + size, cleanedText.length);
    const chunk = cleanedText.substring(start, end).trim();
    
    // Only add chunks that have meaningful content (at least 20 chars)
    if (chunk.length >= 20) {
      chunks.push(chunk);
    }
    
    // Move start position
    start = end - overlap;
    
    // Prevent infinite loop or getting stuck
    if (start >= cleanedText.length || (start === end - overlap && end >= cleanedText.length)) {
      break;
    }
    
    // Safety check: if we're not making progress, break
    if (start < 0) {
      start = end;
    }
  }

  return chunks;
}
