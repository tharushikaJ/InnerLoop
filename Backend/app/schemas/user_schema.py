from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr


UserRole = Literal["intern", "employee", "management"]


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole
    designation: str | None = None
    department: str | None = None
    status: str
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
