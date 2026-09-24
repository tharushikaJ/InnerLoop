from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


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

    model_config = ConfigDict(from_attributes=True)
