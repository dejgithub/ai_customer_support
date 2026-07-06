import json
import logging
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


@router.post("/whatsapp")
async def whatsapp_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    try:
        body = await request.json()
        logger.info(f"WhatsApp webhook received: {json.dumps(body)[:200]}")
        return {"status": "received", "channel": "whatsapp"}
    except Exception as e:
        logger.error(f"WhatsApp webhook error: {e}")
        raise HTTPException(status_code=400, detail="Invalid webhook payload")


@router.get("/whatsapp")
async def whatsapp_webhook_verify(request: Request):
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")
    if mode == "subscribe" and token == "smartsupport-verify-token":
        return int(challenge)
    raise HTTPException(status_code=403, detail="Verification failed")


@router.post("/telegram")
async def telegram_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    try:
        body = await request.json()
        logger.info(f"Telegram webhook received: {json.dumps(body)[:200]}")
        return {"status": "received", "channel": "telegram"}
    except Exception as e:
        logger.error(f"Telegram webhook error: {e}")
        raise HTTPException(status_code=400, detail="Invalid webhook payload")


@router.post("/messenger")
async def messenger_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    try:
        body = await request.json()
        logger.info(f"Messenger webhook received: {json.dumps(body)[:200]}")
        return {"status": "received", "channel": "messenger"}
    except Exception as e:
        logger.error(f"Messenger webhook error: {e}")
        raise HTTPException(status_code=400, detail="Invalid webhook payload")


@router.get("/messenger")
async def messenger_webhook_verify(request: Request):
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")
    if mode == "subscribe" and token == "smartsupport-verify-token":
        return int(challenge)
    raise HTTPException(status_code=403, detail="Verification failed")
