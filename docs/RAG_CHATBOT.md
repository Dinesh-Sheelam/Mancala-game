# RAG Chatbot Architecture Documentation

## Overview

The Mancala RAG (Retrieval-Augmented Generation) Chatbot is an intelligent question-answering system that uses vector embeddings and Google's Gemini API to provide context-aware answers from PDF documents.

## System Configuration

**Embedding Model**:
- ✅ **Model**: `Xenova/all-MiniLM-L6-v2` (free, local transformer)
- ✅ **Used For**: Both document chunks AND user queries
- ✅ **Function**: `generateEmbedding()` from `embeddingService.ts`
- ✅ **Parameters**: `pooling: 'mean'`, `normalize: true`
- ✅ **Preprocessing**: Text normalization (`replace(/\s+/g, ' ').trim()`)

**LLM Service**:
- ✅ **Provider**: Google Gemini API
- ✅ **Model**: `gemini-2.5-flash`
- ✅ **API Key**: `GEMINI_API_KEY` environment variable
- ✅ **Service**: `geminiService.ts`

**Cache System**:
- ✅ **Location**: `backend/data/cache/`
- ✅ **Files**: `chunks.json`, `embeddings.json`, `metadata.json`
- ✅ **Validation**: Based on PDF file modification times
- ✅ **Process**: Unchanged from original implementation

## What is RAG?

RAG (Retrieval-Augmented Generation) combines three key components:

1. **Retrieval**: Find relevant information from documents using semantic search
2. **Augmentation**: Add retrieved context to the user's question
3. **Generation**: Use an LLM (Gemini) to synthesize a coherent answer

This approach provides accurate, context-aware answers without requiring the LLM to be trained on the specific knowledge base.

---

## Complete Architecture Flow

### Startup Phase (One-Time Processing)

```
┌─────────────────────────────────────────────────────────────┐
│                    SERVER STARTUP                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │   Check Cache Validity             │
        │   (backend/data/cache/)            │
        └───────────────────────────────────┘
                    │                    │
         ┌──────────┘                    └──────────┐
         │                                          │
    Cache Valid?                              Cache Invalid?
         │                                          │
         ▼                                          ▼
┌──────────────────┐                  ┌──────────────────────┐
│ Load from Cache  │                  │ Process PDFs        │
│ - chunks.json    │                  │ 1. Read PDF files    │
│ - embeddings.json│                  │ 2. Extract text     │
│                  │                  │ 3. Split into chunks │
│ FAST (~1 sec)    │                  │ 4. Generate          │
└──────────────────┘                  │    embeddings        │
         │                            │ 5. Save to cache    │
         │                            │                     │
         │                            │ SLOW (~3-6 min)     │
         │                            └──────────────────────┘
         │                                          │
         └──────────────────┬───────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │ Vector Store Ready     │
                │ Ready to Answer!      │
                └───────────────────────┘
```

### Query Phase (Every User Question)

```
┌─────────────────────────────────────────────────────────────┐
│              USER ASKS A QUESTION                           │
│         "When was Mancala invented?"                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │   Question Validation              │
        │   - Check if Mancala-related      │
        │   - Filter unrelated questions     │
        └───────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │   Generate Query Embedding        │
        │   Convert question to vector      │
        │   (384 dimensions)                │
        │   Model: Xenova/all-MiniLM-L6-v2  │
        │   (SAME as chunks)                │
        └───────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │   Vector Search (Retrieval)        │
        │   - Compare with all chunks        │
        │   - Calculate cosine similarity    │
        │   - Get top 3 most relevant       │
        └───────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │   Context Assembly                │
        │   Combine top 3 chunks            │
        └───────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │   LLM Generation (Gemini API)     │
        │   Model: gemini-2.5-flash         │
        │   - Send: Question + Context      │
        │   - Gemini synthesizes answer     │
        └───────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────┐
        │   Return Answer to User           │
        │   Natural, coherent response      │
        └───────────────────────────────────┘
```

---

## Component Breakdown

### 1. PDF Service (`pdfService.ts`)

**Purpose**: Extract and chunk PDF content for processing

**Key Functions**:
- `loadPDFsFromFolder()`: Scans PDF folder and extracts text
- `splitIntoChunks()`: Splits text into overlapping chunks

**Chunking Strategy**:
- **Chunk Size**: 1000 characters
- **Overlap**: 150 characters (prevents context loss at boundaries)
- **Max Chunks**: 500 (prevents memory issues)
- **Min Chunk Length**: 20 characters (filters out tiny fragments)

**Process**:
```
PDF File → Read Binary → Parse Text → Clean Text → Split into Chunks
```

**Example**:
```
Input PDF Text:
"Mancala is 1,300 years old. It originated in Africa. Archaeological 
evidence shows boards carved in stone in Ethiopia, Eritrea, and 
ancient Egypt. The name comes from Arabic 'naqala' meaning 'to move'."

Output Chunks:
Chunk 1: "Mancala is 1,300 years old. It originated in Africa. 
         Archaeological evidence shows boards carved in stone in 
         Ethiopia, Eritrea, and ancient Egypt. The name comes from..."

Chunk 2: "...in Ethiopia, Eritrea, and ancient Egypt. The name comes 
         from Arabic 'naqala' meaning 'to move'." (overlaps with Chunk 1)
```

**Why Chunking?**
- LLMs have token limits
- Smaller chunks = more precise retrieval
- Overlap ensures context isn't lost at boundaries

---

### 2. Embedding Service (`embeddingService.ts`)

**Purpose**: Convert text to numerical vectors for semantic search

**Model**: `Xenova/all-MiniLM-L6-v2`
- **Type**: Local transformer model
- **Dimensions**: 384
- **Advantages**: Free, fast, no API costs, privacy-friendly

**CRITICAL: Same Model for Chunks and Queries**
- ✅ **Document Chunks**: Embedded during PDF processing/indexing
- ✅ **User Queries**: Embedded during semantic search
- ✅ **Same Function**: Both use `generateEmbedding()` from `embeddingService.ts`
- ✅ **Same Parameters**: `pooling: 'mean'`, `normalize: true`
- ✅ **Same Preprocessing**: Text normalization applied consistently

This ensures embeddings are in the same vector space, enabling accurate similarity matching.

**Process**:
```
Text Input → Normalize Whitespace → Model Processing → Embedding Vector
```

**Example**:
```
Input: "Mancala is 1,300 years old"
Normalized: "Mancala is 1,300 years old" (whitespace normalized)
Output: [0.23, -0.45, 0.12, 0.67, ..., 0.89] (384 numbers)
```

**Why Embeddings?**
- **Semantic Understanding**: Similar meanings = similar vectors
- **Vector Math**: Can calculate similarity between concepts
- **No Keywords Needed**: Finds meaning, not just word matches

**Similarity Example**:
```
"game" and "board game" → High similarity (0.85)
"game" and "cooking" → Low similarity (0.12)
```

---

### 3. Vector Store (`vectorStore.ts`)

**Purpose**: Store and search document embeddings efficiently

**Storage Structure**:
```typescript
[
  {
    chunk: "Mancala is 1,300 years old...",
    embedding: [0.23, -0.45, 0.12, ..., 0.89]
  },
  {
    chunk: "The game originated in Africa...",
    embedding: [0.12, 0.67, -0.23, ..., 0.45]
  },
  // ... more chunks
]
```

**Search Algorithm**:
1. Generate query embedding
2. Calculate cosine similarity with all chunks
3. Sort by similarity score (descending)
4. Return top K results

**Cosine Similarity Formula**:
```
similarity = (A · B) / (||A|| × ||B||)

Where:
- A · B = dot product of vectors
- ||A|| = magnitude of vector A
- ||B|| = magnitude of vector B
```

**Similarity Scores**:
- **1.0**: Identical meaning
- **0.7-0.9**: Very similar
- **0.4-0.6**: Somewhat related
- **0.0**: Unrelated
- **-1.0**: Opposite meaning

**Example Search**:
```
Query: "When was Mancala invented?"

Chunk 1: "Mancala is 1,300 years old..." → Similarity: 0.89 ✓
Chunk 2: "The game has 6 pits..." → Similarity: 0.23
Chunk 3: "Mancala originated in Africa..." → Similarity: 0.85 ✓
Chunk 4: "Players take turns..." → Similarity: 0.15

Top 3 Retrieved: Chunk 1, Chunk 3, Chunk 2
```

---

### 4. Cache Service (`cacheService.ts`)

**Purpose**: Persist chunks and embeddings to avoid reprocessing

**What's Cached**:
- `chunks.json`: All text chunks with metadata
- `embeddings.json`: All embedding vectors
- `metadata.json`: PDF file information (for validation)

**Cache Validation**:
```
For each PDF file:
1. Check if file exists in cache metadata
2. Compare file modification time
3. Compare file size
4. If any mismatch → Cache invalid
```

**Cache Structure**:
```json
// metadata.json
{
  "pdfFiles": [
    {
      "filename": "Mancala_AI_Knowledge_Base.pdf",
      "mtime": 1704729600000,
      "size": 4671
    }
  ],
  "chunkCount": 150,
  "createdAt": 1704729600000,
  "version": "1.0.0"
}
```

**Benefits**:
- **Fast Startup**: ~1 second vs ~3-6 minutes
- **No Memory Issues**: Avoids regenerating embeddings
- **Smart Updates**: Only regenerates when PDFs change
- **Persistent**: Survives server restarts

**Cache Invalidation Triggers**:
- PDF file modified
- New PDF file added
- PDF file deleted
- Cache version mismatch

---

### 5. Gemini Service (`geminiService.ts`)

**Purpose**: Generate natural language answers using Google's Gemini API

**Model**: `gemini-2.5-flash`
- **Provider**: Google AI
- **Free Tier**: 60 requests/minute, 1,500/day
- **Cost**: Free for moderate use

**Process**:
```
Context (retrieved chunks) + Question → Gemini API → Coherent Answer
```

**Prompt Structure**:
```
System Instructions:
"You are a helpful assistant that answers questions about Mancala 
based on the provided context from PDF documents.

Instructions:
- Only use information from the context provided below
- If the question is not about Mancala, politely redirect
- Be concise, clear, and beginner-friendly
- If the context doesn't contain enough information, say so honestly
- Use natural, conversational language
- Don't make up information that isn't in the context"

Context from knowledge base:
[Retrieved chunk 1]

---

[Retrieved chunk 2]

---

[Retrieved chunk 3]

Question: [User's question]

Answer based on the context:
```

**Why Gemini?**
- **Synthesis**: Combines information from multiple chunks
- **Understanding**: Interprets context and question intent
- **Natural Language**: Generates conversational responses
- **Accuracy**: Only uses provided context (no hallucination)

**Fallback Behavior**:
- If Gemini API fails → Uses simple keyword extraction
- If API key not set → Uses fallback method
- System always provides an answer (never crashes)

---

### 6. RAG Service (`ragService.ts`)

**Purpose**: Orchestrates the entire RAG pipeline

**Initialization Flow**:
```
1. Get PDF metadata (file names, modification times)
2. Check cache validity
3. If valid:
   - Load chunks from cache
   - Load embeddings from cache
   - Initialize vector store
4. If invalid:
   - Process PDFs → Extract chunks
   - Generate embeddings
   - Save to cache
   - Initialize vector store
```

**Query Flow**:
```
1. Validate question (Mancala-related?)
2. Check if system is ready
3. Generate query embedding (using same model as chunks)
4. Search vector store (retrieve top 3 chunks)
5. Assemble context from chunks
6. Generate answer with Gemini (gemini-2.5-flash)
7. Fallback if Gemini fails
8. Return answer
```

**Key Features**:
- **Background Initialization**: Server starts immediately
- **Non-blocking**: Doesn't block server startup
- **Error Handling**: Graceful fallbacks at every step
- **Status Tracking**: Knows when system is ready

---

## Data Flow Example

### Example Query: "When was Mancala invented?"

#### Step 1: Question Validation
```
Input: "When was Mancala invented?"
Validation: ✓ Contains "Mancala" and "invented" → Mancala-related
```

#### Step 2: Generate Query Embedding
```
Question: "When was Mancala invented?"
↓
Normalize: "When was Mancala invented?" (whitespace normalized)
↓
Query Embedding: [0.12, -0.34, 0.56, 0.23, ..., 0.78]
(Dimension: 384)
Model: Xenova/all-MiniLM-L6-v2 (SAME as chunks)
```

#### Step 3: Vector Search
```
Compare query embedding with all chunk embeddings:

Chunk 1: "Mancala is 1,300 years old. It originated in Africa..."
  Embedding: [0.15, -0.30, 0.58, 0.20, ..., 0.75]
  Cosine Similarity: 0.89 ✓ (Very relevant!)

Chunk 2: "The game has 6 pits on each side..."
  Embedding: [0.05, 0.12, -0.20, 0.45, ..., 0.30]
  Cosine Similarity: 0.23 (Less relevant)

Chunk 3: "Mancala originated in Africa. Archaeological evidence..."
  Embedding: [0.13, -0.32, 0.55, 0.22, ..., 0.76]
  Cosine Similarity: 0.85 ✓ (Very relevant!)

Chunk 4: "Players take turns picking up seeds..."
  Embedding: [-0.10, 0.25, 0.15, -0.30, ..., 0.20]
  Cosine Similarity: 0.15 (Not relevant)

Top 3 Retrieved: Chunk 1, Chunk 3, Chunk 2
```

#### Step 4: Context Assembly
```
Context:
"Mancala is 1,300 years old. It originated in Africa. Archaeological 
evidence of Mancala boards has been discovered carved into stone 
surfaces in regions such as Ethiopia, Eritrea, and ancient Egypt."

---

"Mancala originated in Africa. Archaeological evidence shows boards 
carved in stone in Ethiopia, Eritrea, and ancient Egypt. The name 
'Mancala' comes from the Arabic word 'naqala', meaning 'to move'."

---

"The game has 6 pits on each side of the board and one store to 
the right. At the start of the game, four seeds are placed in each 
of the six pits."
```

#### Step 5: LLM Generation (Gemini)
```
Input to Gemini (gemini-2.5-flash):
- Context: [Above 3 chunks]
- Question: "When was Mancala invented?"

Gemini Processing:
- Model: gemini-2.5-flash
- Analyzes context
- Identifies relevant information
- Synthesizes coherent answer
- Ensures answer is based only on context

Output:
"Mancala is one of the oldest known board games, with origins 
tracing back more than 1,300 years to Africa. Archaeological 
evidence of Mancala boards has been discovered carved into stone 
surfaces in regions such as Ethiopia, Eritrea, and ancient Egypt."
```

#### Step 6: Return to User
```
User receives:
Natural, coherent answer that synthesizes information from 
multiple chunks, not just raw text extraction.
```

---

## Performance Metrics

### Startup Time

**First Time (No Cache)**:
- PDF Parsing: ~10-30 seconds
- Embedding Generation: ~2-5 minutes (for 500 chunks)
- **Total**: ~3-6 minutes

**Subsequent Starts (With Cache)**:
- Cache Loading: ~1 second
- **Total**: ~1 second

### Query Time

**Per Query**:
- Query Embedding Generation: ~100ms
- Vector Search: ~10ms (in-memory, very fast)
- Gemini API Call: ~500-2000ms (network latency)
- **Total**: ~0.6-2 seconds per query

### Memory Usage

- **Embeddings**: ~1.5MB per 500 chunks (384 dimensions × 4 bytes × 500)
- **Chunks**: ~500KB-2MB (depending on text length)
- **Total**: ~2-4MB for typical knowledge base

---

## File Structure

```
backend/
├── src/
│   ├── services/
│   │   ├── pdfService.ts          # PDF parsing & chunking
│   │   ├── embeddingService.ts    # Generate embeddings (local)
│   │   ├── vectorStore.ts         # Store & search vectors
│   │   ├── cacheService.ts        # Cache management
│   │   ├── geminiService.ts       # LLM answer generation
│   │   └── ragService.ts          # Main orchestration
│   ├── routes/
│   │   └── chatbot.ts             # API endpoint
│   └── server.ts                  # Server setup
├── data/
│   ├── pdfs/                      # Source PDF files
│   │   ├── Mancala_AI_Knowledge_Base.pdf
│   │   └── mancala_rules.pdf
│   └── cache/                     # Cached data
│       ├── chunks.json            # Cached text chunks
│       ├── embeddings.json        # Cached embeddings
│       └── metadata.json          # Cache metadata
├── .env                           # Environment variables
│   └── GEMINI_API_KEY=...
└── package.json
```

---

## API Endpoints

### POST `/api/chatbot/query`

**Request**:
```json
{
  "question": "When was Mancala invented?"
}
```

**Response**:
```json
{
  "answer": "Mancala is one of the oldest known board games, with origins tracing back more than 1,300 years to Africa..."
}
```

### GET `/api/chatbot/health`

**Response**:
```json
{
  "initialized": true,
  "isInitializing": false,
  "documentCount": 150,
  "isVectorStoreReady": true
}
```

---

## Key Design Decisions

### 1. Local Embeddings
- **Why**: No API costs, fast, privacy-friendly
- **Trade-off**: Slightly less accurate than OpenAI embeddings
- **Model**: Xenova/all-MiniLM-L6-v2 (384 dimensions)
- **Consistency**: Same model used for both document chunks and user queries
  - Ensures embeddings are in the same vector space
  - Enables accurate cosine similarity matching
  - Both use `generateEmbedding()` with identical parameters

### 2. Caching System
- **Why**: Fast startup, avoid reprocessing
- **Trade-off**: Disk space (~5-10MB)
- **Benefit**: 1 second vs 3-6 minutes startup

### 3. Batch Processing
- **Why**: Memory-efficient embedding generation
- **Batch Size**: 2 chunks at a time
- **Benefit**: Prevents out-of-memory errors

### 4. Fallback System
- **Why**: Always provide an answer
- **Fallback**: Simple keyword extraction
- **Benefit**: System never crashes, always works

### 5. Chunk Limit
- **Why**: Prevent memory issues with large PDFs
- **Limit**: 500 chunks maximum
- **Benefit**: Predictable memory usage

### 6. Background Initialization
- **Why**: Server starts immediately
- **Trade-off**: Queries may wait if not ready
- **Benefit**: Better user experience

---

## Configuration

### Environment Variables

**Required**:
```env
GEMINI_API_KEY=your-api-key-here
```

**Optional**:
```env
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### Model Configuration

- **LLM Model**: `gemini-2.5-flash` (configured in `backend/src/services/geminiService.ts`)
- **Embedding Model**: `Xenova/all-MiniLM-L6-v2` (configured in `backend/src/services/embeddingService.ts`)
- **API Version**: v1beta (for Gemini API)

### Getting Gemini API Key

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key to `.env` file

### Free Tier Limits

- **60 requests per minute**
- **1,500 requests per day**
- Perfect for development and moderate production use

---

## Troubleshooting

### Issue: "GEMINI_API_KEY not set"
**Solution**: Add API key to `backend/.env` file

### Issue: "Cache invalid"
**Solution**: This is normal if PDFs changed. System will regenerate automatically.

### Issue: "Gemini API failed, using fallback"
**Possible Causes**:
- Invalid API key
- Rate limit exceeded
- Network issues
- Model name error (404 Not Found) - ensure using `gemini-2.5-flash`
- **Solution**: System uses fallback automatically, still works
- **Note**: If you see "models/gemini-pro is not found", the model name has been updated to `gemini-2.5-flash` in the code

### Issue: Slow startup
**First Time**: Normal (3-6 minutes for processing)
**Subsequent**: Should be ~1 second. Check cache files exist.

### Issue: Out of memory
**Solution**: 
- Increase Node.js heap: `--max-old-space-size=6144`
- Reduce chunk limit in `pdfService.ts`
- Process fewer PDFs at once

---

## Future Enhancements

### Potential Improvements

1. **Persistent Vector Database**
   - Use ChromaDB or Pinecone instead of in-memory
   - Handle larger knowledge bases
   - Better scalability

2. **Multi-Modal Support**
   - Process images in PDFs
   - Use Gemini Vision for image understanding

3. **Streaming Responses**
   - Stream Gemini responses as they generate
   - Better user experience

4. **Query Expansion**
   - Generate multiple query variations
   - Improve retrieval accuracy

5. **Source Citations**
   - Show which PDF/chunk answer came from
   - Better transparency

6. **Conversation History**
   - Maintain context across multiple questions
   - Better follow-up question handling

---

## Recent Changes

### Model Update (2025)
- **Changed**: LLM model from `gemini-pro` to `gemini-2.5-flash`
- **Reason**: `gemini-pro` was deprecated/not available in v1beta API (404 errors)
- **Impact**: System now successfully generates synthesized answers instead of falling back to raw chunks
- **Files Updated**: `backend/src/services/geminiService.ts`
- **Status**: ✅ Fixed and verified

### Embedding Consistency Verification
- **Verified**: Same embedding model (`Xenova/all-MiniLM-L6-v2`) used for both document chunks and user queries
- **Impact**: Ensures accurate similarity matching in vector search
- **Files**: `backend/src/services/embeddingService.ts`, `backend/src/services/vectorStore.ts`

---

## Summary

The RAG chatbot architecture provides:

✅ **Fast Retrieval**: Vector search finds relevant information in milliseconds  
✅ **Intelligent Answers**: Gemini (gemini-2.5-flash) synthesizes coherent responses  
✅ **Efficient Caching**: Startup in seconds, not minutes  
✅ **Robust Fallbacks**: Always provides answers, never crashes  
✅ **Cost-Effective**: Free embeddings (Xenova/all-MiniLM-L6-v2), free-tier Gemini  
✅ **Scalable**: Can handle multiple PDFs and thousands of chunks  

This architecture combines the best of semantic search (fast, accurate retrieval) with LLM generation (natural, coherent answers) to create an intelligent question-answering system.
