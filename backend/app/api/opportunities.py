from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timezone
from app.core.database import get_db
from app.core.security import get_current_user_optional
from app.schemas.user import StudentProfile
from app.schemas.opportunity import (
    OpportunityBase,
    OpportunityRecommendation,
    NaturalLanguageSearchRequest,
    NaturalLanguageSearchResponse
)
from app.services.recommendation import compute_opportunity_score
from app.services.nlp_search import parse_natural_language_query
from app.seeds.sample_opportunities import SAMPLE_OPPORTUNITIES
from app.services.unstop_service import sync_unstop_to_db

router = APIRouter(prefix="/opportunities", tags=["Opportunities"])

@router.post("/seed")
async def seed_opportunities(db=Depends(get_db)):
    """Seed or re-sync sample opportunities into MongoDB"""
    count = 0
    for opp in SAMPLE_OPPORTUNITIES:
        await db.opportunities.update_one(
            {"id": opp["id"]},
            {"$set": opp},
            upsert=True
        )
        count += 1
    return {"message": f"Successfully seeded {count} realistic verified opportunities.", "count": count}

@router.post("/sync-unstop")
async def sync_unstop(db=Depends(get_db)):
    """Live synchronization of verified opportunities from Unstop with official company career portals"""
    result = await sync_unstop_to_db(db)
    return result

@router.get("", response_model=List[OpportunityRecommendation])
async def list_opportunities(
    category: Optional[str] = None,
    work_mode: Optional[str] = None,
    city: Optional[str] = None,
    eligibility: Optional[str] = None,
    urgency: Optional[str] = None,
    search: Optional[str] = None,
    source: Optional[str] = None,
    sort_by: Optional[str] = "match_desc",
    current_user=Depends(get_current_user_optional),
    db=Depends(get_db)
):
    # Ensure database has items, auto-seed if empty
    total_in_db = await db.opportunities.count_documents({})
    if total_in_db == 0:
        for opp in SAMPLE_OPPORTUNITIES:
            await db.opportunities.update_one({"id": opp["id"]}, {"$set": opp}, upsert=True)

    # Resolve student profile
    if current_user and "profile" in current_user:
        profile = StudentProfile(**current_user["profile"])
        user_id = current_user["id"]
        # Fetch user's saved and applied opportunities
        saved_docs = await db.saved_opportunities.find({"user_id": user_id}).to_list(200)
        saved_ids = {s["opportunity_id"] for s in saved_docs}
        app_docs = await db.applications.find({"user_id": user_id}).to_list(200)
        app_status_map = {a["opportunity_id"]: a["status"] for a in app_docs}
    else:
        profile = StudentProfile()
        saved_ids = set()
        app_status_map = {}

    # Query database
    query_filter = {}
    if category and category != "All":
        query_filter["category"] = category
    if work_mode and work_mode != "All":
        query_filter["work_mode"] = work_mode
    if city and city != "All":
        query_filter["city"] = city
    if source and source != "All":
        if source.lower() == "unstop":
            query_filter["source_name"] = {"$regex": "Unstop", "$options": "i"}
        elif source.lower() == "official":
            query_filter["source_name"] = {"$not": {"$regex": "Unstop", "$options": "i"}}

    cursor = db.opportunities.find(query_filter)
    opps = await cursor.to_list(500)

    results = []
    for opp in opps:
        # Score opportunity
        scored = compute_opportunity_score(profile, opp)
        
        # Check eligibility filter
        if eligibility and eligibility != "All":
            if scored["eligibility_status"] != eligibility:
                continue

        # Check urgency filter
        if urgency and urgency != "All":
            if scored["deadline_urgency"] != urgency:
                continue

        # Text search check
        if search:
            s_low = search.lower()
            t_match = s_low in opp.get("title", "").lower()
            o_match = s_low in opp.get("organization", "").lower()
            d_match = s_low in opp.get("description", "").lower()
            sk_match = any(s_low in s.lower() for s in opp.get("required_skills", []))
            if not (t_match or o_match or d_match or sk_match):
                continue

        opp_id = opp.get("id")
        opp_rec = OpportunityRecommendation(
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
        results.append(opp_rec)

    # Sort results
    if sort_by == "match_desc":
        results.sort(key=lambda x: x.match_score, reverse=True)
    elif sort_by == "deadline_asc":
        results.sort(key=lambda x: x.days_remaining if x.days_remaining >= 0 else 9999)
    elif sort_by == "title_asc":
        results.sort(key=lambda x: x.title.lower())
    elif sort_by == "newest":
        results.sort(key=lambda x: x.publication_date, reverse=True)

    return results

@router.get("/{opp_id}", response_model=OpportunityRecommendation)
async def get_opportunity(
    opp_id: str,
    current_user=Depends(get_current_user_optional),
    db=Depends(get_db)
):
    opp = await db.opportunities.find_one({"id": opp_id})
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    if current_user and "profile" in current_user:
        profile = StudentProfile(**current_user["profile"])
        user_id = current_user["id"]
        saved = await db.saved_opportunities.find_one({"user_id": user_id, "opportunity_id": opp_id})
        app_doc = await db.applications.find_one({"user_id": user_id, "opportunity_id": opp_id})
        is_saved = saved is not None
        is_applied = app_doc is not None
        status = app_doc.get("status") if app_doc else None
    else:
        profile = StudentProfile()
        is_saved = False
        is_applied = False
        status = None

    scored = compute_opportunity_score(profile, opp)
    return OpportunityRecommendation(
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
        is_saved=is_saved,
        is_applied=is_applied,
        current_application_status=status
    )

@router.post("/search/nlp", response_model=NaturalLanguageSearchResponse)
async def natural_language_search(
    body: NaturalLanguageSearchRequest,
    current_user=Depends(get_current_user_optional),
    db=Depends(get_db)
):
    parsed = parse_natural_language_query(body.query)
    
    if current_user and "profile" in current_user:
        profile = StudentProfile(**current_user["profile"])
    else:
        profile = StudentProfile()

    all_opps = await db.opportunities.find().to_list(500)
    matched_results = []
    
    for opp in all_opps:
        # Category filter
        if parsed.get("category") and opp.get("category") != parsed.get("category"):
            continue
        
        # Work mode filter
        if parsed.get("work_mode") and opp.get("work_mode") != parsed.get("work_mode"):
            continue
            
        # City filter
        if parsed.get("city") and opp.get("city") != parsed.get("city"):
            continue

        scored = compute_opportunity_score(profile, opp)
        
        # Max days filter
        if parsed.get("max_days_remaining") is not None:
            if scored["days_remaining"] > parsed["max_days_remaining"] or scored["days_remaining"] < 0:
                continue

        # Keywords check
        keywords = parsed.get("keywords", [])
        if keywords:
            text_corpus = (opp.get("title", "") + " " + opp.get("description", "") + " " + " ".join(opp.get("required_skills", []))).lower()
            keyword_hits = sum(1 for kw in keywords if kw in text_corpus)
            if keyword_hits == 0:
                continue

        matched_results.append(
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

    matched_results.sort(key=lambda x: x.match_score, reverse=True)

    intent_desc = f"Filtered by: {parsed.get('category') or 'Any Category'}, {parsed.get('work_mode') or 'Any Work Mode'}"
    if parsed.get('max_days_remaining'):
        intent_desc += f", closing within {parsed['max_days_remaining']} days"

    return NaturalLanguageSearchResponse(
        parsed_filters=parsed,
        detected_intent=intent_desc,
        total_found=len(matched_results),
        results=matched_results
    )
