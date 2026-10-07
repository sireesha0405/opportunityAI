import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import connect_to_mongo, close_mongo_connection, get_db
from app.seeds.sample_opportunities import SAMPLE_OPPORTUNITIES
from app.services.sources import DEFAULT_SOURCES

# Import API routers
from app.api.auth import router as auth_router
from app.api.profile import router as profile_router
from app.api.opportunities import router as opportunities_router
from app.api.recommendations import router as recommendations_router
from app.api.map import router as map_router
from app.api.applications import router as applications_router
from app.api.saved import router as saved_router
from app.api.notifications import router as notifications_router
from app.api.skills import router as skills_router
from app.api.assistant import router as assistant_router
from app.api.analytics import router as analytics_router
from app.api.sources import router as sources_router
from app.api.reports import router as reports_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("opportunityai")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to MongoDB
    logger.info("Initializing OpportunityAI Backend Services...")
    await connect_to_mongo()
    
    # Auto-seed and sync verified opportunities & sources
    db = await get_db()
    for opp in SAMPLE_OPPORTUNITIES:
        await db.opportunities.update_one({"id": opp["id"]}, {"$set": opp}, upsert=True)
            
    for src in DEFAULT_SOURCES:
        await db.sources.update_one({"id": src["id"]}, {"$set": src}, upsert=True)
            
    logger.info("OpportunityAI Backend successfully started!")
    yield
    # Shutdown: Close MongoDB connection
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent AI-Powered Opportunity Discovery and Career Assistant for Students",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow frontend access from any dev port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers under /api
api_prefix = settings.API_V1_STR
app.include_router(auth_router, prefix=api_prefix)
app.include_router(profile_router, prefix=api_prefix)
app.include_router(opportunities_router, prefix=api_prefix)
app.include_router(recommendations_router, prefix=api_prefix)
app.include_router(map_router, prefix=api_prefix)
app.include_router(applications_router, prefix=api_prefix)
app.include_router(saved_router, prefix=api_prefix)
app.include_router(notifications_router, prefix=api_prefix)
app.include_router(skills_router, prefix=api_prefix)
app.include_router(assistant_router, prefix=api_prefix)
app.include_router(analytics_router, prefix=api_prefix)
app.include_router(sources_router, prefix=api_prefix)
app.include_router(reports_router, prefix=api_prefix)

@app.get("/")
async def root():
    return {
        "app": settings.PROJECT_NAME,
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs",
        "message": "Welcome to OpportunityAI API — Empowering students to discover, prioritize, and act on career opportunities."
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
