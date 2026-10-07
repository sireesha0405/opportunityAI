from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.core.database import get_db
from app.core.security import get_current_user_optional
from app.schemas.user import StudentProfile
from app.services.assistant import generate_assistant_response

router = APIRouter(prefix="/assistant", tags=["Daily Career Assistant"])

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    source: str
    related_opportunities: List[str]

@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(
    body: ChatRequest,
    current_user=Depends(get_current_user_optional),
    db=Depends(get_db)
):
    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    if current_user and "profile" in current_user:
        profile = StudentProfile(**current_user["profile"])
        user_id = current_user["id"]
        apps = await db.applications.find({"user_id": user_id}).to_list(50)
        saved = await db.saved_opportunities.find({"user_id": user_id}).to_list(50)
    else:
        profile = StudentProfile()
        apps = []
        saved = []

    all_opps = await db.opportunities.find({"opportunity_status": {"$ne": "Expired"}}).to_list(100)
    result = await generate_assistant_response(
        query=body.message,
        profile=profile,
        opportunities=all_opps,
        applications=apps,
        saved_opportunities=saved
    )
    return ChatResponse(**result)
