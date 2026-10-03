from datetime import date

from typing import Literal

from pydantic import BaseModel, ConfigDict


class TaskSubmissionUpdate(BaseModel):
    completion_evidence_link: str | None = None
    submission_status: Literal["Not submitted", "Submitted"] = "Submitted"
    progress_note: str | None = None


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
    submission_status: str = "Not submitted"
    supervisor_feedback: str | None = None

    model_config = ConfigDict(from_attributes=True)
