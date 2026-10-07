from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.models.enums import ApplicationStatus
from app.schemas.opportunity import OpportunityBase

class StatusHistoryEntry(BaseModel):
    status: ApplicationStatus
    changed_at: str
    note: Optional[str] = None

class ApplicationCreate(BaseModel):
    opportunity_id: str
    status: ApplicationStatus = ApplicationStatus.IN_PROGRESS
    notes: Optional[str] = ""
    applied_date: Optional[str] = None
    follow_up_date: Optional[str] = None
    interview_date: Optional[str] = None

class ApplicationUpdate(BaseModel):
    status: Optional[ApplicationStatus] = None
    notes: Optional[str] = None
    applied_date: Optional[str] = None
    follow_up_date: Optional[str] = None
    interview_date: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: str
    user_id: str
    opportunity_id: str
    opportunity: Optional[OpportunityBase] = None
    status: ApplicationStatus
    notes: str = ""
    applied_date: Optional[str] = None
    follow_up_date: Optional[str] = None
    interview_date: Optional[str] = None
    history: List[StatusHistoryEntry] = Field(default_factory=list)
    created_at: str
    updated_at: str

class SavedOpportunityCreate(BaseModel):
    opportunity_id: str
    priority: str = "medium" # low, medium, high
    notes: Optional[str] = ""

class SavedOpportunityResponse(BaseModel):
    id: str
    user_id: str
    opportunity_id: str
    opportunity: Optional[OpportunityBase] = None
    priority: str = "medium"
    notes: Optional[str] = ""
    saved_at: str
