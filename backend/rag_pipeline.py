
import os
from dotenv import load_dotenv
from google import genai
from vector_store import search_chunks

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

def generate_answer(question, document_id):

    results = search_chunks(question, document_id)

    documents = results["documents"][0]
    metadata = results["metadatas"][0]

    context = ""

    for text, meta in zip(documents, metadata):
        context += f"\nPage {meta['page']}:\n{text}\n"

    prompt = f"""
    You are a helpful PDF assistant.

    Answer using ONLY the provided PDF context.

    If the answer is unavailable, say:
    I couldn't find this information in the PDF.

    Include page numbers in your answer.

    Context:
    {context}

    Question:
    {question}
    """

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt
    )

    return response.text
