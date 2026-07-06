import uuid
import logging
import math
from typing import Optional
from sqlalchemy import select, TextClause
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from app.models.knowledge import KnowledgeDocument, KnowledgeChunk
from app.services.gemini import gemini_service

logger = logging.getLogger(__name__)


def cosine_similarity(a: list[float], b: list[float]) -> float:
    if len(a) != len(b):
        return 0.0
    dot_product = sum(ai * bi for ai, bi in zip(a, b))
    norm_a = math.sqrt(sum(ai * ai for ai in a))
    norm_b = math.sqrt(sum(bi * bi for bi in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot_product / (norm_a * norm_b)


class RAGService:
    def __init__(self):
        self.chunk_size = 500
        self.chunk_overlap = 50

    def chunk_document(self, text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
        if not text:
            return []
        chunks = []
        start = 0
        text_len = len(text)
        while start < text_len:
            end = min(start + chunk_size, text_len)
            if end < text_len:
                last_period = text.rfind(".", start, end)
                last_newline = text.rfind("\n", start, end)
                split_at = max(last_period, last_newline)
                if split_at > start:
                    end = split_at + 1
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            start = end - overlap
            if start >= text_len:
                break
        return chunks

    def create_embeddings(self, chunks: list[str]) -> list[list[float]]:
        embeddings = []
        for chunk in chunks:
            try:
                embedding = gemini_service.generate_embedding(chunk)
                embeddings.append(embedding)
            except Exception as e:
                logger.error(f"Embedding error for chunk: {e}")
                embeddings.append([0.0] * 768)
        return embeddings

    async def store_document_chunks(
        self,
        db: AsyncSession,
        document_id: uuid.UUID,
        chunks: list[str],
        embeddings: list[list[float]],
    ) -> None:
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            db_chunk = KnowledgeChunk(
                document_id=document_id,
                content=chunk,
                embedding=str(embedding),
                chunk_index=i,
            )
            db.add(db_chunk)
        await db.flush()

    async def search_similar(
        self,
        query: str,
        business_id: uuid.UUID,
        db: AsyncSession,
        top_k: int = 5,
    ) -> list[dict]:
        query_embedding = gemini_service.generate_embedding(query)
        if not query_embedding or all(v == 0.0 for v in query_embedding):
            return []

        result = await db.execute(
            select(KnowledgeChunk)
            .join(KnowledgeDocument)
            .where(KnowledgeDocument.business_id == business_id)
        )
        chunks = result.scalars().all()

        scored = []
        for chunk in chunks:
            try:
                import ast
                chunk_embedding = ast.literal_eval(chunk.embedding) if chunk.embedding else []
            except Exception:
                chunk_embedding = []
            if chunk_embedding:
                score = cosine_similarity(query_embedding, chunk_embedding)
                scored.append({
                    "chunk_id": str(chunk.id),
                    "document_id": str(chunk.document_id),
                    "content": chunk.content,
                    "score": score,
                    "chunk_index": chunk.chunk_index,
                })

        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored[:top_k]

    async def get_relevant_context(
        self,
        query: str,
        business_id: uuid.UUID,
        db: AsyncSession,
    ) -> str:
        results = await self.search_similar(query, business_id, db, top_k=5)
        if not results:
            return ""
        context_parts = []
        for r in results:
            if r["score"] > 0.3:
                context_parts.append(r["content"])
        return "\n\n".join(context_parts)

    async def process_uploaded_file(self, file_content: bytes, filename: str) -> dict:
        ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else "txt"
        text = ""

        if ext == "txt":
            text = file_content.decode("utf-8", errors="replace")
        elif ext == "pdf":
            try:
                import io
                import PyPDF2
                pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
                text = "\n".join([page.extract_text() for page in pdf_reader.pages])
            except ImportError:
                text = "[PDF parsing requires PyPDF2 library. Raw content unavailable.]"
            except Exception as e:
                logger.error(f"PDF parsing error: {e}")
                text = "[Error parsing PDF file]"
        elif ext == "docx":
            try:
                import io
                import docx
                doc = docx.Document(io.BytesIO(file_content))
                text = "\n".join([p.text for p in doc.paragraphs])
            except ImportError:
                text = "[DOCX parsing requires python-docx library. Raw content unavailable.]"
            except Exception as e:
                logger.error(f"DOCX parsing error: {e}")
                text = "[Error parsing DOCX file]"
        else:
            text = file_content.decode("utf-8", errors="replace")

        return {
            "text": text,
            "file_type": ext,
            "filename": filename,
        }


rag_service = RAGService()
