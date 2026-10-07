from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.models.enums import OpportunityCategory, WorkMode, VerificationStatus, OpportunityStatus, EligibilityLevel

class EligibilityCriteria(BaseModel):
    eligible_degrees: List[str] = Field(default_factory=list) # e.g. ["B.Tech", "B.E.", "B.Sc", "M.Tech", "All"]
    eligible_academic_years: List[str] = Field(default_factory=list) # e.g. ["1st Year", "2nd Year", "3rd Year", "4th Year", "All"]
    min_cgpa: Optional[float] = None # e.g. 7.0 or None if no minimum
    eligible_branches: List[str] = Field(default_factory=list) # e.g. ["Computer Science and Engineering", "Information Technology", "All"]
    other_requirements: Optional[str] = None

class OpportunityBase(BaseModel):
    id: str
    title: str
    organization: str
    category: OpportunityCategory
    description: str
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    eligibility_criteria: EligibilityCriteria = Field(default_factory=EligibilityCriteria)
    location: str
    city: Optional[str] = None
    country: Optional[str] = "India"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    work_mode: WorkMode = WorkMode.REMOTE
    opening_date: str
    deadline: str # ISO string
    official_url: str
    source_url: str
    source_name: str
    publication_date: str
    last_verified_date: str
    verification_status: VerificationStatus = VerificationStatus.VERIFIED
    trust_score: int = 95
    verification_notes: str = "Verified official source and domain credentials checked."
    opportunity_status: OpportunityStatus = OpportunityStatus.ACTIVE
    stipend_or_reward: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    is_sample: bool = True

class OpportunityRecommendation(OpportunityBase):
    match_score: int = 85 # 0 - 100
    skills_match_score: int = 80
    eligibility_status: EligibilityLevel = EligibilityLevel.ELIGIBLE
    eligibility_reasons: List[str] = Field(default_factory=list)
    matched_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    reasons: List[str] = Field(default_factory=list)
    recommended_next_action: str = "Apply now before deadline"
    days_remaining: int = 10
    deadline_urgency: str = "yellow" # green (>14d), yellow (4-14d), red (<=3d), expired (<0)
    is_saved: bool = False
    is_applied: bool = False
    current_application_status: Optional[str] = None

class OpportunityFilterParams(BaseModel):
    category: Optional[str] = None
    work_mode: Optional[str] = None
    city: Optional[str] = None
    min_match_score: Optional[int] = None
    eligibility: Optional[str] = None
    urgency: Optional[str] = None
    search: Optional[str] = None
    sort_by: Optional[str] = "match_desc" # match_desc, deadline_asc, newest, title_asc

class NaturalLanguageSearchRequest(BaseModel):
    query: str

class NaturalLanguageSearchResponse(BaseModel):
    parsed_filters: Dict[str, Any]
    detected_intent: str
    total_found: int
    results: List[OpportunityRecommendation]
