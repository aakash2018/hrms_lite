from pydantic import BaseModel, Field
from datetime import date
from app.attendance.models import AttendanceStatus


class AttendanceCreate(BaseModel):
    employee_id: str = Field(..., min_length=1)
    date: date
    status: AttendanceStatus


class AttendanceResponse(BaseModel):
    id: str
    employee_id: str
    date: date
    status: AttendanceStatus

    @classmethod
    def from_document(cls, att):
        return cls(
            id=str(att.id),
            employee_id=att.employee_id,
            date=att.date,
            status=att.status,
        )
