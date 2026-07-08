import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime, ForeignKey, func

from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    business_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("businesses.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    source: Mapped[str] = mapped_column(String(50), nullable=False, default="chat")
    meta_data: Mapped[str | None] = mapped_column(Text, nullable=True, default=None)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), onupdate=func.now())

    business = relationship("Business", back_populates="customers")
    conversations = relationship("Conversation", back_populates="customer", cascade="all, delete-orphan")
    tickets = relationship("Ticket", back_populates="customer", cascade="all, delete-orphan")
    appointments = relationship("Appointment", back_populates="customer", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="customer", cascade="all, delete-orphan")
