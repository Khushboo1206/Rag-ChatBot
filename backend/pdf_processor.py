import pymupdf

def extract_text(pdf_path):
    doc = pymupdf.open(pdf_path)
    pages = []

    for page_number, page in enumerate(doc):
        text = page.get_text()

        if text.strip():
            pages.append({
                "page": page_number + 1,
                "text": text
            })

    doc.close()
    return pages


def chunk_text(pages, chunk_size=500, overlap=50):
    chunks = []

    for page in pages:
        words = page["text"].split()

        start = 0

        while start < len(words):
            end = start + chunk_size

            chunk = " ".join(words[start:end])

            chunks.append({
                "page": page["page"],
                "text": chunk
            })

            start += chunk_size - overlap

    return chunks