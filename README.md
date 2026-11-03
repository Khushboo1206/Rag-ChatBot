# PDFMind – AI-Powered PDF Q&A Chatbot

PDFMind is a full-stack AI-powered chatbot that allows users to upload PDF documents and ask questions in natural language. It uses Retrieval-Augmented Generation (RAG) to retrieve relevant document content and generate context-grounded answers using Google Gemini.

## Features

- **PDF Upload:** Upload and process PDF documents.
- **Text Extraction:** Extract text from PDFs using PyMuPDF.
- **Text Chunking:** Split extracted content into overlapping chunks for efficient retrieval.
- **Semantic Search:** Generate embeddings using Sentence Transformers and retrieve relevant chunks using ChromaDB.
- **AI-Powered Q&A:** Generate context-aware responses using Google Gemini.
- **Source References:** Include relevant page numbers in generated answers.
- **Chat History:** Maintain previous conversations using browser local storage.
- **Responsive UI:** Dark-themed React interface with a sidebar and chat layout.

## Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite, CSS |
| Backend | Python, Flask, Flask-CORS |
| PDF Processing | PyMuPDF |
| Embeddings | Sentence Transformers (`all-MiniLM-L6-v2`) |
| Vector Database | ChromaDB |
| LLM | Google Gemini API |
| Testing | Pytest |
| Version Control | Git, GitHub |

## Architecture

1. User uploads a PDF through the React frontend.
2. Flask receives the document and extracts text using PyMuPDF.
3. Extracted text is divided into overlapping chunks.
4. Sentence Transformers converts chunks into vector embeddings.
5. ChromaDB stores embeddings, document chunks, and metadata.
6. When a user asks a question, the system generates a query embedding.
7. ChromaDB retrieves the most relevant chunks using semantic similarity.
8. Retrieved context is passed to Gemini to generate a grounded response.
9. The answer is displayed in the React chat interface with page references.

## Project Structure

```text
RAG-CHATBOT/
├── backend/
│   ├── uploads/
│   ├── chroma_db/
│   ├── app.py
│   ├── pdf_processor.py
│   ├── rag_pipeline.py
│   ├── vector_store.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## Installation and Setup

### Prerequisites

- Python 3.10+
- Node.js and npm
- Google Gemini API key

### 1. Clone the Repository

```bash
git clone https://github.com/Khushboo1206/Rag-ChatBot.git
cd Rag-ChatBot
```

### 2. Backend Setup

```bash
cd backend

python -m venv venv
```

Activate the virtual environment:

**Windows PowerShell:**
```powershell
.\venv\Scripts\Activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside the backend folder:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Start the Flask server:

```bash
python app.py
```

Backend runs at `http://127.0.0.1:5000`.

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, usually `http://localhost:5173`.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/upload` | Upload and process a PDF |
| POST | `/search` | Retrieve relevant document chunks |
| POST | `/chat` | Generate an AI-powered answer |

## Testing

Run backend tests using:

```bash
cd backend
pytest -v
```

The API tests validate backend functionality and endpoint behavior.

## Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key |

**Security:** Never commit your `.env` file or expose API keys in the repository.

## Future Improvements

- Support multiple PDF documents in a single conversation.
- Add streaming responses.
- Improve retrieval using reranking.
- Add user authentication.
- Support conversation export and document management.

## Author

**Khushboo Nimje**

B.Tech – Computer Science and Engineering  
MIT ADT University, Pune

[GitHub Repository](https://github.com/Khushboo1206/Rag-ChatBot)
