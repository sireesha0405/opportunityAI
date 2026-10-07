import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

logger = logging.getLogger("opportunityai.db")

class Database:
    client: AsyncIOMotorClient = None
    db = None

db = Database()

import asyncio

async def get_db():
    try:
        loop = asyncio.get_running_loop()
        # If client is None or its loop is not the current running loop
        if db.client is None or db.client.get_io_loop() != loop or db.client.get_io_loop().is_closed():
            await connect_to_mongo()
    except Exception:
        await connect_to_mongo()
    return db.db

async def connect_to_mongo():
    logger.info(f"Connecting to MongoDB at {settings.MONGODB_URL}...")
    try:
        db.client = AsyncIOMotorClient(settings.MONGODB_URL, serverSelectionTimeoutMS=5000)
        db.db = db.client[settings.DATABASE_NAME]
        
        # Test connection
        await db.client.admin.command('ping')
        logger.info(f"Successfully connected to MongoDB database '{settings.DATABASE_NAME}'!")
        
        # Initialize indexes for high performance querying
        await init_db_indexes()
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        # Note: application handles graceful fallback or errors
        raise e

async def close_mongo_connection():
    logger.info("Closing MongoDB connection...")
    if db.client:
        db.client.close()
        logger.info("MongoDB connection closed.")

async def init_db_indexes():
    """Ensure fast querying for opportunities, applications, notifications and users"""
    try:
        # Users indexes
        await db.db.users.create_index("email", unique=True)
        
        # Opportunities indexes
        await db.db.opportunities.create_index("category")
        await db.db.opportunities.create_index("deadline")
        await db.db.opportunities.create_index("skills")
        await db.db.opportunities.create_index("work_mode")
        await db.db.opportunities.create_index([("title", "text"), ("description", "text"), ("organization", "text")])
        
        # Applications indexes
        await db.db.applications.create_index([("user_id", 1), ("opportunity_id", 1)], unique=True)
        await db.db.applications.create_index("user_id")
        await db.db.applications.create_index("status")
        
        # Saved opportunities indexes
        await db.db.saved_opportunities.create_index([("user_id", 1), ("opportunity_id", 1)], unique=True)
        await db.db.saved_opportunities.create_index("user_id")
        
        # Notifications indexes
        await db.db.notifications.create_index("user_id")
        await db.db.notifications.create_index("created_at")
        
        logger.info("Database indexes successfully initialized.")
    except Exception as e:
        logger.warning(f"Index initialization warning: {e}")
