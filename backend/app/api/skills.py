from fastapi import APIRouter, Depends
from app.core.database import get_db
from app.core.security import get_current_user_optional
from app.schemas.user import StudentProfile
from app.schemas.analytics import SkillGapReport
from app.services.skill_gap import analyze_skill_gap

router = APIRouter(prefix="/skills", tags=["Skill Gap Analysis"])

@router.get("/analysis", response_model=SkillGapReport)
async def get_skill_analysis(current_user=Depends(get_current_user_optional), db=Depends(get_db)):
    if current_user and "profile" in current_user:
        profile = StudentProfile(**current_user["profile"])
    else:
        profile = StudentProfile()

    all_opps = await db.opportunities.find({"opportunity_status": {"$ne": "Expired"}}).to_list(500)
    report = analyze_skill_gap(profile, all_opps)
    return SkillGapReport(**report)
