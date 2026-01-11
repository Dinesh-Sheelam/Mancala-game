/**
 * Gemini LLM Service
 * 
 * Uses Google's Gemini API to generate answers from retrieved context
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('⚠️  GEMINI_API_KEY not set. LLM features will be disabled.');
  console.warn('⚠️  Responses will use fallback method (may appear as raw chunks).');
  console.warn('⚠️  To enable LLM synthesis, add GEMINI_API_KEY to backend/.env file');
} else {
  console.log('✅ Gemini API key found. LLM synthesis enabled.');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Generate an answer using Gemini API based on retrieved context
 */
export async function generateAnswerWithGemini(
  question: string,
  context: string
): Promise<string> {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  try {
    // Use gemini-2.5-flash model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a helpful Mancala assistant. I've retrieved the most relevant chunks from the knowledge base based on semantic similarity ranking. Your task is to use this ranked context to generate a natural, human conversational answer.

CONTEXT INFORMATION:
- The chunks below are ranked by relevance to the user's question (most relevant first)
- These chunks were selected using semantic similarity search from the knowledge base
- Use information from these ranked chunks to answer the question

CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THESE:
1. DO NOT copy chunks verbatim - synthesize and explain in your own words
2. DO NOT include metadata like "AI Assistant Usage Rules" or "Digital Mancala Game Context" - only answer about actual game rules
3. DO NOT list rules as bullet points or copy text directly from chunks
4. Generate a HUMAN CONVERSATIONAL answer - write as if you're talking to a friend
5. Rewrite everything in your own conversational style - be natural and friendly
6. Combine information from multiple chunks smoothly if needed
7. Use complete sentences and proper grammar
8. Keep answers concise but informative (typically 2-5 sentences)
9. If the ranked chunks don't fully answer the question, say so honestly
10. Only use information from the ranked context provided below
11. If the question is not about Mancala, politely redirect the user back to Mancala topics
12. Don't make up information that isn't in the ranked context

ABSOLUTELY FORBIDDEN:
- Copying chunk text directly
- Including bullet points from chunks
- Including metadata sections
- Listing rules exactly as they appear in chunks

The user should ONLY see your synthesized, conversational explanation in natural language.

Ranked Context Chunks (most relevant first):
${context}

Question: ${question}

Generate a human conversational answer using the ranked context above. Remember: synthesize, don't copy!`;

    console.log('🤖 Calling Gemini API to generate synthesized answer...');
    console.log(`🤖 Prompt length: ${prompt.length} characters`);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log(`✅ Gemini API response received (${text.length} characters)`);
    console.log(`✅ Response preview: ${text.substring(0, 150)}...`);
    
    // Validate response doesn't look like raw chunks
    const trimmedText = text.trim();
    const hasRankMarkers = trimmedText.includes('[Rank');
    const hasMetadata = trimmedText.includes('Digital Mancala Game Context') || trimmedText.includes('AI Assistant Usage Rules');
    const hasBullets = !!trimmedText.match(/^\s*[•\*]\s/);
    const tooManyLines = trimmedText.split('\n').length > 10;
    
    if (hasRankMarkers || hasMetadata || hasBullets || tooManyLines) {
      console.warn('⚠️  WARNING: Gemini response appears to contain raw chunk markers or formatting!');
      console.warn('⚠️  This suggests the model may not be following synthesis instructions.');
    }
    
    return trimmedText;
  } catch (error) {
    console.error('❌ Gemini API error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
}

/**
 * Generate a simple response without context (for greetings, etc.)
 */
export async function generateSimpleResponse(prompt: string): Promise<string> {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text.trim();
  } catch (error) {
    console.error('Gemini API error (simple response):', error);
    throw error;
  }
}

/**
 * Check if Gemini is available
 */
export function isGeminiAvailable(): boolean {
  return genAI !== null && apiKey !== undefined;
}
