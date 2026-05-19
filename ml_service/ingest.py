import os
import chromadb
from chromadb.utils import embedding_functions

DOCS_PATH = "./docs"
CHROMA_PATH = "./chroma_db"

def load_documents(chunk_size=600, overlap=100):
    docs = []
    for filename in os.listdir(DOCS_PATH):
        if filename.endswith(".md"):
            with open(os.path.join(DOCS_PATH, filename), "r", encoding="utf-8") as f:
                content = f.read()

            # Chunking por caracteres con solapamiento
            # en lugar de split por \n\n
            start = 0
            chunk_index = 0
            while start < len(content):
                end = start + chunk_size
                chunk = content[start:end].strip()
                if chunk:
                    docs.append({
                        "id": f"{filename}_{chunk_index}",
                        "text": chunk,
                        "source": filename
                    })
                    chunk_index += 1
                start += chunk_size - overlap  # solapamiento para no perder contexto

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

def ingest(force=False):
    docs = load_documents()
    
    client = chromadb.PersistentClient(path=CHROMA_PATH)
    ef = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="paraphrase-multilingual-MiniLM-L12-v2"
    )

    # Borra y re-crea la colección si force=True
    # o si los IDs del disco no coinciden con los actuales
    existing_names = [c.name for c in client.list_collections()]
    current_ids = set(d["id"] for d in docs)

    collection = client.get_or_create_collection(
        name="sizesoft_docs",
        embedding_function=ef
    )

    existing = collection.get()
    existing_ids = set(existing["ids"])

    if not force and existing_ids == current_ids:
        print(f"✓ {len(existing_ids)} chunks ya indexados y vigentes.")
        return collection

    # Re-indexar
    print("Re-indexando documentos...")
    if existing_ids:
        collection.delete(ids=list(existing_ids))

    collection.add(
        ids=[d["id"] for d in docs],
        documents=[d["text"] for d in docs],
        metadatas=[{"source": d["source"]} for d in docs]
    )
    print(f"✓ {len(docs)} chunks indexados.")
    return collection