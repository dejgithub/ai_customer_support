import uuid
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional


class TicketCreate(BaseModel):
    customer_id: uuid.UUID
    subject: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    priority: str = "medium"
    category: Optional[str] = None


class TicketUpdate(BaseModel):
    subject: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    category: Optional[str] = None
    assigned_to: Optional[uuid.UUID] = None


class TicketResponse(BaseModel):
    id: uuid.UUID
    business_id: uuid.UUID
    customer_id: uuid.UUID
    conversation_id: Optional[uuid.UUID] = None
    subject: str
    description: Optional[str] = None
    priority: str
    status: str
    category: Optional[str] = None
    assigned_to: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class TicketListResponse(BaseModel):
    tickets: list[TicketResponse]
    total: int
    page: int = 1
    per_page: int = 20
