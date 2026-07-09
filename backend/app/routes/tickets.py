import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.database import get_db
from app.schemas.ticket import TicketCreate, TicketUpdate, TicketResponse, TicketListResponse
from app.models.ticket import Ticket
from app.models.conversation import Message
from app.models.user import User
from app.middleware.auth import require_auth

router = APIRouter(prefix="/tickets", tags=["Tickets"])


@router.post("", response_model=TicketResponse, status_code=201)
async def create_ticket(
    data: TicketCreate,
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    ticket = Ticket(
        business_id=user.business_id,
        customer_id=data.customer_id,
        subject=data.subject,
        description=data.description,
        priority=data.priority,
        category=data.category,
    )
    db.add(ticket)
    await db.flush()
    await db.refresh(ticket)
    return ticket


@router.get("", response_model=TicketListResponse)
async def list_tickets(
    status: str = Query(None),
    priority: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    query = select(Ticket).where(Ticket.business_id == user.business_id)
    if status:
        query = query.where(Ticket.status == status)
    if priority:
        query = query.where(Ticket.priority == priority)
    count_query = select(Ticket.id).where(Ticket.business_id == user.business_id)
    if status:
        count_query = count_query.where(Ticket.status == status)
    if priority:
        count_query = count_query.where(Ticket.priority == priority)
    total_result = await db.execute(count_query)
    total = len(total_result.scalars().all())

    query = query.order_by(Ticket.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    tickets = result.scalars().all()
    return TicketListResponse(
        tickets=[TicketResponse.model_validate(t) for t in tickets],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_ticket(
    ticket_id: str,
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Ticket).where(
            and_(
                Ticket.id == uuid.UUID(ticket_id),
                Ticket.business_id == user.business_id,
            )
        )
    )
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


@router.put("/{ticket_id}", response_model=TicketResponse)
async def update_ticket(
    ticket_id: str,
    data: TicketUpdate,
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Ticket).where(
            and_(
                Ticket.id == uuid.UUID(ticket_id),
                Ticket.business_id == user.business_id,
            )
        )
    )
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(ticket, field, value)
    await db.flush()
    await db.refresh(ticket)
    return ticket


@router.post("/{ticket_id}/messages")
async def add_ticket_message(
    ticket_id: str,
    content: str,
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Ticket).where(
            and_(
                Ticket.id == uuid.UUID(ticket_id),
                Ticket.business_id == user.business_id,
            )
        )
    )
    ticket = result.scalar_one_or_none()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    msg = Message(
        conversation_id=ticket.conversation_id or str(uuid.uuid4()),
        sender_type="agent",
        sender_id=str(user.id),
        content=content,
        content_type="text",
    )
    db.add(msg)
    await db.flush()
    return {"message": "Message added", "ticket_id": ticket_id}
