from fastapi import APIRouter, HTTPException, status
from app.employee.models import Employee
from app.employee.schemas import EmployeeCreate, EmployeeResponse
from typing import List

router = APIRouter(prefix="/employees", tags=["Employees"])


@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
async def add_employee(payload: EmployeeCreate):
    """Add a new employee"""

    # Duplicate employee_id check
    existing_id = await Employee.find_one(Employee.employee_id == payload.employee_id)
    if existing_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Employee with ID '{payload.employee_id}' already exists.",
        )

    # Duplicate email check
    existing_email = await Employee.find_one(Employee.email == payload.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Employee with email '{payload.email}' already exists.",
        )

    employee = Employee(
        employee_id=payload.employee_id,
        full_name=payload.full_name,
        email=payload.email,
        department=payload.department,
    )
    await employee.insert()
    return EmployeeResponse.from_document(employee)


@router.get("/", response_model=List[EmployeeResponse])
async def list_employees():
    """Get all employees"""
    employees = await Employee.find_all().to_list()
    return [EmployeeResponse.from_document(emp) for emp in employees]


@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(employee_id: str):
    """Get a single employee by employee_id"""
    employee = await Employee.find_one(Employee.employee_id == employee_id)
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found.",
        )
    return EmployeeResponse.from_document(employee)


@router.delete("/{employee_id}", status_code=status.HTTP_200_OK)
async def delete_employee(employee_id: str):
    """Delete an employee by employee_id"""
    employee = await Employee.find_one(Employee.employee_id == employee_id)
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found.",
        )
    await employee.delete()
    return {"message": f"Employee '{employee_id}' deleted successfully."}
