import os
import json
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from app.core.config import settings

class VectorDBService:
    def __init__(self):
        self.model_name = "all-MiniLM-L6-v2"
        self.model = None  # Lazy load to make app startup fast
        self.index_path = os.path.join(settings.VECTOR_DB_DIR, "faiss_index.bin")
        self.metadata_path = os.path.join(settings.VECTOR_DB_DIR, "chunks_metadata.json")
        self.dimension = 384  # Dimension of all-MiniLM-L6-v2 embeddings

    def _get_model(self) -> SentenceTransformer:
        if self.model is None:
            self.model = SentenceTransformer(self.model_name)
        return self.model

    def _load_index_and_metadata(self):
        if os.path.exists(self.index_path):
            index = faiss.read_index(self.index_path)
        else:
            index = faiss.IndexFlatL2(self.dimension)
            
        if os.path.exists(self.metadata_path):
            with open(self.metadata_path, "r", encoding="utf-8") as f:
                metadata = json.load(f)
        else:
            metadata = []
            
        return index, metadata

    def _save_index_and_metadata(self, index, metadata):
        faiss.write_index(index, self.index_path)
        with open(self.metadata_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)

    def add_document(self, doc_id: int, title: str, text: str):
        """Chunks a document, computes embeddings, and indexes them in FAISS."""
        chunks = self.split_text(text)
        if not chunks:
            return
            
        model = self._get_model()
        embeddings = model.encode(chunks)
        
        index, metadata = self._load_index_and_metadata()
        start_idx = index.ntotal
        
        index.add(np.array(embeddings).astype("float32"))
        
        for i, chunk in enumerate(chunks):
            metadata.append({
                "chunk_id": start_idx + i,
                "document_id": doc_id,
                "title": title,
                "text": chunk
            })
            
        self._save_index_and_metadata(index, metadata)

    def search(self, query: str, top_k: int = 5) -> list[dict]:
        """Encodes the search query, queries FAISS, and returns matched snippets."""
        index, metadata = self._load_index_and_metadata()
        if index.ntotal == 0:
            return []
            
        model = self._get_model()
        query_embedding = model.encode([query])
        
        # Search index
        limit = min(top_k, index.ntotal)
        distances, indices = index.search(np.array(query_embedding).astype("float32"), limit)
        
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx == -1 or idx >= len(metadata):
                continue
            
            # Map squared L2 distance to a standard similarity score [0, 1]
            score = float(1.0 / (1.0 + dist))
            meta = metadata[idx]
            
            results.append({
                "document_id": meta["document_id"],
                "title": meta["title"],
                "text": meta["text"],
                "score": score
            })
            
        return results

    def split_text(self, text: str, chunk_size: int = 150, overlap: int = 30) -> list[str]:
        """Splits raw text into readable paragraphs or sentence groups."""
        paragraphs = [p.strip() for p in text.split("\n") if p.strip()]
        if not paragraphs:
            return []
            
        chunks = []
        for para in paragraphs:
            words = para.split()
            if not words:
                continue
            if len(words) <= chunk_size:
                chunks.append(para)
                continue
                
            for i in range(0, len(words), chunk_size - overlap):
                chunk = " ".join(words[i:i + chunk_size])
                if chunk:
                    chunks.append(chunk)
                if i + chunk_size >= len(words):
                    break
        return chunks

vector_db_service = VectorDBService()
