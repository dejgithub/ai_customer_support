from pydantic import BaseModel
from typing import Optional


class OverviewStats(BaseModel):
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


class ConversationAnalytics(BaseModel):
    total: int = 0
    by_channel: dict = {}
    by_status: dict = {}
    by_language: dict = {}
    trend: list = []


class SatisfactionAnalytics(BaseModel):
    overall_score: float = 0
    total_ratings: int = 0
    distribution: dict = {}
    trend: list = []


class TopicAnalytics(BaseModel):
    topics: list[dict] = []
    total_queries: int = 0
