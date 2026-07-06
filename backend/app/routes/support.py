import uuid
import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.database import get_db
from app.schemas.conversation import ChatRequest, ChatResponse, ConversationResponse, MessageResponse
from app.schemas.order import AssignRequest
from app.models.conversation import Conversation, Message
from app.models.customer import Customer
from app.models.user import User
from app.middleware.auth import require_auth
from app.services.gemini import gemini_service
from app.services.rag import rag_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/support", tags=["AI Support"])


@router.post("/chat", response_model=ChatResponse)
async def chat(
    data: ChatRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    try:
        business_id = None
        language = data.language or "en"

        if data.conversation_id:
            conv_result = await db.execute(
                select(Conversation).where(Conversation.id == uuid.UUID(data.conversation_id))
            )
            conversation = conv_result.scalar_one_or_none()
            if not conversation:
                raise HTTPException(status_code=404, detail="Conversation not found")
            business_id = conversation.business_id
        else:
            customer = Customer(
                business_id=None,
                name=data.customer_name or "Guest",
                email=data.customer_email,
                phone=data.customer_phone,
                source="web",
            )
            db.add(customer)
            await db.flush()

            conversation = Conversation(
                business_id=None,
                customer_id=customer.id,
                channel="web",
                status="active",
                language=language,
                started_at=datetime.now(timezone.utc),
            )
            db.add(conversation)
            await db.flush()

        customer_msg = Message(
            conversation_id=conversation.id,
            sender_type="customer",
            sender_id=data.customer_name or "guest",
            content=data.message,
            content_type="text",
        )
        db.add(customer_msg)
        await db.flush()

        detected_lang = gemini_service.detect_language(data.message)
        conversation.language = detected_lang

        context = []
        if business_id:
            context_str = await rag_service.get_relevant_context(data.message, business_id, db)
            if context_str:
                context.append(context_str)

        history_result = await db.execute(
            select(Message)
            .where(Message.conversation_id == conversation.id)
            .order_by(Message.created_at.desc())
            .limit(10)
        )
        history_messages = history_result.scalars().all()
        history_context = [
            {"sender_type": m.sender_type, "content": m.content}
            for m in reversed(history_messages)
        ]

        ai_response = gemini_service.generate_response(
            prompt=data.message,
            context=context,
            language=detected_lang,
        )

        intent = gemini_service.classify_intent(data.message)

        suggested_actions = []
        if intent.get("intent") == "booking":
            suggested_actions.append("book_appointment")
        elif intent.get("intent") == "order":
            suggested_actions.append("view_products")
        elif intent.get("intent") == "complaint":
            suggested_actions.append("create_ticket")
            suggested_actions.append("escalate")

        ai_msg = Message(
            conversation_id=conversation.id,
            sender_type="ai",
            sender_id="smartsupport-ai",
            content=ai_response,
            content_type="text",
            metadata={"intent": intent, "language": detected_lang},
        )
        db.add(ai_msg)
        await db.flush()

        return ChatResponse(
            message=ai_response,
            conversation_id=str(conversation.id),
            suggested_actions=suggested_actions,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Chat error: {e}", exc_info=True)
        return ChatResponse(
            message="I'm sorry, I encountered an error. Please try again.",
            conversation_id=data.conversation_id or "",
            suggested_actions=[],
        )


@router.get("/conversations")
async def list_conversations(
    status: str = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    query = select(Conversation).where(Conversation.business_id == user.business_id)
    if status:
        query = query.where(Conversation.status == status)
    query = query.order_by(Conversation.created_at.desc()).offset((page - 1) * per_page).limit(per_page)
    result = await db.execute(query)
    conversations = result.scalars().all()
    return {
        "conversations": [ConversationResponse.model_validate(c) for c in conversations],
        "page": page,
        "per_page": per_page,
    }


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: str,
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conversation).where(
            and_(
                Conversation.id == uuid.UUID(conversation_id),
                Conversation.business_id == user.business_id,
            )
        )
    )
    conversation = result.scalar_one_or_none()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    messages_result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation.id)
        .order_by(Message.created_at)
    )
    conversation.messages = messages_result.scalars().all()
    return conversation


@router.post("/conversations/{conversation_id}/escalate")
async def escalate_conversation(
    conversation_id: str,
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conversation).where(
            and_(
                Conversation.id == uuid.UUID(conversation_id),
                Conversation.business_id == user.business_id,
            )
        )
    )
    conversation = result.scalar_one_or_none()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    conversation.is_escalated = True
    conversation.status = "escalated"
    msg = Message(
        conversation_id=conversation.id,
        sender_type="system",
        sender_id="system",
        content="Conversation escalated to human agent",
        content_type="text",
    )
    db.add(msg)
    await db.flush()
    return {"message": "Conversation escalated", "conversation_id": conversation_id}


@router.post("/conversations/{conversation_id}/assign")
async def assign_conversation(
    conversation_id: str,
    data: AssignRequest,
    user: User = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conversation).where(
            and_(
                Conversation.id == uuid.UUID(conversation_id),
                Conversation.business_id == user.business_id,
            )
        )
    )
    conversation = result.scalar_one_or_none()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    agent_result = await db.execute(
        select(User).where(
            and_(
                User.id == uuid.UUID(data.agent_id),
                User.business_id == user.business_id,
            )
        )
    )
    agent = agent_result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    conversation.assigned_to = agent.id
    await db.flush()
    return {"message": f"Conversation assigned to {agent.full_name}", "conversation_id": conversation_id}


@router.get("/widget-config")
async def get_widget_config(user: User = Depends(require_auth)):
    return {
        "primary_color": "#4F46E5",
        "position": "right",
        "title": "SmartSupport AI",
        "subtitle": "How can we help you?",
        "input_placeholder": "Type your message here...",
        "show_emoji": True,
        "business_id": str(user.business_id),
    }
