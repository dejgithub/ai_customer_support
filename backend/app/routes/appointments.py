import uuid
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.database import get_db
from app.schemas.appointment import AppointmentCreate, AppointmentResponse, SlotRequest, SlotResponse
from app.models.appointment import Appointment
from app.models.user import User
from app.middleware.auth import require_auth

router = APIRouter(prefix="/appointments", tags=["Appointments"])


@router.post("/slots", response_model=SlotResponse)
async def get_available_slots(
    data: SlotRequest,
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    start_of_day = datetime.combine(data.date, datetime.min.time(), tzinfo=timezone.utc)
    end_of_day = start_of_day + timedelta(days=1)

    existing = await db.execute(
        select(Appointment).where(
            and_(
                Appointment.business_id == user.business_id,
                Appointment.start_time >= start_of_day,
                Appointment.start_time < end_of_day,
                Appointment.status.in_(["scheduled", "confirmed"]),
            )
        )
    )
    booked = existing.scalars().all()
    booked_times = {(a.start_time.hour, a.start_time.minute) for a in booked}

    slots = []
    for hour in range(8, 18):
        for minute in (0, 30):
            if (hour, minute) not in booked_times:
                slot_time = start_of_day.replace(hour=hour, minute=minute)
                if slot_time > datetime.now(timezone.utc):
                    slots.append({
                        "time": slot_time.isoformat(),
                        "available": True,
                        "label": f"{hour:02d}:{minute:02d}",
                    })

    return SlotResponse(slots=slots, date=data.date.isoformat())


@router.post("", response_model=AppointmentResponse, status_code=201)
async def create_appointment(
    data: AppointmentCreate,
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    appointment = Appointment(
        business_id=user.business_id,
        customer_id=data.customer_id,
        title=data.title,
        description=data.description,
        start_time=data.start_time,
        end_time=data.end_time,
        service_name=data.service_name,
        notes=data.notes,
    )
    db.add(appointment)
    await db.flush()
    await db.refresh(appointment)
    return appointment


@router.get("")
async def list_appointments(
    status: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    query = select(Appointment).where(Appointment.business_id == user.business_id)
    if status:
        query = query.where(Appointment.status == status)
    query = query.order_by(Appointment.start_time.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    appointments = result.scalars().all()
    return {
        "appointments": [AppointmentResponse.model_validate(a) for a in appointments],
        "page": page,
        "per_page": per_page,
    }


@router.put("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    appointment_id: str,
    status: str,
    notes: str = None,
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Appointment).where(
            and_(
                Appointment.id == uuid.UUID(appointment_id),
                Appointment.business_id == user.business_id,
            )
        )
    )
    appointment = result.scalar_one_or_none()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    if status:
        appointment.status = status
    if notes:
        appointment.notes = notes
    await db.flush()
    await db.refresh(appointment)
    return appointment
