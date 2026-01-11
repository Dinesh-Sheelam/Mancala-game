# Gemini API Setup

## Overview

The RAG chatbot uses Google's Gemini API to generate intelligent, context-aware answers from the PDF knowledge base.

## Setup Steps

### 1. Get Your Gemini API Key

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Configure Environment Variable

Create a `.env` file in the `backend/` directory:

```bash
cd backend
cp .env.example .env
```

Then edit `.env` and add your API key:

```
GEMINI_API_KEY=your-actual-api-key-here
```

### 3. Install Dependencies

The Gemini SDK is already installed. If you need to reinstall:

```bash
cd backend
npm install
```

### 4. Restart the Server

```bash
npm run dev
```

## Model Information

- **Model**: `gemini-2.5-flash`
- **API Version**: v1beta
- **Location**: Configured in `backend/src/services/geminiService.ts`

## How It Works

1. **Retrieval**: System finds relevant chunks from PDFs using vector search
2. **Generation**: Gemini API (`gemini-2.5-flash`) synthesizes the chunks into a coherent answer
3. **Fallback**: If Gemini fails or isn't configured, system uses simple text extraction

## Free Tier Limits

- **60 requests per minute**
- **1,500 requests per day**
- Perfect for development and moderate production use

## Troubleshooting

### "Gemini API key not configured"
- Make sure `.env` file exists in `backend/` directory
- Check that `GEMINI_API_KEY` is set correctly
- Restart the server after adding the key

### "Gemini API failed, using fallback"
- Check your API key is valid
- Verify you haven't exceeded rate limits
- Check your internet connection
- The system will still work with fallback responses

### Testing

Test the API key is working:

```bash
curl -X POST http://localhost:3000/api/chatbot/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is Mancala?"}'
```

## Notes

- The system works without Gemini (uses fallback), but answers are less coherent
- Gemini significantly improves answer quality
- API calls are made only when users ask questions (not during startup)
- Responses are cached in memory for the session
