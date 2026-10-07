from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.core.database import get_db
from app.core.security import get_current_user_optional
from app.services.verification import record_user_report

router = APIRouter(prefix="/reports", tags=["Opportunity Reports"])

class ReportRequest(BaseModel):
    opportunity_id: str
    reason: str
    details: str

@router.post("")
async def submit_report(body: ReportRequest, current_user=Depends(get_current_user_optional), db=Depends(get_db)):
    user_id = current_user["id"] if current_user else "anonymous"
    report = await record_user_report(db, user_id, body.opportunity_id, body.reason, body.details)
    return {
        "status": "success",
        "message": "Thank you for helping keep OpportunityAI safe and accurate. Our verification team will review this listing.",
        "report_id": report["id"]
    }
