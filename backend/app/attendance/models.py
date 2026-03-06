from beanie import Document, Indexed
from pydantic import Field
from typing import Annotated
from datetime import date
from enum import Enum


class AttendanceStatus(str, Enum):
    present = "Present"
    absent = "Absent"


class Attendance(Document):
    employee_id: Annotated[str, Indexed()]
    date: date
    status: AttendanceStatus

    class Settings:
        name = "attendance"
