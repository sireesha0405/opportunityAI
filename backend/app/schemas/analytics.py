from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: str # deadline_reminder, new_match, status_update, system
    opportunity_id: Optional[str] = None
    is_read: bool = False
    created_at: str
    action_url: Optional[str] = None

class ActionItem(BaseModel):
    id: str
    title: str
    category: str # "application", "deadline", "skill_gap", "exploration"
    description: str
    priority: str # "urgent", "recommended", "optional"
    action_label: str
    action_url: str
    completed: bool = False

class DashboardStats(BaseModel):
    matched_opportunities_count: int = 0
    new_opportunities_count: int = 0
    applications_in_progress_count: int = 0
    upcoming_deadlines_count: int = 0
    saved_opportunities_count: int = 0
    closing_soon_count: int = 0

class AnalyticsData(BaseModel):
    stats: DashboardStats
    applications_by_status: List[Dict[str, Any]] = Field(default_factory=list) # [{status: 'Applied', count: 3}, ...]
    opportunities_by_category: List[Dict[str, Any]] = Field(default_factory=list) # [{category: 'Internship', count: 12}, ...]
    top_in_demand_skills: List[Dict[str, Any]] = Field(default_factory=list) # [{skill: 'React', count: 8, user_has: true}, ...]
    weekly_activity: List[Dict[str, Any]] = Field(default_factory=list) # [{day: 'Mon', applications: 1, saved: 2}, ...]
    match_distribution: List[Dict[str, Any]] = Field(default_factory=list) # [{range: '90-100%', count: 5}, ...]

class SkillGapReport(BaseModel):
    matched_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    frequent_market_skills: List[Dict[str, Any]] = Field(default_factory=list) # [{skill: 'Docker', count: 10, unlock_potential: 'Unlocks 6 internships'}]
    recommended_learning_path: List[Dict[str, Any]] = Field(default_factory=list)
