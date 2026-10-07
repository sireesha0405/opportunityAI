import pytest
from app.models.enums import EligibilityLevel
from app.schemas.user import StudentProfile
from app.services.recommendation import compute_opportunity_score, check_eligibility, calculate_deadline_urgency
from app.services.nlp_search import parse_natural_language_query
from app.services.skill_gap import analyze_skill_gap
from app.seeds.sample_opportunities import SAMPLE_OPPORTUNITIES

def test_eligibility_checks():
    profile = StudentProfile(
        degree="B.Tech",
        branch="Computer Science and Engineering",
        academic_year="3rd Year",
        cgpa=8.5,
        technical_skills=["Python", "JavaScript", "React", "SQL"]
    )

    # GSoC opportunity allows all
    gsoc_opp = next(o for o in SAMPLE_OPPORTUNITIES if o["id"] == "opp-gsoc-2026")
    status, reasons = check_eligibility(profile, gsoc_opp)
    assert status == EligibilityLevel.ELIGIBLE

    # High CGPA restriction test
    strict_opp = {
        "eligibility_criteria": {
            "eligible_degrees": ["B.Tech"],
            "eligible_academic_years": ["4th Year"],
            "min_cgpa": 9.0,
            "eligible_branches": ["Computer Science and Engineering"]
        }
    }
    status, reasons = check_eligibility(profile, strict_opp)
    # CGPA is 8.5 < 9.0 and year is 3rd != 4th -> Not Eligible
    assert status == EligibilityLevel.NOT_ELIGIBLE
    assert any("Minimum CGPA required is 9.0" in r for r in reasons)

def test_recommendation_scoring():
    profile = StudentProfile(
        degree="B.Tech",
        branch="Computer Science and Engineering",
        academic_year="3rd Year",
        cgpa=8.8,
        technical_skills=["Python", "Cloud Computing", "SQL", "Networking Basics"],
        preferred_categories=["Internship"],
        work_mode_preference="Hybrid"
    )

    aws_opp = next(o for o in SAMPLE_OPPORTUNITIES if o["id"] == "opp-aws-cloud-intern")
    score_res = compute_opportunity_score(profile, aws_opp)
    
    assert score_res["match_score"] >= 80
    assert "Cloud Computing" in score_res["matched_skills"]
    assert score_res["eligibility_status"] == EligibilityLevel.ELIGIBLE
    assert len(score_res["reasons"]) > 0

def test_deadline_classification():
    from datetime import datetime, timedelta, timezone
    now = datetime.now(timezone.utc)
    
    # 2 days ahead -> Red
    red_deadline = (now + timedelta(days=2)).isoformat()
    days, urgency = calculate_deadline_urgency(red_deadline)
    assert urgency == "red"
    assert days <= 2

    # 10 days ahead -> Yellow
    yellow_deadline = (now + timedelta(days=10)).isoformat()
    days, urgency = calculate_deadline_urgency(yellow_deadline)
    assert urgency == "yellow"
    assert days >= 9

    # 25 days ahead -> Green
    green_deadline = (now + timedelta(days=25)).isoformat()
    days, urgency = calculate_deadline_urgency(green_deadline)
    assert urgency == "green"
    assert days >= 20

def test_natural_language_search_parser():
    query = "Find remote software engineering internships for third-year CSE students closing within two weeks"
    parsed = parse_natural_language_query(query)
    
    assert parsed["category"] == "Internship"
    assert parsed["work_mode"] == "Remote"
    assert parsed["academic_year"] == "3rd Year"
    assert parsed["max_days_remaining"] == 14
    assert "software" in parsed["keywords"]

def test_skill_gap_analysis():
    profile = StudentProfile(
        technical_skills=["Python", "SQL", "React"]
    )
    report = analyze_skill_gap(profile, SAMPLE_OPPORTUNITIES)
    
    assert "Python" in report["matched_skills"]
    assert len(report["frequent_market_skills"]) > 0
    assert len(report["recommended_learning_path"]) > 0
    assert any("Docker" in s["skill"] or "PyTorch" in s["skill"] for s in report["recommended_learning_path"])
