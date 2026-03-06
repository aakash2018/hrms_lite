from pydantic import BaseModel, EmailStr, Field
from bson import ObjectId


class EmployeeCreate(BaseModel):
    employee_id: str = Field(..., min_length=1, description="Unique Employee ID")
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    department: str = Field(..., min_length=1, max_length=50)


class EmployeeResponse(BaseModel):
    id: str
    employee_id: str
    full_name: str
    email: str
    department: str

    @classmethod
    def from_document(cls, emp):
        return cls(
            id=str(emp.id),
            employee_id=emp.employee_id,
            full_name=emp.full_name,
            email=emp.email,
            department=emp.department,
        )
