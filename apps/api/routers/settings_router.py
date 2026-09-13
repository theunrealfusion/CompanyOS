from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, Optional
from infrastructure.mongodb.client import get_database

router = APIRouter(prefix="/api/v1/settings", tags=["settings"])

class ModelSettingsPayload(BaseModel):
    default_provider: str = "OpenAI"
    default_model: str = "gpt-4o"
    temperature: float = 0.7
    max_tokens: int = 4096
    governance_threshold: int = 80
    escalation_channel: str = "telegram"
    auto_resolve_frictions: bool = False
    telegram_bot_token: Optional[str] = None
    telegram_chat_id: Optional[str] = None

@router.get("/{org_id}")
async def get_settings(org_id: str):
    db = get_database()
    settings = await db.settings.find_one({"organization_id": org_id})
    if not settings:
        # Return defaults
        return {
            "organization_id": org_id,
            "default_provider": "OpenAI",
            "default_model": "gpt-4o",
            "temperature": 0.7,
            "max_tokens": 4096,
            "governance_threshold": 80,
            "escalation_channel": "telegram",
            "auto_resolve_frictions": False,
            "telegram_bot_token": "",
            "telegram_chat_id": ""
        }
    if "_id" in settings:
        del settings["_id"]
    return settings

@router.post("/{org_id}")
async def save_settings(org_id: str, payload: ModelSettingsPayload):
    db = get_database()
    data = payload.model_dump()
    data["organization_id"] = org_id
    await db.settings.update_one(
        {"organization_id": org_id},
        {"$set": data},
        upsert=True
    )
    return {"status": "saved", "settings": data}
