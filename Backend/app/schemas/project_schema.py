from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ProjectCreate(BaseModel):
    project_name: str = Field(min_length=1, max_length=255)
    project_category: str | None = Field(default=None, max_length=100)
    project_description: str | None = None
    project_type: str | None = Field(default=None, max_length=100)
    responsible_employee_id: int | None = None
    assigned_intern_pod_id: int | None = None
    current_status: str = Field(default="Planning", max_length=50)
    progress_percentage: Decimal = Field(default=Decimal("0"), ge=0, le=100)
    current_progress_update: str | None = None
    next_activity: str | None = None
    target_date: date | None = None
    blockers: str | None = None
    related_links: str | None = None


class ProjectUpdate(BaseModel):
    project_name: str | None = Field(default=None, min_length=1, max_length=255)
    project_category: str | None = Field(default=None, max_length=100)
    project_description: str | None = None
    project_type: str | None = Field(default=None, max_length=100)
    responsible_employee_id: int | None = None
    assigned_intern_pod_id: int | None = None
    current_status: str | None = Field(default=None, max_length=50)
    progress_percentage: Decimal | None = Field(default=None, ge=0, le=100)
    current_progress_update: str | None = None
    next_activity: str | None = None
    target_date: date | None = None
    blockers: str | None = None
    related_links: str | None = None


class ProjectOptionsResponse(BaseModel):
    employees: list[dict]
    pods: list[dict]


class ProjectResponse(BaseModel):
    id: int
    project_name: str
    project_category: str | None = None
    project_description: str | None = None
    project_type: str | None = None
    responsible_employee_id: int | None = None
    assigned_intern_pod_id: int | None = None
    current_status: str | None = None
    progress_percentage: Decimal = Decimal("0")
    current_progress_update: str | None = None
    next_activity: str | None = None
    target_date: date | None = None
    blockers: str | None = None
    related_links: str | None = None
    responsible_employee_name: str | None = None
    assigned_intern_pod_name: str | None = None

    model_config = ConfigDict(from_attributes=True)
