from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from decouple import config
import os
from app.employee.models import Employee
from app.attendance.models import Attendance


# Support both local env vars and production MONGODB_URL
MONGODB_URL = os.getenv("MONGODB_URL")
if MONGODB_URL:
    MONGO_URI = MONGODB_URL
else:
    DB_USER = config("DB_USER")
    DB_PASS = config("DB_PASS")
    DB_NAME = config("DB_NAME")
    MONGO_URI = f"mongodb+srv://{DB_USER}:{DB_PASS}@cluster0.qkjcbs6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

DATABASE_NAME = os.getenv("DATABASE_NAME", config("DB_NAME", default="hrms_lite"))


async def init_db():
    client = AsyncIOMotorClient(MONGO_URI)
    await init_beanie(
        database=client[DATABASE_NAME],
        document_models=[Employee, Attendance],
    )