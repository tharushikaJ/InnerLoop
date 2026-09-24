from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class InternPodResponse(BaseModel):
    id: int
    pod_name: str
    assigned_project_id: int | None = None
    assigned_feature_module: str | None = None
    mentor_employee_id: int | None = None
    start_date: date | None = None
    target_date: date | None = None
    status: str | None = None
    progress_percentage: Decimal = Decimal("0")

    model_config = ConfigDict(from_attributes=True)
