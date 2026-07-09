import uuid
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender_type: str
    sender_id: Optional[str] = None
    content: str
    content_type: str = "text"
    meta_data: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationResponse(BaseModel):
    id: str
    business_id: str
    customer_id: str
    customer_name: Optional[str] = None
    channel: str = "web"
    status: str = "active"
    language: str = "en"
    is_escalated: bool = False
    assigned_to: Optional[str] = None
    meta_data: Optional[str] = None
    last_message: Optional[str] = None
    message_count: int = 0
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    created_at: datetime
    messages: list[MessageResponse] = []

    model_config = {"from_attributes": True}


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=5000)
    conversation_id: Optional[str] = None
    business_id: Optional[str] = None
    language: str = "en"
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None


class ChatResponse(BaseModel):
    message: MessageResponse
    conversation_id: str
    suggested_actions: list[str] = []
