# PDF Documents for RAG Chatbot

## Instructions

Place your PDF documents in this folder. The RAG chatbot will automatically process them when the backend server starts.

### Supported Files
- PDF files (`.pdf` extension)

### How It Works
1. When the backend server starts, it scans this folder for PDF files
2. Each PDF is parsed and split into text chunks
3. Embeddings are generated for each chunk
4. The chunks are stored in a vector database for semantic search
5. When users ask questions, the system retrieves relevant chunks and generates answers

### Adding Documents
Simply place your PDF files in this folder and restart the backend server. The system will automatically:
- Detect new PDFs
- Process and index them
- Make them available for queries

### Example Files
- `Mancala_AI_Knowledge_Base.pdf`
- `mancala_rules.pdf`

### Notes
- The first startup may take a few minutes to process PDFs and generate embeddings
- Large PDFs will take longer to process
- The system processes all PDFs in this folder automatically
