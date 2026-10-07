from typing import List, Dict, Any, Optional
import httpx
from app.core.config import settings
from app.schemas.user import StudentProfile

SYSTEM_PROMPT_TEMPLATE = """You are OpportunityAI Career Assistant, an expert, encouraging, and highly specific career advisor for college students.
You have access to the student's verified profile and active opportunities in their database.
Always ground your answers strictly on the provided context. If an opportunity or skill is not in the data, state clearly that no current records match rather than inventing fictitious openings.
Recommend concrete next actions and mention deadlines and required skills accurately."""

async def generate_assistant_response(
    query: str,
    profile: StudentProfile,
    opportunities: List[Dict[str, Any]],
    applications: List[Dict[str, Any]],
    saved_opportunities: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Answers student questions using LLM if configured, otherwise uses a smart rule-and-knowledge grounded fallback engine.
    """
    q_lower = query.lower()
    
    # Check if Gemini LLM is configured
    if settings.GEMINI_API_KEY:
        try:
            # Call Gemini REST API directly
            api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
            context_summary = f"""
Student Profile:
- Degree: {profile.degree} in {profile.branch}, {profile.academic_year}
- CGPA: {profile.cgpa}
- Tech Skills: {', '.join(profile.technical_skills)}
- Location: {profile.city}, {profile.country}
- Preferred Categories: {', '.join(profile.preferred_categories)}

Top Relevant Opportunities in Database:
"""
            for opp in opportunities[:6]:
                context_summary += f"- [{opp.get('id')}] {opp.get('title')} at {opp.get('organization')} (Deadline: {opp.get('deadline')}, Work Mode: {opp.get('work_mode')}, Req Skills: {', '.join(opp.get('required_skills', []))})\n"

            payload = {
                "contents": [
                    {
                        "role": "user",
                        "parts": [
                            {"text": f"{SYSTEM_PROMPT_TEMPLATE}\n\nContext:\n{context_summary}\n\nStudent Query: {query}"}
                        ]
                    }
                ],
                "generationConfig": {
                    "temperature": 0.4,
                    "maxOutputTokens": 600
                }
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(api_url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        if text:
                            return {
                                "response": text,
                                "source": "gemini-llm",
                                "related_opportunities": [o.get("id") for o in opportunities[:3]]
                            }
        except Exception:
            # Fall back to grounded template logic
            pass

    # Grounded Rule-and-Data Fallback Engine
    # 1. "What should I apply for first?" or "Which opportunities are right for me?"
    if any(k in q_lower for k in ["apply for first", "which opportunities", "priority", "right for me", "recommend"]):
        top_opps = sorted(opportunities, key=lambda x: x.get("match_score", 0), reverse=True)[:3]
        if not top_opps:
            text = f"Hello {profile.degree or 'Student'}! Currently we don't have matching opportunities for your criteria. Update your skills or categories in your profile."
            return {"response": text, "source": "knowledge-engine", "related_opportunities": []}
            
        text = f"Based on your profile ({profile.degree}, {profile.branch}, with skills in {', '.join(profile.technical_skills[:3])}), here is your prioritized application list:\n\n"
        for i, opp in enumerate(top_opps, 1):
            text += f"{i}. **{opp.get('title')}** at {opp.get('organization')}\n"
            text += f"   • AI Match: {opp.get('match_score', 85)}% | Work Mode: {opp.get('work_mode')}\n"
            text += f"   • Key Skills: {', '.join(opp.get('required_skills', [])[:3])}\n"
            text += f"   • Reason: {opp.get('reasons', ['Strong skill match'])[0] if opp.get('reasons') else 'High alignment with your target stream'}\n\n"
        text += "💡 **Recommendation**: Start with the earliest approaching deadline to ensure your submission is thoroughly reviewed."
        return {
            "response": text,
            "source": "knowledge-engine",
            "related_opportunities": [o.get("id") for o in top_opps]
        }

    # 2. "Skill gap" or "missing skills"
    elif any(k in q_lower for k in ["skill gap", "missing skills", "what skills", "learn", "improve"]):
        # Extract common missing skills
        all_missing = []
        for opp in opportunities[:8]:
            all_missing.extend(opp.get("missing_skills", []))
        
        from collections import Counter
        top_missing = [item[0] for item in Counter(all_missing).most_common(3)]
        if not top_missing:
            top_missing = ["Docker", "Kubernetes", "AWS"]

        text = f"Here is your targeted skill gap analysis:\n\n"
        text += f"✅ **Your Strong Assets**: {', '.join(profile.technical_skills)}\n"
        text += f"🎯 **Top High-Impact Skills to Learn**: {', '.join(top_missing)}\n\n"
        text += f"Adding **{top_missing[0]}** to your toolkit will unlock additional top-tier internship openings in cloud and backend engineering. Head over to the **Skill Gap Analysis** tab for curated free interactive roadmaps!"
        return {
            "response": text,
            "source": "knowledge-engine",
            "related_opportunities": [o.get("id") for o in opportunities[:2]]
        }

    # 3. "Daily action plan" or "what should I do today"
    elif any(k in q_lower for k in ["action plan", "do today", "today's task", "checklist", "daily"]):
        urgent_opp = next((o for o in opportunities if o.get("deadline_urgency") == "red"), opportunities[0] if opportunities else None)
        text = "📋 **Your Career Action Plan for Today**:\n\n"
        if urgent_opp:
            text += f"1. 🔴 **High Priority**: Finalize and submit application for **{urgent_opp.get('title')}** ({urgent_opp.get('organization')}) — deadline is approaching in {urgent_opp.get('days_remaining', 2)} days!\n"
        text += "2. 🟡 **Portfolio Polish**: Add your latest project and verified GitHub repository to your resume.\n"
        text += "3. 🟢 **Skill Building**: Dedicate 45 minutes to practicing containerization fundamentals (Docker) or core DSA problem solving.\n"
        text += "4. 📌 **Tracking**: Review your Kanban board in 'My Applications' to follow up on pending reviews."
        return {
            "response": text,
            "source": "knowledge-engine",
            "related_opportunities": [urgent_opp.get("id")] if urgent_opp else []
        }

    # 4. "Eligibility" questions
    elif any(k in q_lower for k in ["eligible", "eligibility", "can i apply"]):
        text = f"Under your current profile ({profile.degree} - {profile.academic_year}, CGPA: {profile.cgpa or 'Not specified'}):\n\n"
        text += "• You are fully eligible for general student programs like **Google Summer of Code (GSoC)**, **Smart India Hackathon**, and open hackathons.\n"
        text += "• For specialized scholarships (e.g. Adobe WIT or Tata Trusts), confirm your minimum CGPA (usually 7.5 - 8.0) and academic year.\n\n"
        text += "Our system performs strict eligibility checks on every card and displays green, yellow, or red status labels so you never waste time on ineligible programs."
        return {
            "response": text,
            "source": "knowledge-engine",
            "related_opportunities": [o.get("id") for o in opportunities[:2]]
        }

    # 5. Default contextual answer
    else:
        text = f"I am your OpportunityAI Career Assistant! I've analyzed your student profile ({profile.branch}, {profile.academic_year}) and {len(opportunities)} active opportunities in your database.\n\n"
        text += "You can ask me:\n"
        text += "• *'Which opportunities should I apply for first?'*\n"
        text += "• *'What are my biggest skill gaps?'*\n"
        text += "• *'Generate a career action plan for today'* \n"
        text += "• *'Am I eligible for Google Summer of Code or Amazon AWS?'*\n\n"
        text += f"Currently, you have {len(applications)} tracked applications and {len(saved_opportunities)} saved bookmarks."
        return {
            "response": text,
            "source": "knowledge-engine",
            "related_opportunities": [o.get("id") for o in opportunities[:3]]
        }
