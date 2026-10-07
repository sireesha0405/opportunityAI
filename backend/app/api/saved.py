from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
import uuid
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.application import SavedOpportunityCreate, SavedOpportunityResponse
from app.schemas.opportunity import OpportunityBase

router = APIRouter(prefix="/saved", tags=["Saved Opportunities"])

@router.get("", response_model=List[SavedOpportunityResponse])
async def list_saved_opportunities(current_user=Depends(get_current_user), db=Depends(get_db)):
    user_id = current_user["id"]
    cursor = db.saved_opportunities.find({"user_id": user_id})
    saved_list = await cursor.to_list(100)

    results = []
    for item in saved_list:
        opp = await db.opportunities.find_one({"id": item["opportunity_id"]})
        results.append(
            SavedOpportunityResponse(
                id=item["id"],
                user_id=item["user_id"],
                opportunity_id=item["opportunity_id"],
                opportunity=OpportunityBase(**opp) if opp else None,
                priority=item.get("priority", "medium"),
                notes=item.get("notes", ""),
                saved_at=item["saved_at"]
            )
        )
    return results

@router.post("", response_model=SavedOpportunityResponse)
async def save_opportunity(
    body: SavedOpportunityCreate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    user_id = current_user["id"]
    opp = await db.opportunities.find_one({"id": body.opportunity_id})
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    existing = await db.saved_opportunities.find_one({"user_id": user_id, "opportunity_id": body.opportunity_id})
    now = datetime.now(timezone.utc).isoformat()

    if existing:
        await db.saved_opportunities.update_one(
            {"id": existing["id"]},
            {"$set": {"priority": body.priority, "notes": body.notes or existing.get("notes", "")}}
        )
        saved_id = existing["id"]
        saved_at = existing["saved_at"]
    else:
        saved_id = f"saved-{uuid.uuid4().hex[:12]}"
        new_saved = {
            "id": saved_id,
            "user_id": user_id,
            "opportunity_id": body.opportunity_id,
            "priority": body.priority,
            "notes": body.notes or "",
            "saved_at": now
        }
        await db.saved_opportunities.insert_one(new_saved)
        saved_at = now

    return SavedOpportunityResponse(
        id=saved_id,
        user_id=user_id,
        opportunity_id=body.opportunity_id,
        opportunity=OpportunityBase(**opp),
        priority=body.priority,
        notes=body.notes or "",
        saved_at=saved_at
    )

@router.delete("/{opp_id}")
async def unsave_opportunity(
    opp_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    user_id = current_user["id"]
    res = await db.saved_opportunities.delete_one({"user_id": user_id, "opportunity_id": opp_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Saved opportunity not found")
    return {"status": "success", "message": "Opportunity removed from saved list"}
