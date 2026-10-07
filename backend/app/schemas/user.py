from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class StudentProfile(BaseModel):
    college: Optional[str] = "Global Institute of Technology"
    degree: Optional[str] = "Bachelor of Technology (B.Tech)"
    branch: Optional[str] = "Computer Science and Engineering"
    academic_year: Optional[str] = "3rd Year"  # 1st Year, 2nd Year, 3rd Year, 4th Year, Masters, PhD
    cgpa: Optional[float] = 8.5
    graduation_year: Optional[int] = 2026
    technical_skills: List[str] = Field(default_factory=lambda: ["Python", "JavaScript", "React", "SQL", "Git"])
    soft_skills: List[str] = Field(default_factory=lambda: ["Problem Solving", "Team Collaboration", "Communication"])
    areas_of_interest: List[str] = Field(default_factory=lambda: ["Web Development", "Artificial Intelligence", "Cloud Computing"])
    career_goals: Optional[str] = "Seeking a Software Engineering or AI research internship to build real-world systems"
    preferred_categories: List[str] = Field(default_factory=lambda: ["Internship", "Hackathon", "Scholarship", "Research Program"])
    city: Optional[str] = "Bengaluru"
    state: Optional[str] = "Karnataka"
    country: Optional[str] = "India"
    latitude: Optional[float] = 12.9716
    longitude: Optional[float] = 77.5946
    work_mode_preference: Optional[str] = "Remote" # Remote, Hybrid, On-site, Any
    preferred_radius_km: Optional[int] = 50
    onboarding_completed: bool = True

class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    is_active: bool = True
    profile: StudentProfile = Field(default_factory=StudentProfile)
    created_at: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class ProfileUpdate(BaseModel):
    college: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    academic_year: Optional[str] = None
    cgpa: Optional[float] = None
    graduation_year: Optional[int] = None
    technical_skills: Optional[List[str]] = None
    soft_skills: Optional[List[str]] = None
    areas_of_interest: Optional[List[str]] = None
    career_goals: Optional[str] = None
    preferred_categories: Optional[List[str]] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    work_mode_preference: Optional[str] = None
    preferred_radius_km: Optional[int] = None
    onboarding_completed: Optional[bool] = None
