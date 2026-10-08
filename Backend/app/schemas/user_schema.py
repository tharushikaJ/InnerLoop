from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator


UserRole = Literal["intern", "employee", "management"]


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole
    designation: str | None = None
    department: str | None = None
    assigned_supervisor_id: int | None = None
    assigned_supervisor_name: str | None = None
    status: str
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class SupervisorOption(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=150)
    email: EmailStr | None = None
    role: UserRole | None = None
    designation: str | None = Field(default=None, max_length=150)
    department: str | None = Field(default=None, max_length=150)
    status: Literal["active", "inactive"] | None = None
    assigned_supervisor_id: int | None = None

    @field_validator("name", "designation", "department", mode="before")
    @classmethod
    def strip_text(cls, value):
        return value.strip() if isinstance(value, str) else value

    @field_validator("email", mode="after")
    @classmethod
    def normalize_email(cls, value: EmailStr | None) -> str | None:
        return str(value).lower() if value is not None else None

    @model_validator(mode="after")
    def reject_supervisor_for_non_intern_role(self):
        if self.role in {"employee", "management"} and self.assigned_supervisor_id is not None:
            raise ValueError("Only interns can have an assigned supervisor.")
        return self
