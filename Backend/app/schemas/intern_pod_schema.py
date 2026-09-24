from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class InternPodMemberBase(BaseModel):
    intern_user_id: int
    status: str = "Assigned"


class InternPodMemberCreate(InternPodMemberBase):
    pass


class InternPodMemberUpdate(BaseModel):
    intern_user_id: Optional[int] = None
    status: Optional[str] = None


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
    status: str = "Active"
    progress_percentage: float = 0.0


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
    progress_percentage: Optional[float] = None


class InternPodResponse(InternPodBase):
    id: int
    created_at: datetime
    updated_at: datetime
    members: List[InternPodMemberResponse] = []

    model_config = ConfigDict(from_attributes=True)
