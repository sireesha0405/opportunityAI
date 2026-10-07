from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.user import StudentProfile
from app.schemas.opportunity import OpportunityRecommendation
from app.schemas.analytics import ActionItem
from app.services.recommendation import compute_opportunity_score
from app.seeds.sample_opportunities import SAMPLE_OPPORTUNITIES

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("", response_model=List[OpportunityRecommendation])
async def get_top_recommendations(current_user=Depends(get_current_user), db=Depends(get_db)):
    profile = StudentProfile(**current_user.get("profile", {}))
    user_id = current_user["id"]
    
    # Check if DB has opportunities, seed if needed
    if await db.opportunities.count_documents({}) == 0:
        for opp in SAMPLE_OPPORTUNITIES:
            await db.opportunities.update_one({"id": opp["id"]}, {"$set": opp}, upsert=True)

    saved_docs = await db.saved_opportunities.find({"user_id": user_id}).to_list(100)
    saved_ids = {s["opportunity_id"] for s in saved_docs}
    app_docs = await db.applications.find({"user_id": user_id}).to_list(100)
    app_status_map = {a["opportunity_id"]: a["status"] for a in app_docs}

    all_opps = await db.opportunities.find({"opportunity_status": {"$ne": "Expired"}}).to_list(500)
    scored_opps = []

    for opp in all_opps:
        scored = compute_opportunity_score(profile, opp)
        opp_id = opp["id"]
        scored_opps.append(
            OpportunityRecommendation(
                **opp,
                match_score=scored["match_score"],
                skills_match_score=scored["skills_match_score"],
                eligibility_status=scored["eligibility_status"],
                eligibility_reasons=scored["eligibility_reasons"],
                matched_skills=scored["matched_skills"],
                missing_skills=scored["missing_skills"],
                reasons=scored["reasons"],
                recommended_next_action=scored["recommended_next_action"],
                days_remaining=scored["days_remaining"],
                deadline_urgency=scored["deadline_urgency"],
                is_saved=opp_id in saved_ids,
                is_applied=opp_id in app_status_map,
                current_application_status=app_status_map.get(opp_id)
            )
        )

    # Sort descending by match score
    scored_opps.sort(key=lambda x: x.match_score, reverse=True)
    return scored_opps[:8]

@router.get("/urgent", response_model=List[OpportunityRecommendation])
async def get_urgent_opportunities(current_user=Depends(get_current_user), db=Depends(get_db)):
    profile = StudentProfile(**current_user.get("profile", {}))
    user_id = current_user["id"]

    saved_docs = await db.saved_opportunities.find({"user_id": user_id}).to_list(100)
    saved_ids = {s["opportunity_id"] for s in saved_docs}
    app_docs = await db.applications.find({"user_id": user_id}).to_list(100)
    app_status_map = {a["opportunity_id"]: a["status"] for a in app_docs}

    all_opps = await db.opportunities.find({"opportunity_status": {"$ne": "Expired"}}).to_list(500)
    urgent_list = []

    for opp in all_opps:
        scored = compute_opportunity_score(profile, opp)
        if scored["deadline_urgency"] in ("red", "yellow"):
            opp_id = opp["id"]
            urgent_list.append(
                OpportunityRecommendation(
                    **opp,
                    match_score=scored["match_score"],
                    skills_match_score=scored["skills_match_score"],
                    eligibility_status=scored["eligibility_status"],
                    eligibility_reasons=scored["eligibility_reasons"],
                    matched_skills=scored["matched_skills"],
                    missing_skills=scored["missing_skills"],
                    reasons=scored["reasons"],
                    recommended_next_action=scored["recommended_next_action"],
                    days_remaining=scored["days_remaining"],
                    deadline_urgency=scored["deadline_urgency"],
                    is_saved=opp_id in saved_ids,
                    is_applied=opp_id in app_status_map,
                    current_application_status=app_status_map.get(opp_id)
                )
            )

    urgent_list.sort(key=lambda x: x.days_remaining)
    return urgent_list[:6]

@router.get("/daily-action-plan", response_model=List[ActionItem])
async def get_daily_action_plan(current_user=Depends(get_current_user), db=Depends(get_db)):
    profile = StudentProfile(**current_user.get("profile", {}))
    user_id = current_user["id"]

    all_opps = await db.opportunities.find().to_list(100)
    urgent_opp = None
    for opp in all_opps:
        scored = compute_opportunity_score(profile, opp)
        if scored["deadline_urgency"] == "red":
            urgent_opp = opp
            break

    actions = []
    # 1. Urgent deadline action
    if urgent_opp:
        actions.append(
            ActionItem(
                id="act-1",
                title=f"Submit Application: {urgent_opp.get('title')}",
                category="deadline",
                description=f"Closes in less than 3 days! Complete all required eligibility documents.",
                priority="urgent",
                action_label="Review & Apply",
                action_url=f"/explore?id={urgent_opp.get('id')}"
            )
        )
    else:
        actions.append(
            ActionItem(
                id="act-1",
                title="Discover New Internships & Fellowships",
                category="exploration",
                description="Explore top matched software and AI research opportunities tailored to your degree.",
                priority="recommended",
                action_label="Explore Now",
                action_url="/explore"
            )
        )

    # 2. Skill building action
    missing_skill = "Docker" if "Docker" not in profile.technical_skills else "Kubernetes"
    actions.append(
        ActionItem(
            id="act-2",
            title=f"Learn In-Demand Skill: {missing_skill}",
            category="skill_gap",
            description=f"Adding {missing_skill} unlocks multiple high-tier cloud internship openings.",
            priority="recommended",
            action_label="View Roadmap",
            action_url="/skill-gap"
        )
    )

    # 3. Application tracking update
    actions.append(
        ActionItem(
            id="act-3",
            title="Update Application Tracker",
            category="application",
            description="Move submitted applications to 'Under Review' or update interview dates.",
            priority="optional",
            action_label="Open Kanban",
            action_url="/applications"
        )
    )

    return actions
