from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timezone
import uuid
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token, get_current_user
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token, StudentProfile

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
async def register(user_in: UserCreate, db=Depends(get_db)):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_in.email.lower()})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    user_id = f"user-{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc).isoformat()
    
    new_user = {
        "id": user_id,
        "email": user_in.email.lower(),
        "hashed_password": get_password_hash(user_in.password),
        "full_name": user_in.full_name,
        "is_active": True,
        "profile": StudentProfile().model_dump(),
        "created_at": now,
        "updated_at": now
    }
    
    await db.users.insert_one(new_user)
    
    access_token = create_access_token(data={"sub": user_id})
    user_resp = UserResponse(
        id=user_id,
        email=new_user["email"],
        full_name=new_user["full_name"],
        is_active=new_user["is_active"],
        profile=StudentProfile(**new_user["profile"]),
        created_at=new_user["created_at"]
    )
    return Token(access_token=access_token, token_type="bearer", user=user_resp)

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db=Depends(get_db)):
    user = await db.users.find_one({"email": credentials.email.lower()})
    if not user or not verify_password(credentials.password, user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    access_token = create_access_token(data={"sub": user["id"]})
    user_resp = UserResponse(
        id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        is_active=user.get("is_active", True),
        profile=StudentProfile(**user.get("profile", {})),
        created_at=user.get("created_at", "")
    )
    return Token(access_token=access_token, token_type="bearer", user=user_resp)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user=Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        is_active=current_user.get("is_active", True),
        profile=StudentProfile(**current_user.get("profile", {})),
        created_at=current_user.get("created_at", "")
    )

@router.post("/forgot-password")
async def forgot_password(payload: dict):
    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required.")
    # Demonstration & recovery flow simulation
    return {
        "message": f"Password reset instructions have been sent to {email} if an account exists.",
        "status": "success"
    }
