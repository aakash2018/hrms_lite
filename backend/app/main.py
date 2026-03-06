from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.config import init_db
from app.employee.routes import router as employee_router
from app.attendance.routes import router as attendance_router
from app.employee.models import Employee
from app.attendance.models import Attendance
from datetime import date
from beanie.odm.operators.find.logical import And


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="HRMS Lite API",
    description="Employee & Attendance Management System",
    version="1.0.0",
    lifespan=lifespan,
)

# Vercel frontend URLs (production + preview)
VERCEL_ORIGINS = [
    "https://hrms-lite-nine-beryl.vercel.app",
    "https://hrms-lite-lolm12k3m-aakashprajapat084-gmailcoms-projects.vercel.app",
    "https://hrms-lite.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", *VERCEL_ORIGINS],  # Allow all origins including Vercel
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.include_router(employee_router, prefix="/api")
app.include_router(attendance_router, prefix="/api")


@app.get("/", tags=["Health"])
def root():
    return {"message": "Welcome to the HRMS Lite API"}


@app.get("/api/dashboard", tags=["Dashboard"])
async def get_dashboard_stats():
    """Get dashboard summary statistics"""
    total_employees = await Employee.count()
    
    today = date.today()
    start_of_day = today
    end_of_day = today
    
    # Get today's attendance counts
    today_present = await Attendance.find(
        And(
            Attendance.date >= start_of_day,
            Attendance.date <= end_of_day,
            Attendance.status == "Present"
        )
    ).count()
    
    today_absent = await Attendance.find(
        And(
            Attendance.date >= start_of_day,
            Attendance.date <= end_of_day,
            Attendance.status == "Absent"
        )
    ).count()
    
    # Get total attendance records
    total_attendance_records = await Attendance.count()
    
    return {
        "total_employees": total_employees,
        "today_present": today_present,
        "today_absent": today_absent,
        "total_attendance_records": total_attendance_records
    }
