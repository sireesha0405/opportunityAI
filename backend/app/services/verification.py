from datetime import datetime, timezone
import uuid
from typing import Dict, Any

async def record_user_report(db, user_id: str, opportunity_id: str, reason: str, details: str) -> Dict[str, Any]:
    """Logs student reports of inaccurate, suspicious, or expired listings"""
    report_doc = {
        "id": f"report-{uuid.uuid4().hex[:10]}",
        "user_id": user_id,
        "opportunity_id": opportunity_id,
        "reason": reason,
        "details": details,
        "status": "pending_review",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.reports.insert_one(report_doc)
    
    # If multiple reports accumulate, update opportunity verification status
    count = await db.reports.count_documents({"opportunity_id": opportunity_id})
    if count >= 3:
        await db.opportunities.update_one(
            {"id": opportunity_id},
            {"$set": {
                "verification_status": "Potential Warning",
                "verification_notes": f"Community flagged ({count} reports received for verification check)."
            }}
        )

    return report_doc
