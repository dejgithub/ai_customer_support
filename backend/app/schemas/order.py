import uuid
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional


class OrderItemSchema(BaseModel):
    product_id: Optional[uuid.UUID] = None
    name: str
    quantity: int = 1
    unit_price: float
    total_price: Optional[float] = None
    notes: Optional[str] = None


class OrderCreate(BaseModel):
    customer_id: uuid.UUID
    items: list[OrderItemSchema]
    notes: Optional[str] = None
    currency: str = "ETB"


class OrderResponse(BaseModel):
    id: uuid.UUID
    business_id: uuid.UUID
    customer_id: uuid.UUID
    order_number: str
    status: str
    total_amount: float
    currency: str = "ETB"
    notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: list[OrderItemSchema] = []

    model_config = {"from_attributes": True}


class OrderListResponse(BaseModel):
    orders: list[OrderResponse]
    total: int
    page: int = 1
    per_page: int = 20


class StatusUpdateRequest(BaseModel):
    status: str


class ProductCreate(BaseModel):
    name: str
    price: float
    description: Optional[str] = None
    category: Optional[str] = None
    stock_quantity: int = 0
    unit: Optional[str] = None
    is_available: bool = True


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    category: Optional[str] = None
    stock_quantity: Optional[int] = None
    unit: Optional[str] = None
    is_available: Optional[bool] = None


class AssignRequest(BaseModel):
    agent_id: str
