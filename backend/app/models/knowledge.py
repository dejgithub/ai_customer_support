import uuid
from datetime import datetime
from sqlalchemy import String, Text, Integer, DateTime, ForeignKey, func

from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    business_id: Mapped[str] = mapped_column(String(36), ForeignKey("businesses.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    file_type: Mapped[str] = mapped_column(String(50), nullable=False)
    file_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    meta_data: Mapped[str | None] = mapped_column(Text, nullable=True, default=None)
    chunk_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), onupdate=func.now())

    business = relationship("Business", back_populates="knowledge_documents")
    chunks = relationship("KnowledgeChunk", back_populates="document", cascade="all, delete-orphan")


class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id: Mapped[str] = mapped_column(String(36), ForeignKey("knowledge_documents.id"), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    embedding: Mapped[str | None] = mapped_column(Text, nullable=True)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    meta_data: Mapped[str | None] = mapped_column(Text, nullable=True, default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    document = relationship("KnowledgeDocument", back_populates="chunks")
