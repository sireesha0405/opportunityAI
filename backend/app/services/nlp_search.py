import re
from typing import Dict, Any, List

def parse_natural_language_query(query: str) -> Dict[str, Any]:
    """
    Parses complex natural queries such as:
    'Find remote software engineering internships for third-year CSE students that accept beginners and close within two weeks.'
    into structured filters.
    """
    q_lower = query.lower()
    filters: Dict[str, Any] = {
        "category": None,
        "work_mode": None,
        "academic_year": None,
        "max_days_remaining": None,
        "keywords": [],
        "city": None
    }

    # 1. Detect Category
    category_map = {
        "internship": "Internship",
        "intern": "Internship",
        "hackathon": "Hackathon",
        "scholarship": "Scholarship",
        "fellowship": "Fellowship",
        "workshop": "Workshop",
        "competition": "Competition",
        "contest": "Competition",
        "research": "Research Program",
        "certification": "Certification",
        "job": "Entry-level Job",
        "full-time": "Entry-level Job"
    }
    for word, cat in category_map.items():
        if word in q_lower:
            filters["category"] = cat
            break

    # 2. Detect Work Mode
    if "remote" in q_lower or "work from home" in q_lower or "online" in q_lower:
        filters["work_mode"] = "Remote"
    elif "hybrid" in q_lower:
        filters["work_mode"] = "Hybrid"
    elif "on-site" in q_lower or "in-person" in q_lower or "onsite" in q_lower:
        filters["work_mode"] = "On-site"

    # 3. Detect Academic Year
    if "3rd" in q_lower or "third" in q_lower or "3rd year" in q_lower:
        filters["academic_year"] = "3rd Year"
    elif "1st" in q_lower or "first" in q_lower or "freshman" in q_lower:
        filters["academic_year"] = "1st Year"
    elif "2nd" in q_lower or "second" in q_lower or "sophomore" in q_lower:
        filters["academic_year"] = "2nd Year"
    elif "4th" in q_lower or "fourth" in q_lower or "final year" in q_lower:
        filters["academic_year"] = "4th Year"
    elif "master" in q_lower or "postgrad" in q_lower:
        filters["academic_year"] = "Masters"

    # 4. Detect Timeframe / Deadline Urgency
    if "two weeks" in q_lower or "2 weeks" in q_lower or "14 days" in q_lower:
        filters["max_days_remaining"] = 14
    elif "one week" in q_lower or "1 week" in q_lower or "7 days" in q_lower:
        filters["max_days_remaining"] = 7
    elif "3 days" in q_lower or "three days" in q_lower or "urgent" in q_lower or "closing soon" in q_lower:
        filters["max_days_remaining"] = 4
    elif "month" in q_lower or "30 days" in q_lower:
        filters["max_days_remaining"] = 30

    # 5. Detect Indian Tech Cities
    cities = ["bengaluru", "bangalore", "mumbai", "delhi", "hyderabad", "pune", "chennai"]
    for c in cities:
        if c in q_lower:
            filters["city"] = "Bengaluru" if c in ("bengaluru", "bangalore") else c.capitalize()
            break

    # 6. Extract descriptive keywords (e.g. software, engineering, web, cloud, cse, frontend)
    common_terms = ["remote", "hybrid", "internship", "intern", "hackathon", "scholarship", "find", "show", "me", "for", "that", "and", "or", "in", "two", "weeks", "students"]
    tokens = re.findall(r'\b[a-zA-Z]{3,}\b', q_lower)
    keywords = [t for t in tokens if t not in common_terms]
    filters["keywords"] = keywords[:5]

    return filters
