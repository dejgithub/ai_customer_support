import uuid
from datetime import datetime, date
from pydantic import BaseModel, Field
from typing import Optional


class AppointmentCreate(BaseModel):
    customer_id: uuid.UUID
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    service_name: Optional[str] = None
    notes: Optional[str] = None


class AppointmentResponse(BaseModel):
    id: uuid.UUID
    business_id: uuid.UUID
    customer_id: uuid.UUID
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    status: str
    service_name: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class SlotRequest(BaseModel):
    date: date
    service: Optional[str] = None


class SlotResponse(BaseModel):
    slots: list[dict]
    date: str
