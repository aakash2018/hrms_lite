from beanie import Document, Indexed
from pydantic import EmailStr, Field
from typing import Annotated


class Employee(Document):
    employee_id: Annotated[str, Indexed(unique=True)]
    full_name: str = Field(..., max_length=100)
    email: Annotated[EmailStr, Indexed(unique=True)]
    department: str = Field(..., max_length=50)

    class Settings:
        name = "employees"
