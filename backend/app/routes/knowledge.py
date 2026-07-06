import uuid
import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.database import get_db
from app.schemas.knowledge import (
    DocumentUploadResponse,
    DocumentResponse,
    DocumentListResponse,
    SearchQuery,
    SearchResponse,
)
from app.models.knowledge import KnowledgeDocument, KnowledgeChunk
from app.models.user import User
from app.middleware.auth import require_auth
from app.services.rag import rag_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/knowledge", tags=["Knowledge Base"])


@router.post("/upload", response_model=DocumentUploadResponse, status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(None),
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    try:
        content = await file.read()
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="File too large. Maximum size is 10MB.")

        doc_title = title or file.filename or "Untitled"
        file_type = file.filename.rsplit(".", 1)[-1].lower() if file.filename else "txt"

        processed = await rag_service.process_uploaded_file(content, file.filename or "document.txt")

        document = KnowledgeDocument(
            business_id=user.business_id,
            title=doc_title,
            file_type=file_type,
            content=processed["text"],
            metadata={"original_filename": file.filename, "file_size": len(content)},
        )
        db.add(document)
        await db.flush()

        chunks = rag_service.chunk_document(processed["text"])
        embeddings = rag_service.create_embeddings(chunks)
        await rag_service.store_document_chunks(db, document.id, chunks, embeddings)

        document.chunk_count = len(chunks)
        await db.flush()
        await db.refresh(document)

        return DocumentUploadResponse(
            id=document.id,
            title=document.title,
            file_type=document.file_type,
            chunk_count=document.chunk_count,
            message="Document uploaded and processed successfully",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Document upload error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")


@router.get("/documents", response_model=DocumentListResponse)
async def list_documents(
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(KnowledgeDocument)
        .where(KnowledgeDocument.business_id == user.business_id)
        .order_by(KnowledgeDocument.created_at.desc())
    )
    documents = result.scalars().all()
    return DocumentListResponse(
        documents=[DocumentResponse.model_validate(d) for d in documents],
        total=len(documents),
    )


@router.get("/documents/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: str,
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(KnowledgeDocument).where(
            and_(
                KnowledgeDocument.id == uuid.UUID(document_id),
                KnowledgeDocument.business_id == user.business_id,
            )
        )
    )
    document = result.scalar_one_or_none()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document


@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: str,
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(KnowledgeDocument).where(
            and_(
                KnowledgeDocument.id == uuid.UUID(document_id),
                KnowledgeDocument.business_id == user.business_id,
            )
        )
    )
    document = result.scalar_one_or_none()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    await db.delete(document)
    await db.flush()
    return {"message": "Document deleted successfully"}


@router.post("/search", response_model=SearchResponse)
async def search_knowledge(
    data: SearchQuery,
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    results = await rag_service.search_similar(data.query, user.business_id, db, top_k=data.top_k)
    return SearchResponse(
        results=results,
        query=data.query,
        total=len(results),
    )
