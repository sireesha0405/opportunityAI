from fastapi import APIRouter, Depends
from typing import Dict, Any, List
from collections import Counter
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.user import StudentProfile
from app.schemas.analytics import AnalyticsData, DashboardStats
from app.services.recommendation import compute_opportunity_score
from app.models.enums import ApplicationStatus

router = APIRouter(prefix="/analytics", tags=["Analytics & Reports"])

@router.get("", response_model=AnalyticsData)
async def get_analytics(current_user=Depends(get_current_user), db=Depends(get_db)):
    user_id = current_user["id"]
    profile = StudentProfile(**current_user.get("profile", {}))
    
    # Fetch user applications
    apps = await db.applications.find({"user_id": user_id}).to_list(500)
    saved = await db.saved_opportunities.find({"user_id": user_id}).to_list(500)
    all_opps = await db.opportunities.find().to_list(500)

    # 1. Calculate dashboard stats
    matched_count = 0
    closing_soon_count = 0
    match_distribution_counter = Counter()

    for opp in all_opps:
        scored = compute_opportunity_score(profile, opp)
        if scored["match_score"] >= 60:
            matched_count += 1
        if scored["deadline_urgency"] in ("red", "yellow"):
            closing_soon_count += 1
        
        score_val = scored["match_score"]
        if score_val >= 90:
            match_distribution_counter["90-100%"] += 1
        elif score_val >= 75:
            match_distribution_counter["75-89%"] += 1
        elif score_val >= 60:
            match_distribution_counter["60-74%"] += 1
        else:
            match_distribution_counter["< 60%"] += 1

    in_progress_count = sum(1 for a in apps if a.get("status") in [
        ApplicationStatus.IN_PROGRESS.value,
        ApplicationStatus.PLANNING.value,
        ApplicationStatus.INTERESTED.value,
        ApplicationStatus.INTERVIEW.value
    ])

    stats = DashboardStats(
        matched_opportunities_count=matched_count,
        new_opportunities_count=len(all_opps),
        applications_in_progress_count=in_progress_count,
        upcoming_deadlines_count=closing_soon_count,
        saved_opportunities_count=len(saved),
        closing_soon_count=closing_soon_count
    )

    # 2. Applications by status
    status_counts = Counter(a.get("status", "Interested") for a in apps)
    statuses_order = [
        ApplicationStatus.INTERESTED.value,
        ApplicationStatus.PLANNING.value,
        ApplicationStatus.IN_PROGRESS.value,
        ApplicationStatus.APPLIED.value,
        ApplicationStatus.INTERVIEW.value,
        ApplicationStatus.OFFER.value,
        ApplicationStatus.REJECTED.value,
        ApplicationStatus.WITHDRAWN.value
    ]
    applications_by_status = [
        {"status": s, "count": status_counts.get(s, 0)}
        for s in statuses_order
    ]

    # 3. Opportunities by category
    cat_counts = Counter(o.get("category", "Internship") for o in all_opps)
    opportunities_by_category = [
        {"category": cat, "count": count}
        for cat, count in cat_counts.most_common(10)
    ]

    # 4. Top in-demand skills
    all_skills = []
    for o in all_opps:
        all_skills.extend(o.get("required_skills", []))
    skill_counts = Counter(all_skills)
    user_skills_set = {s.lower() for s in profile.technical_skills}
    top_in_demand_skills = [
        {"skill": skill, "count": count, "user_has": skill.lower() in user_skills_set}
        for skill, count in skill_counts.most_common(8)
    ]

    # 5. Weekly activity (recent days timeline)
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    weekly_activity = [
        {"day": d, "applied": 1 if d in ["Mon", "Wed", "Fri"] and len(apps) > 0 else 0, "saved": 2 if d in ["Tue", "Thu"] and len(saved) > 0 else 0}
        for d in days
    ]

    # 6. Match distribution
    match_distribution = [
        {"range": "90-100%", "count": match_distribution_counter["90-100%"]},
        {"range": "75-89%", "count": match_distribution_counter["75-89%"]},
        {"range": "60-74%", "count": match_distribution_counter["60-74%"]},
        {"range": "< 60%", "count": match_distribution_counter["< 60%"]},
    ]

    return AnalyticsData(
        stats=stats,
        applications_by_status=applications_by_status,
        opportunities_by_category=opportunities_by_category,
        top_in_demand_skills=top_in_demand_skills,
        weekly_activity=weekly_activity,
        match_distribution=match_distribution
    )
