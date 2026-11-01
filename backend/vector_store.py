
import chromadb
from sentence_transformers import SentenceTransformer
import uuid

# Initialize embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Initialize ChromaDB
client = chromadb.PersistentClient(path="./chroma_db")

collection = client.get_or_create_collection(
    name="pdf_documents"
)


def store_chunks(chunks, filename):

    document_id = str(uuid.uuid4())

    texts = [chunk["text"] for chunk in chunks]

    embeddings = model.encode(texts).tolist()

    ids = [
        f"{document_id}_{i}"
        for i in range(len(chunks))
    ]

    collection.add(
        ids=ids,
        documents=texts,
        embeddings=embeddings,
        metadatas=[
            {
                "page": chunk["page"],
                "filename": filename,
                "document_id": document_id
            }
            for chunk in chunks
        ]
    )

    return document_id


# Semantic search
def search_chunks(question, document_id, top_k=3):

    # Convert question into embedding
    question_embedding = model.encode(question).tolist()

    # Search relevant chunks
    results = collection.query(
        query_embeddings=[question_embedding],
        n_results=top_k,
        where={"document_id": document_id}
    )

    return results
