# Implementation Tasks: Add Mancala Chatbot

## Setup
- [x] Create chatbot types file (`frontend/src/types/chatbot.ts`)
- [x] Create chatbot service file (`frontend/src/services/ragApi.ts` - RAG API service)
- [x] Create chatbot component file (`frontend/src/components/landing/MancalaChatbot.tsx`)

## Backend RAG Implementation
- [x] Implement PDF parsing service (`backend/src/services/pdfService.ts`)
- [x] Implement embedding generation service (`backend/src/services/embeddingService.ts`)
- [x] Implement vector store service (`backend/src/services/vectorStore.ts`)
- [x] Implement cache service for processed chunks (`backend/src/services/cacheService.ts`)
- [x] Implement Gemini API integration (`backend/src/services/geminiService.ts`)
- [x] Implement RAG orchestration service (`backend/src/services/ragService.ts`)
- [x] Create chatbot API route (`backend/src/routes/chatbot.ts`)
- [x] Configure environment variables for Gemini API key

## Chatbot Service Implementation
- [x] Implement knowledge base structure using PDF documents (Mancala_AI_Knowledge_Base.pdf and mancala_rules.pdf)
- [x] Implement RAG-based question answering with semantic search
- [x] Implement response generation using Gemini API for LLM synthesis
- [x] Implement topic filtering (only Mancala-related topics)
- [x] Implement polite refusal for non-Mancala questions
- [x] Implement error handling for edge cases

## Chatbot Component Implementation
- [x] Create floating chat button (bottom-right corner, vintage-themed)
- [x] Create chat window UI (modal-like, vintage-themed)
- [x] Implement message display (user messages and bot responses)
- [x] Implement message input field with send button
- [x] Implement chat history (local to component, resets on unmount)
- [x] Implement open/close animations
- [x] Style to match vintage blue/brown/orange theme
- [x] Make component responsive for mobile devices

## Integration
- [x] Add chatbot component to LandingPage.tsx
- [x] Ensure chatbot only renders on landing page
- [x] Test that chatbot doesn't affect other page functionality
- [x] Test that chatbot can be removed without breaking app

## Testing & Validation
- [x] Test chatbot with Mancala history questions
- [x] Test chatbot with rule clarification questions
- [x] Test chatbot with strategy questions
- [x] Test chatbot with non-Mancala questions (should redirect politely)
- [x] Test chatbot on mobile devices
- [x] Test that chat history resets when navigating away from landing page
- [x] Verify chatbot doesn't interfere with game logic or state
- [x] Verify chatbot is easily removable (delete component import/usage)

## Documentation
- [x] Document chatbot knowledge boundaries in code comments
- [x] Document RAG architecture in `docs/RAG_CHATBOT.md`
- [x] Document Gemini API setup in `backend/GEMINI_SETUP.md`
- [x] Update component documentation
