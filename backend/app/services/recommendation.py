from datetime import datetime, timezone
import math
from typing import Dict, Any, List, Tuple
from app.models.enums import EligibilityLevel, WorkMode
from app.schemas.user import StudentProfile

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in kilometers between two lat/lon pairs"""
    if None in (lat1, lon1, lat2, lon2):
        return 9999.0
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def check_eligibility(profile: StudentProfile, opportunity: Dict[str, Any]) -> Tuple[EligibilityLevel, List[str]]:
    """
    Explicit, separate eligibility checker.
    Does not let high match score bypass an unmet hard requirement.
    """
    reasons = []
    crit = opportunity.get("eligibility_criteria", {})
    eligible_degrees = [d.lower() for d in crit.get("eligible_degrees", [])]
    eligible_years = [y.lower() for y in crit.get("eligible_academic_years", [])]
    eligible_branches = [b.lower() for b in crit.get("eligible_branches", [])]
    min_cgpa = crit.get("min_cgpa")

    user_degree = (profile.degree or "").lower()
    user_year = (profile.academic_year or "").lower()
    user_branch = (profile.branch or "").lower()
    user_cgpa = profile.cgpa

    is_failed = False
    is_partial = False

    # 1. Degree check
    if eligible_degrees and "all" not in eligible_degrees:
        degree_matched = any(deg in user_degree for deg in eligible_degrees)
        if degree_matched:
            reasons.append("Your degree matches the eligible program requirements.")
        else:
            reasons.append(f"Requires degrees: {', '.join(crit.get('eligible_degrees', []))}.")
            is_failed = True

    # 2. Academic year check
    if eligible_years and "all" not in eligible_years:
        year_matched = any(yr in user_year for yr in eligible_years)
        if year_matched:
            reasons.append(f"Your academic year ({profile.academic_year}) is eligible.")
        else:
            reasons.append(f"Restricted to: {', '.join(crit.get('eligible_academic_years', []))}.")
            is_failed = True

    # 3. CGPA check
    if min_cgpa is not None:
        if user_cgpa is not None:
            if user_cgpa >= min_cgpa:
                reasons.append(f"CGPA {user_cgpa} satisfies the minimum required {min_cgpa}.")
            else:
                reasons.append(f"Minimum CGPA required is {min_cgpa} (Your profile: {user_cgpa}).")
                is_failed = True
        else:
            reasons.append(f"Minimum CGPA is {min_cgpa}. Your profile has not provided CGPA.")
            is_partial = True

    # 4. Branch check
    if eligible_branches and "all" not in eligible_branches and "all stem branches" not in eligible_branches:
        branch_matched = any(br in user_branch for br in eligible_branches)
        if branch_matched:
            reasons.append(f"Branch '{profile.branch}' is accepted.")
        else:
            reasons.append(f"Eligible branches: {', '.join(crit.get('eligible_branches', []))}.")
            is_failed = True

    if is_failed:
        return EligibilityLevel.NOT_ELIGIBLE, reasons
    if is_partial:
        return EligibilityLevel.POTENTIALLY_ELIGIBLE, reasons
    return EligibilityLevel.ELIGIBLE, reasons

def calculate_deadline_urgency(deadline_str: str) -> Tuple[int, str]:
    """Calculate days remaining and classify urgency into green/yellow/red/expired"""
    try:
        # Handle ISO strings with Z or timezone
        clean_str = deadline_str.replace("Z", "+00:00")
        dl = datetime.fromisoformat(clean_str)
        now = datetime.now(timezone.utc)
        diff = dl - now
        days_remaining = diff.days if diff.days >= 0 else -1
        
        if diff.total_seconds() < 0:
            return days_remaining, "expired"
        elif days_remaining <= 3:
            return days_remaining, "red"
        elif days_remaining <= 14:
            return days_remaining, "yellow"
        else:
            return days_remaining, "green"
    except Exception:
        return 7, "yellow"

def compute_opportunity_score(profile: StudentProfile, opportunity: Dict[str, Any]) -> Dict[str, Any]:
    """
    Configurable weighted recommendation engine:
    - Skills match: 35%
    - Academic/Eligibility match: 25%
    - Interest & Category match: 15%
    - Location & Work-mode: 15%
    - Deadline urgency: 10%
    Total = 100%
    """
    student_skills_set = {s.lower().strip() for s in (profile.technical_skills + profile.soft_skills)}
    req_skills = opportunity.get("required_skills", [])
    pref_skills = opportunity.get("preferred_skills", [])
    all_opp_skills = req_skills + pref_skills

    # 1. Skills match calculation (35%)
    matched_skills = []
    missing_skills = []
    for skill in req_skills:
        if skill.lower().strip() in student_skills_set or any(s in skill.lower() for s in student_skills_set):
            matched_skills.append(skill)
        else:
            missing_skills.append(skill)
            
    for skill in pref_skills:
        if skill.lower().strip() in student_skills_set:
            if skill not in matched_skills:
                matched_skills.append(skill)

    if req_skills:
        skill_ratio = len([s for s in req_skills if s in matched_skills]) / len(req_skills)
        # Bonus for preferred skills
        pref_matches = len([s for s in pref_skills if s in matched_skills])
        if pref_skills:
            skill_ratio = min(1.0, skill_ratio + (pref_matches / len(pref_skills)) * 0.2)
    else:
        skill_ratio = 0.8 # Generic opportunity with no specific tech prerequisites

    skills_score = int(skill_ratio * 100)
    weighted_skills = skill_ratio * 35.0

    # 2. Eligibility Match (25%)
    eligibility_status, eligibility_reasons = check_eligibility(profile, opportunity)
    if eligibility_status == EligibilityLevel.ELIGIBLE:
        weighted_eligibility = 25.0
    elif eligibility_status == EligibilityLevel.POTENTIALLY_ELIGIBLE:
        weighted_eligibility = 18.0
    elif eligibility_status == EligibilityLevel.UNKNOWN:
        weighted_eligibility = 12.0
    else:
        weighted_eligibility = 0.0 # Strict: zero out eligibility points if ineligible

    # 3. Interest & Category Match (15%)
    cat_match = 0.0
    opp_cat = opportunity.get("category", "")
    if opp_cat in (profile.preferred_categories or []):
        cat_match += 0.6

    user_interests = [i.lower() for i in (profile.areas_of_interest or [])]
    opp_tags = [t.lower() for t in opportunity.get("tags", [])]
    opp_title = opportunity.get("title", "").lower()
    
    interest_hits = sum(1 for interest in user_interests if any(interest in tag for tag in opp_tags) or interest in opp_title)
    if interest_hits > 0:
        cat_match += min(0.4, interest_hits * 0.2)
    else:
        cat_match += 0.2

    weighted_interest = min(1.0, cat_match) * 15.0

    # 4. Location and Work-Mode Match (15%)
    loc_match = 0.0
    opp_mode = opportunity.get("work_mode", "Remote")
    pref_mode = profile.work_mode_preference or "Any"

    if pref_mode == "Any" or opp_mode == pref_mode or opp_mode == "Remote":
        loc_match += 0.5
    else:
        loc_match += 0.2

    # Distance check if coordinates are present
    user_lat, user_lon = profile.latitude, profile.longitude
    opp_lat, opp_lon = opportunity.get("latitude"), opportunity.get("longitude")
    
    if opp_mode == "Remote":
        loc_match += 0.5
    elif user_lat and user_lon and opp_lat and opp_lon:
        dist = calculate_haversine_distance(user_lat, user_lon, opp_lat, opp_lon)
        if dist <= (profile.preferred_radius_km or 50):
            loc_match += 0.5
        elif dist <= 200:
            loc_match += 0.3
        else:
            loc_match += 0.1
    elif (profile.city or "").lower() == (opportunity.get("city") or "").lower():
        loc_match += 0.5
    else:
        loc_match += 0.25

    weighted_loc = min(1.0, loc_match) * 15.0

    # 5. Deadline Urgency (10%)
    days_rem, urgency = calculate_deadline_urgency(opportunity.get("deadline", ""))
    if urgency == "red":
        weighted_deadline = 10.0 # High priority to apply first!
    elif urgency == "yellow":
        weighted_deadline = 8.0
    elif urgency == "green":
        weighted_deadline = 6.0
    else:
        weighted_deadline = 0.0

    total_score = int(round(weighted_skills + weighted_eligibility + weighted_interest + weighted_loc + weighted_deadline))
    # Cap between 0 and 99 (or 100 for perfect fits)
    total_score = max(5, min(100, total_score))

    # Formulate meaningful reasons
    reasons = []
    if len(matched_skills) > 0:
        reasons.append(f"Strong skill alignment: Matches {len(matched_skills)} required skill(s) ({', '.join(matched_skills[:3])}).")
    if opp_cat in (profile.preferred_categories or []):
        reasons.append(f"Directly fits your career preference for {opp_cat}s.")
    if opp_mode == "Remote":
        reasons.append("Remote flexibility matches your profile.")
    elif (profile.city or "").lower() == (opportunity.get("city") or "").lower():
        reasons.append(f"Conveniently located in your city ({profile.city}).")
    if urgency == "red":
        reasons.append(f"Urgent closing in {days_rem} day(s) — prioritize submitting application!")

    # Recommended next action
    if len(missing_skills) == 0:
        next_action = "Your profile is a strong fit. Apply directly using the official link."
    elif len(missing_skills) == 1:
        next_action = f"Review basics of {missing_skills[0]} and submit your application."
    else:
        next_action = f"Bridge skill gap in {', '.join(missing_skills[:2])} before applying."

    return {
        "match_score": total_score,
        "skills_match_score": skills_score,
        "eligibility_status": eligibility_status,
        "eligibility_reasons": eligibility_reasons,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "reasons": reasons,
        "recommended_next_action": next_action,
        "days_remaining": days_rem,
        "deadline_urgency": urgency
    }
