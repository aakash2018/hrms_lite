from fastapi import APIRouter, HTTPException, status, Query
from app.attendance.models import Attendance
from app.attendance.schemas import AttendanceCreate, AttendanceResponse
from app.employee.models import Employee
from typing import List, Optional
from datetime import date
from beanie.odm.operators.find.logical import And
import traceback
import sys

router = APIRouter(prefix="/attendance", tags=["Attendance"])


@router.post("/", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
async def mark_attendance(payload: AttendanceCreate):
    """Mark attendance for an employee"""

    # Check employee exists
    employee = await Employee.find_one(Employee.employee_id == payload.employee_id)
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{payload.employee_id}' not found.",
        )

    # Duplicate attendance check for same employee + date
    existing = await Attendance.find_one(
        Attendance.employee_id == payload.employee_id,
        Attendance.date == payload.date,
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Attendance for employee '{payload.employee_id}' on {payload.date} already marked.",
        )

    attendance = Attendance(
        employee_id=payload.employee_id,
        date=payload.date,
        status=payload.status,
    )
    await attendance.insert()
    return AttendanceResponse.from_document(attendance)


@router.get("/{employee_id}", response_model=List[AttendanceResponse])
async def get_attendance(
    employee_id: str,
    month: Optional[int] = Query(None, ge=1, le=12, description="Filter by month (1-12)"),
    year: Optional[int] = Query(None, ge=2000, le=2100, description="Filter by year"),
):
    """Get all attendance records for an employee with optional month/year filter"""
    try:
        # Check employee exists
        employee = await Employee.find_one(Employee.employee_id == employee_id)
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID '{employee_id}' not found.",
            )

        # Build query criteria
        criteria = [Attendance.employee_id == employee_id]

        # Apply month/year filter using date range
        if month and year:
            start_date = date(year, month, 1)
            if month == 12:
                end_date = date(year + 1, 1, 1)
            else:
                end_date = date(year, month + 1, 1)
            criteria.append(Attendance.date >= start_date)
            criteria.append(Attendance.date < end_date)
        elif year:
            start_date = date(year, 1, 1)
            end_date = date(year + 1, 1, 1)
            criteria.append(Attendance.date >= start_date)
            criteria.append(Attendance.date < end_date)

        # Build and execute query
        if len(criteria) > 1:
            query = Attendance.find(And(*criteria))
        else:
            query = Attendance.find(criteria[0])

        records = await query.to_list()
        return [AttendanceResponse.from_document(r) for r in records]
    except Exception as e:
        print(f"ERROR in get_attendance: {e}", file=sys.stderr)
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal error: {str(e)}",
        )


@router.get("/{employee_id}/summary", tags=["Attendance"])
async def get_attendance_summary(
    employee_id: str,
    month: Optional[int] = Query(None, ge=1, le=12, description="Filter by month (1-12)"),
    year: Optional[int] = Query(None, ge=2000, le=2100, description="Filter by year"),
):
    """Get attendance summary (present/absent counts) for an employee"""
    try:
        # Check employee exists
        employee = await Employee.find_one(Employee.employee_id == employee_id)
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee with ID '{employee_id}' not found.",
            )

        # Build query criteria
        criteria = [Attendance.employee_id == employee_id]

        # Apply month/year filter using date range
        if month and year:
            start_date = date(year, month, 1)
            if month == 12:
                end_date = date(year + 1, 1, 1)
            else:
                end_date = date(year, month + 1, 1)
            criteria.append(Attendance.date >= start_date)
            criteria.append(Attendance.date < end_date)
        elif year:
            start_date = date(year, 1, 1)
            end_date = date(year + 1, 1, 1)
            criteria.append(Attendance.date >= start_date)
            criteria.append(Attendance.date < end_date)

        # Build query
        if len(criteria) > 1:
            base_query = Attendance.find(And(*criteria))
        else:
            base_query = Attendance.find(criteria[0])

        # Get counts
        present_count = await base_query.find(Attendance.status == "Present").count()
        absent_count = await base_query.find(Attendance.status == "Absent").count()
        total_records = present_count + absent_count

        return {
            "employee_id": employee_id,
            "month": month,
            "year": year,
            "present_days": present_count,
            "absent_days": absent_count,
            "total_days": total_records
        }
    except Exception as e:
        print(f"ERROR in get_attendance_summary: {e}", file=sys.stderr)
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal error: {str(e)}",
        )
