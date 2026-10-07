from typing import List, Dict, Any
from collections import Counter
from app.schemas.user import StudentProfile

RESOURCE_CATALOG = {
    "Docker": {
        "description": "Containerization platform to package applications and dependencies.",
        "url": "https://docker-curriculum.com/",
        "type": "Interactive Guide",
        "estimated_hours": 6,
        "difficulty": "Intermediate"
    },
    "FastAPI": {
        "description": "Modern, high-performance web framework for building APIs with Python.",
        "url": "https://fastapi.tiangolo.com/tutorial/",
        "type": "Official Interactive Tutorial",
        "estimated_hours": 8,
        "difficulty": "Beginner to Intermediate"
    },
    "Kubernetes": {
        "description": "Automated deployment, scaling, and management of containerized applications.",
        "url": "https://kubernetes.io/docs/tutorials/",
        "type": "Hands-on Labs",
        "estimated_hours": 12,
        "difficulty": "Advanced"
    },
    "PyTorch": {
        "description": "Deep learning library used in state-of-the-art AI research and neural networks.",
        "url": "https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html",
        "type": "Tutorial & Codebook",
        "estimated_hours": 10,
        "difficulty": "Intermediate"
    },
    "AWS": {
        "description": "Amazon Web Services cloud computing infrastructure and serverless design.",
        "url": "https://aws.amazon.com/training/digital/",
        "type": "Free Digital Training",
        "estimated_hours": 15,
        "difficulty": "Beginner to Intermediate"
    },
    "TypeScript": {
        "description": "Typed superset of JavaScript that enhances code reliability and large app scalability.",
        "url": "https://www.typescriptlang.org/docs/handbook/intro.html",
        "type": "Official Handbook",
        "estimated_hours": 6,
        "difficulty": "Beginner"
    },
    "SQL": {
        "description": "Standard relational database query language for data analysis and backend systems.",
        "url": "https://sqlbolt.com/",
        "type": "Interactive Exercises",
        "estimated_hours": 4,
        "difficulty": "Beginner"
    },
    "Git": {
        "description": "Distributed version control system essential for collaboration and open-source.",
        "url": "https://learngitbranching.js.org/",
        "type": "Visual Game Simulator",
        "estimated_hours": 3,
        "difficulty": "Beginner"
    },
    "React": {
        "description": "Declarative component-based JavaScript library for user interfaces.",
        "url": "https://react.dev/learn",
        "type": "Official Interactive Docs",
        "estimated_hours": 10,
        "difficulty": "Beginner"
    },
    "Algorithms": {
        "description": "Core computer science problem solving: dynamic programming, graphs, trees.",
        "url": "https://neetcode.io/roadmap",
        "type": "Curated Practice Roadmap",
        "estimated_hours": 25,
        "difficulty": "Intermediate"
    }
}

def analyze_skill_gap(profile: StudentProfile, opportunities: List[Dict[str, Any]]) -> Dict[str, Any]:
    student_skills_set = {s.lower().strip() for s in (profile.technical_skills + profile.soft_skills)}
    
    # 1. Frequency of all skills requested in opportunities
    all_req_skills = []
    skill_to_opp_map = {}
    
    for opp in opportunities:
        reqs = opp.get("required_skills", []) + opp.get("preferred_skills", [])
        for r in reqs:
            clean = r.strip()
            all_req_skills.append(clean)
            if clean not in skill_to_opp_map:
                skill_to_opp_map[clean] = []
            skill_to_opp_map[clean].append(opp.get("title"))

    skill_counts = Counter(all_req_skills)
    
    # 2. Separate into matched and missing
    matched_skills = []
    missing_skills = []
    frequent_market_skills = []

    for skill, count in skill_counts.most_common(15):
        has_skill = skill.lower() in student_skills_set or any(s in skill.lower() for s in student_skills_set)
        if has_skill:
            if skill not in matched_skills:
                matched_skills.append(skill)
        else:
            if skill not in missing_skills:
                missing_skills.append(skill)

        frequent_market_skills.append({
            "skill": skill,
            "count": count,
            "user_has": has_skill,
            "unlock_potential": f"Required in {count} active opportunities"
        })

    # 3. Build recommended learning path prioritized by market impact
    learning_path = []
    for skill in missing_skills[:6]:
        cat_info = RESOURCE_CATALOG.get(skill, {
            "description": f"Industry standard skill required by {skill_counts.get(skill, 1)} target opportunities.",
            "url": f"https://devdocs.io/#q={skill}",
            "type": "Documentation & Practice",
            "estimated_hours": 6,
            "difficulty": "Intermediate"
        })
        learning_path.append({
            "skill": skill,
            "priority": "High" if skill_counts.get(skill, 0) >= 3 else "Medium",
            "unlocked_count": skill_counts.get(skill, 1),
            "description": cat_info["description"],
            "resource_url": cat_info["url"],
            "resource_type": cat_info["type"],
            "estimated_hours": cat_info["estimated_hours"],
            "difficulty": cat_info["difficulty"]
        })

    return {
        "matched_skills": profile.technical_skills,
        "missing_skills": missing_skills,
        "frequent_market_skills": frequent_market_skills,
        "recommended_learning_path": learning_path
    }
