from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.schemas.business import BusinessProfile, BusinessUpdate, BusinessStats
from app.models.business import Business
from app.models.user import User
from app.middleware.auth import require_auth
from app.services.analytics import analytics_service

router = APIRouter(prefix="/business", tags=["Business"])


@router.get("/profile", response_model=BusinessProfile)
async def get_business_profile(
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Business).where(Business.id == user.business_id))
    business = result.scalar_one_or_none()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    return business


@router.put("/profile", response_model=BusinessProfile)
async def update_business_profile(
    data: BusinessUpdate,
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Business).where(Business.id == user.business_id))
    business = result.scalar_one_or_none()
    if not business:
        raise HTTPException(status_code=404, detail="Business not found")
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(business, field, value)
    await db.flush()
    await db.refresh(business)
    return business


@router.get("/stats", response_model=BusinessStats)
async def get_business_stats(
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    stats = await analytics_service.get_overview_stats(user.business_id, db)
    return BusinessStats(**stats)
