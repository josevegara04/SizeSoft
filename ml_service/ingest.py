import os
import chromadb
from chromadb.utils import embedding_functions

DOCS_PATH = "./docs"
CHROMA_PATH = "./chroma_db"

def load_documents():
    docs = []
    for filename in os.listdir(DOCS_PATH):
        if filename.endswith(".md"):
            with open(os.path.join(DOCS_PATH, filename), "r", encoding="utf-8") as f:
                content = f.read()
                chunks = [c.strip() for c in content.split("\n\n") if c.strip()]
                for i, chunk in enumerate(chunks):
                    docs.append({
                        "id": f"{filename}_{i}",
                        "text": chunk,
                        "source": filename
                    })
    return docs

def get_collection():
    client = chromadb.PersistentClient(path=CHROMA_PATH)
    ef = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="paraphrase-multilingual-MiniLM-L12-v2"
    )
    collection = client.get_or_create_collection(
        name="sizesoft_docs",
        embedding_function=ef
    )
    return collection

def ingest():
    docs = load_documents()
    collection = get_collection()

    existing = collection.get()
    if len(existing["ids"]) > 0:
        print(f"Ya hay {len(existing['ids'])} chunks indexados, saltando ingestión.")
        return collection

    print(f"Indexando {len(docs)} chunks...")
    collection.add(
        ids=[d["id"] for d in docs],
        documents=[d["text"] for d in docs],
        metadatas=[{"source": d["source"]} for d in docs]
    )
    print("Indexación completa.")
    return collection