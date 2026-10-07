from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime, timezone
import uuid
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationResponse, StatusHistoryEntry
from app.schemas.opportunity import OpportunityBase

router = APIRouter(prefix="/applications", tags=["Application Tracking"])

@router.get("", response_model=List[ApplicationResponse])
async def list_applications(
    status: Optional[str] = None,
    search: Optional[str] = None,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    user_id = current_user["id"]
    query = {"user_id": user_id}
    if status and status != "All":
        query["status"] = status

    cursor = db.applications.find(query)
    apps = await cursor.to_list(200)

    # Attach opportunity objects
    results = []
    for app in apps:
        opp_id = app.get("opportunity_id")
        opp = await db.opportunities.find_one({"id": opp_id})
        
        if search and opp:
            s_low = search.lower()
            if s_low not in opp.get("title", "").lower() and s_low not in opp.get("organization", "").lower():
                continue

        results.append(
            ApplicationResponse(
                id=app["id"],
                user_id=app["user_id"],
                opportunity_id=opp_id,
                opportunity=OpportunityBase(**opp) if opp else None,
                status=app["status"],
                notes=app.get("notes", ""),
                applied_date=app.get("applied_date"),
                follow_up_date=app.get("follow_up_date"),
                interview_date=app.get("interview_date"),
                history=[StatusHistoryEntry(**h) for h in app.get("history", [])],
                created_at=app.get("created_at", ""),
                updated_at=app.get("updated_at", "")
            )
        )
    return results

@router.post("", response_model=ApplicationResponse)
async def create_or_update_application(
    body: ApplicationCreate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    user_id = current_user["id"]
    opp = await db.opportunities.find_one({"id": body.opportunity_id})
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    now = datetime.now(timezone.utc).isoformat()
    existing = await db.applications.find_one({"user_id": user_id, "opportunity_id": body.opportunity_id})

    history_entry = {
        "status": body.status,
        "changed_at": now,
        "note": body.notes or f"Application moved to {body.status}"
    }

    if existing:
        updated_history = existing.get("history", []) + [history_entry]
        update_fields = {
            "status": body.status,
            "notes": body.notes if body.notes is not None else existing.get("notes", ""),
            "applied_date": body.applied_date or existing.get("applied_date"),
            "follow_up_date": body.follow_up_date or existing.get("follow_up_date"),
            "interview_date": body.interview_date or existing.get("interview_date"),
            "history": updated_history,
            "updated_at": now
        }
        await db.applications.update_one({"id": existing["id"]}, {"$set": update_fields})
        app_id = existing["id"]
        created_at = existing["created_at"]
    else:
        app_id = f"app-{uuid.uuid4().hex[:12]}"
        new_app = {
            "id": app_id,
            "user_id": user_id,
            "opportunity_id": body.opportunity_id,
            "status": body.status,
            "notes": body.notes or "",
            "applied_date": body.applied_date or (now if body.status == "Applied" else None),
            "follow_up_date": body.follow_up_date,
            "interview_date": body.interview_date,
            "history": [history_entry],
            "created_at": now,
            "updated_at": now
        }
        await db.applications.insert_one(new_app)
        created_at = now
        updated_history = [history_entry]

    # If application created/updated, remove from saved list if exists
    await db.saved_opportunities.delete_one({"user_id": user_id, "opportunity_id": body.opportunity_id})

    return ApplicationResponse(
        id=app_id,
        user_id=user_id,
        opportunity_id=body.opportunity_id,
        opportunity=OpportunityBase(**opp),
        status=body.status,
        notes=body.notes or "",
        applied_date=body.applied_date,
        follow_up_date=body.follow_up_date,
        interview_date=body.interview_date,
        history=[StatusHistoryEntry(**h) for h in updated_history],
        created_at=created_at,
        updated_at=now
    )

@router.patch("/{app_id}", response_model=ApplicationResponse)
async def update_application(
    app_id: str,
    update_in: ApplicationUpdate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    user_id = current_user["id"]
    existing = await db.applications.find_one({"id": app_id, "user_id": user_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Application not found")

    now = datetime.now(timezone.utc).isoformat()
    fields = update_in.model_dump(exclude_unset=True)
    
    updated_history = existing.get("history", [])
    if "status" in fields and fields["status"] != existing["status"]:
        updated_history.append({
            "status": fields["status"],
            "changed_at": now,
            "note": fields.get("notes") or f"Status changed to {fields['status']}"
        })
    fields["history"] = updated_history
    fields["updated_at"] = now

    await db.applications.update_one({"id": app_id}, {"$set": fields})
    updated = await db.applications.find_one({"id": app_id})
    opp = await db.opportunities.find_one({"id": updated["opportunity_id"]})

    return ApplicationResponse(
        id=updated["id"],
        user_id=updated["user_id"],
        opportunity_id=updated["opportunity_id"],
        opportunity=OpportunityBase(**opp) if opp else None,
        status=updated["status"],
        notes=updated.get("notes", ""),
        applied_date=updated.get("applied_date"),
        follow_up_date=updated.get("follow_up_date"),
        interview_date=updated.get("interview_date"),
        history=[StatusHistoryEntry(**h) for h in updated.get("history", [])],
        created_at=updated.get("created_at", ""),
        updated_at=updated.get("updated_at", "")
    )

@router.delete("/{app_id}")
async def delete_application(
    app_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    user_id = current_user["id"]
    res = await db.applications.delete_one({"id": app_id, "user_id": user_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
    return {"status": "success", "message": "Application record removed"}
