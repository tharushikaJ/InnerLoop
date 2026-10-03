from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class InternPodMemberBase(BaseModel):
    intern_user_id: int
    status: str = "Assigned"


class InternPodMemberCreate(InternPodMemberBase):
    pass


class InternPodMemberResponse(InternPodMemberBase):
    id: int
    pod_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InternPodBase(BaseModel):
    pod_name: str
    assigned_project_id: Optional[int] = None
    assigned_feature_module: Optional[str] = None
    mentor_employee_id: Optional[int] = None
    start_date: Optional[date] = None
    target_date: Optional[date] = None
    status: Optional[str] = "Active"
    progress_percentage: Decimal = Decimal("0")


class InternPodCreate(InternPodBase):
    pass


class InternPodUpdate(BaseModel):
    pod_name: Optional[str] = None
    assigned_project_id: Optional[int] = None
    assigned_feature_module: Optional[str] = None
    mentor_employee_id: Optional[int] = None
    start_date: Optional[date] = None
    target_date: Optional[date] = None
    status: Optional[str] = None
    progress_percentage: Optional[Decimal] = None


class InternPodResponse(InternPodBase):
    id: int
    pod_name: str
    assigned_project_id: int | None = None
    assigned_feature_module: str | None = None
    mentor_employee_id: int | None = None
    start_date: date | None = None
    target_date: date | None = None
    status: str | None = None
    progress_percentage: Decimal = Decimal("0")
    created_at: datetime
    updated_at: datetime
    members: list[InternPodMemberResponse] = []

    model_config = ConfigDict(from_attributes=True)
