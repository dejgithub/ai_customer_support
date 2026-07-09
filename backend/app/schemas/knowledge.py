import uuid
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional


class DocumentUploadResponse(BaseModel):
    id: uuid.UUID
    title: str
    file_type: str
    chunk_count: int = 0
    message: str = "Document uploaded successfully"


class DocumentResponse(BaseModel):
    id: uuid.UUID
    business_id: uuid.UUID
    title: str
    file_type: str
    file_url: Optional[str] = None
    content: Optional[str] = None
    meta_data: Optional[str] = None
    chunk_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class DocumentListResponse(BaseModel):
    documents: list[DocumentResponse]
    total: int


class SearchQuery(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000)
    top_k: int = 5


class SearchResponse(BaseModel):
    results: list[dict]
    query: str
    total: int
