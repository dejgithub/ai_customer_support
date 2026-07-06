from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.middleware.auth import require_auth
from app.services.analytics import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview")
async def get_overview(
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    stats = await analytics_service.get_overview_stats(user.business_id, db)
    return stats


@router.get("/conversations")
async def get_conversation_analytics(
    period: str = Query("7d", regex="^(7d|30d|90d)$"),
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    return await analytics_service.get_conversation_analytics(user.business_id, db, period)


@router.get("/satisfaction")
async def get_satisfaction(
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    return await analytics_service.get_satisfaction_analytics(user.business_id, db)


@router.get("/topics")
async def get_topics(
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    return await analytics_service.get_topic_analytics(user.business_id, db)


@router.get("/opportunities")
async def get_opportunities(
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    return await analytics_service.get_revenue_opportunities(user.business_id, db)
