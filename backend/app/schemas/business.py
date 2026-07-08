import uuid
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional


class BusinessProfile(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    timezone: str = "UTC"
    subscription_tier: str = "free"
    subscription_status: str = "active"
    is_active: bool = True
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class BusinessUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    timezone: Optional[str] = None


class BusinessStats(BaseModel):
    total_customers: int = 0
    total_conversations: int = 0
    active_conversations: int = 0
    total_tickets: int = 0
    open_tickets: int = 0
    total_appointments: int = 0
    upcoming_appointments: int = 0
    total_orders: int = 0
    total_revenue: float = 0
    satisfaction_score: float = 0
    escalation_rate: float = 0
    avg_response_time: float = 0
