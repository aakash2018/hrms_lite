from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from decouple import config
import os
import ssl
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
    # SSL context for MongoDB Atlas connection
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    
    client = AsyncIOMotorClient(
        MONGO_URI,
        tls=True,
        tlsAllowInvalidCertificates=True,
        serverSelectionTimeoutMS=30000,
        connectTimeoutMS=30000,
        socketTimeoutMS=30000,
    )
    await init_beanie(
        database=client[DATABASE_NAME],
        document_models=[Employee, Attendance],
    )