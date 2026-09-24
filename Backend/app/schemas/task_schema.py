from datetime import date

from pydantic import BaseModel, ConfigDict


class TaskResponse(BaseModel):
    id: int
    task_title: str
    description: str | None = None
    project_id: int | None = None
    assigned_user_id: int | None = None
    assigned_intern_pod_id: int | None = None
    priority: str | None = None
    status: str | None = None
    due_date: date | None = None
    progress_note: str | None = None
    created_source: str | None = None
    completion_evidence_link: str | None = None

    model_config = ConfigDict(from_attributes=True)
