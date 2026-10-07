from enum import Enum

class OpportunityCategory(str, Enum):
    INTERNSHIP = "Internship"
    HACKATHON = "Hackathon"
    SCHOLARSHIP = "Scholarship"
    FELLOWSHIP = "Fellowship"
    COMPETITION = "Competition"
    WORKSHOP = "Workshop"
    CERTIFICATION = "Certification"
    RESEARCH = "Research Program"
    JOB = "Entry-level Job"

class WorkMode(str, Enum):
    REMOTE = "Remote"
    HYBRID = "Hybrid"
    ON_SITE = "On-site"
    ANY = "Any"

class VerificationStatus(str, Enum):
    VERIFIED = "Verified Source"
    SOURCE_IDENTIFIED = "Source Identified"
    VERIFICATION_REQUIRED = "Verification Required"
    EXPIRED = "Expired"
    WARNING = "Potential Warning"

class OpportunityStatus(str, Enum):
    ACTIVE = "Active"
    CLOSING_SOON = "Closing Soon"
    EXPIRED = "Expired"
    UPCOMING = "Upcoming"

class ApplicationStatus(str, Enum):
    INTERESTED = "Interested"
    SAVED = "Saved"
    PLANNING = "Planning to apply"
    IN_PROGRESS = "Application in progress"
    APPLIED = "Applied"
    INTERVIEW = "Assessment or interview"
    OFFER = "Offer received"
    REJECTED = "Rejected"
    WITHDRAWN = "Withdrawn"

class EligibilityLevel(str, Enum):
    ELIGIBLE = "Eligible"
    POTENTIALLY_ELIGIBLE = "Potentially Eligible"
    NOT_ELIGIBLE = "Not Eligible"
    UNKNOWN = "Eligibility Information Unavailable"
