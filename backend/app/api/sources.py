from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from app.core.database import get_db
from app.services.sources import sync_all_sources, DEFAULT_SOURCES

router = APIRouter(prefix="/sources", tags=["Opportunity Sources"])

@router.get("")
async def list_sources(db=Depends(get_db)):
    for s in DEFAULT_SOURCES:
        await db.sources.update_one({"id": s["id"]}, {"$setOnInsert": s}, upsert=True)
    sources = await db.sources.find().to_list(100)
    
    # Exclude MongoDB internal _id
    for s in sources:
        if "_id" in s:
            del s["_id"]
    return sources

@router.post("/sync")
async def trigger_sync(db=Depends(get_db)):
    result = await sync_all_sources(db)
    return result
