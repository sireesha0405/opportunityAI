from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user_optional
from app.schemas.user import StudentProfile
from app.schemas.opportunity import OpportunityRecommendation
from app.services.recommendation import compute_opportunity_score, calculate_haversine_distance

router = APIRouter(prefix="/map", tags=["Interactive Map"])

@router.get("/opportunities", response_model=List[OpportunityRecommendation])
async def get_map_opportunities(
    category: Optional[str] = None,
    city: Optional[str] = None,
    max_radius_km: Optional[float] = None,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    urgency: Optional[str] = None,
    include_expired: bool = False,
    current_user=Depends(get_current_user_optional),
    db=Depends(get_db)
):
    if current_user and "profile" in current_user:
        profile = StudentProfile(**current_user["profile"])
    else:
        profile = StudentProfile()

    # Center coordinates fallback
    center_lat = lat or profile.latitude or 12.9716
    center_lon = lon or profile.longitude or 77.5946

    # Fetch opportunities with coordinates
    query: dict = {
        "latitude": {"$ne": None},
        "longitude": {"$ne": None}
    }
    if not include_expired:
        query["opportunity_status"] = {"$ne": "Expired"}
    if category and category != "All":
        query["category"] = category
    if city and city != "All":
        query["city"] = city

    opps = await db.opportunities.find(query).to_list(500)
    map_results = []

    for opp in opps:
        opp_lat = opp.get("latitude")
        opp_lon = opp.get("longitude")
        if opp_lat is None or opp_lon is None:
            continue

        dist = calculate_haversine_distance(center_lat, center_lon, opp_lat, opp_lon)
        if max_radius_km and dist > max_radius_km:
            continue

        scored = compute_opportunity_score(profile, opp)
        
        if urgency and urgency != "All" and scored["deadline_urgency"] != urgency:
            continue

        map_results.append(
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
                deadline_urgency=scored["deadline_urgency"]
            )
        )

    # Sort nearest or highest match
    map_results.sort(key=lambda x: x.match_score, reverse=True)
    return map_results
