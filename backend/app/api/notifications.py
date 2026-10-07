from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.analytics import NotificationResponse
from app.services.deadline import generate_deadline_notifications_for_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
async def list_notifications(current_user=Depends(get_current_user), db=Depends(get_db)):
    user_id = current_user["id"]
    
    # Run a quick check on deadlines to populate any new notifications for this student
    all_opps = await db.opportunities.find().to_list(100)
    await generate_deadline_notifications_for_user(db, current_user, all_opps)

    cursor = db.notifications.find({"user_id": user_id}).sort("created_at", -1)
    notifs = await cursor.to_list(100)
    return [NotificationResponse(**n) for n in notifs]

@router.patch("/{notif_id}/read")
async def mark_notification_as_read(notif_id: str, current_user=Depends(get_current_user), db=Depends(get_db)):
    user_id = current_user["id"]
    await db.notifications.update_one({"id": notif_id, "user_id": user_id}, {"$set": {"is_read": True}})
    return {"status": "success"}

@router.post("/read-all")
async def mark_all_notifications_as_read(current_user=Depends(get_current_user), db=Depends(get_db)):
    user_id = current_user["id"]
    await db.notifications.update_many({"user_id": user_id}, {"$set": {"is_read": True}})
    return {"status": "success", "message": "All notifications marked as read"}
