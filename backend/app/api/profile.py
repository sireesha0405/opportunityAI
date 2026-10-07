from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.user import StudentProfile, ProfileUpdate, UserResponse

router = APIRouter(prefix="/profile", tags=["Student Profile"])

@router.get("", response_model=StudentProfile)
async def get_profile(current_user=Depends(get_current_user)):
    profile_data = current_user.get("profile", {})
    return StudentProfile(**profile_data)

@router.put("", response_model=UserResponse)
async def update_profile(profile_in: ProfileUpdate, current_user=Depends(get_current_user), db=Depends(get_db)):
    user_id = current_user["id"]
    current_profile = current_user.get("profile", {})
    
    # Merge updates
    update_data = profile_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            current_profile[key] = value

    now = datetime.now(timezone.utc).isoformat()
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"profile": current_profile, "updated_at": now}}
    )

    updated_user = await db.users.find_one({"id": user_id})
    return UserResponse(
        id=updated_user["id"],
        email=updated_user["email"],
        full_name=updated_user["full_name"],
        is_active=updated_user.get("is_active", True),
        profile=StudentProfile(**updated_user.get("profile", {})),
        created_at=updated_user.get("created_at", "")
    )
