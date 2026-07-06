import uuid
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.database import get_db
from app.schemas.order import OrderCreate, OrderResponse, OrderListResponse, OrderItemSchema, StatusUpdateRequest, ProductCreate, ProductUpdate
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User
from app.middleware.auth import require_auth

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/orders", tags=["Orders"])


def generate_order_number(business_id: uuid.UUID) -> str:
    import random
    ts = datetime.now().strftime("%y%m%d%H%M%S")
    rand = random.randint(1000, 9999)
    return f"ORD-{ts}-{rand}"


@router.post("", response_model=OrderResponse, status_code=201)
async def create_order(
    data: OrderCreate,
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    total_amount = 0
    items_list = []
    for item_data in data.items:
        total_price = item_data.quantity * item_data.unit_price
        total_amount += total_price
        items_list.append({
            "product_id": item_data.product_id,
            "name": item_data.name,
            "quantity": item_data.quantity,
            "unit_price": item_data.unit_price,
            "total_price": total_price,
            "notes": item_data.notes,
        })

    order = Order(
        business_id=user.business_id,
        customer_id=data.customer_id,
        order_number=generate_order_number(user.business_id),
        status="draft",
        total_amount=total_amount,
        currency=data.currency,
        notes=data.notes,
    )
    db.add(order)
    await db.flush()

    for item_dict in items_list:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item_dict["product_id"],
            name=item_dict["name"],
            quantity=item_dict["quantity"],
            unit_price=item_dict["unit_price"],
            total_price=item_dict["total_price"],
            notes=item_dict.get("notes"),
        )
        db.add(order_item)

    await db.flush()
    await db.refresh(order)
    return order


@router.get("", response_model=OrderListResponse)
async def list_orders(
    status: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    query = select(Order).where(Order.business_id == user.business_id)
    count_query = select(Order.id).where(Order.business_id == user.business_id)
    if status:
        query = query.where(Order.status == status)
        count_query = count_query.where(Order.status == status)
    total_result = await db.execute(count_query)
    total = len(total_result.scalars().all())
    query = query.order_by(Order.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    orders = result.scalars().all()
    return OrderListResponse(
        orders=[OrderResponse.model_validate(o) for o in orders],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Order).where(
            and_(
                Order.id == uuid.UUID(order_id),
                Order.business_id == user.business_id,
            )
        )
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    items_result = await db.execute(
        select(OrderItem).where(OrderItem.order_id == order.id)
    )
    order.items = items_result.scalars().all()
    return order


@router.put("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: str,
    data: StatusUpdateRequest,
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Order).where(
            and_(
                Order.id == uuid.UUID(order_id),
                Order.business_id == user.business_id,
            )
        )
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = data.status
    await db.flush()
    await db.refresh(order)
    items_result = await db.execute(
        select(OrderItem).where(OrderItem.order_id == order.id)
    )
    order.items = items_result.scalars().all()
    return order


@router.get("/{order_id}/invoice")
async def generate_invoice(
    order_id: str,
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Order).where(
            and_(
                Order.id == uuid.UUID(order_id),
                Order.business_id == user.business_id,
            )
        )
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    items_result = await db.execute(
        select(OrderItem).where(OrderItem.order_id == order.id)
    )
    items = items_result.scalars().all()

    invoice = {
        "order_number": order.order_number,
        "status": order.status,
        "total_amount": float(order.total_amount),
        "currency": order.currency,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "items": [
            {
                "name": item.name,
                "quantity": item.quantity,
                "unit_price": float(item.unit_price),
                "total_price": float(item.total_price),
            }
            for item in items
        ],
    }
    return invoice


router_products = APIRouter(tags=["Products"])


@router_products.get("")
async def list_products(
    category: str = Query(None),
    available: bool = Query(None),
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    query = select(Product).where(Product.business_id == user.business_id)
    if category:
        query = query.where(Product.category == category)
    if available is not None:
        query = query.where(Product.is_available == available)
    query = query.order_by(Product.name)
    result = await db.execute(query)
    products = result.scalars().all()
    return {"products": [{
        "id": str(p.id),
        "name": p.name,
        "description": p.description,
        "price": float(p.price),
        "currency": p.currency,
        "category": p.category,
        "is_available": p.is_available,
        "stock_quantity": p.stock_quantity,
        "unit": p.unit,
        "created_at": p.created_at.isoformat() if p.created_at else None,
    } for p in products], "total": len(products)}


@router_products.post("", status_code=201)
async def create_product(
    data: ProductCreate,
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    product = Product(
        business_id=user.business_id,
        name=data.name,
        description=data.description,
        price=data.price,
        category=data.category,
        stock_quantity=data.stock_quantity,
        unit=data.unit,
        is_available=data.is_available,
    )
    db.add(product)
    await db.flush()
    await db.refresh(product)
    return {
        "id": str(product.id),
        "name": product.name,
        "price": float(product.price),
        "message": "Product created successfully",
    }


@router_products.put("/{product_id}")
async def update_product(
    product_id: str,
    data: ProductUpdate,
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Product).where(
            and_(
                Product.id == uuid.UUID(product_id),
                Product.business_id == user.business_id,
            )
        )
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if data.name is not None:
        product.name = data.name
    if data.price is not None:
        product.price = data.price
    if data.description is not None:
        product.description = data.description
    if data.category is not None:
        product.category = data.category
    if data.is_available is not None:
        product.is_available = data.is_available
    if data.stock_quantity is not None:
        product.stock_quantity = data.stock_quantity
    if data.unit is not None:
        product.unit = data.unit
    await db.flush()
    await db.refresh(product)
    return {"id": str(product.id), "name": product.name, "message": "Product updated successfully"}
