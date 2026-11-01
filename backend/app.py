
from flask import Flask, request, jsonify
from flask_cors import CORS
from pdf_processor import extract_text, chunk_text
from vector_store import store_chunks, search_chunks
from rag_pipeline import generate_answer
import os

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route("/upload", methods=["POST"])
def upload_pdf():

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only PDF files allowed"}), 400

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    pages = extract_text(file_path)
    chunks = chunk_text(pages)

    if not chunks:
        return jsonify({"error": "No readable text found in PDF"}), 400

    document_id = store_chunks(chunks, file.filename)

    return jsonify({
        "message": "PDF uploaded and stored successfully",
        "document_id": document_id,
        "total_pages": len(pages),
        "total_chunks": len(chunks),
        "stored_in": "ChromaDB"
    })


@app.route("/search", methods=["POST"])
def search_pdf():

    data = request.get_json()

    question = data.get("question")
    document_id = data.get("document_id")

    if not question or not document_id:
        return jsonify({
            "error": "Question and document_id are required"
        }), 400

    results = search_chunks(question, document_id)

    return jsonify({
        "question": question,
        "results": results
    })


@app.route("/chat", methods=["POST"])
def chat():

    data = request.get_json()

    question = data.get("question")
    document_id = data.get("document_id")

    if not question or not document_id:
        return jsonify({
            "error": "Question and document_id are required"
        }), 400

    answer = generate_answer(question, document_id)

    return jsonify({
        "question": question,
        "answer": answer
    })


if __name__ == "__main__":
    app.run(debug=True)
