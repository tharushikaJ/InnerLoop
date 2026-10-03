from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas.task_schema import TaskResponse, TaskSubmissionUpdate
from ..services.task_service import tasks_for_user, update_task_submission
from ..utils.permissions import get_current_user


router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskResponse])
def list_tasks(user=Depends(get_current_user), db: Session = Depends(get_db)):
    return tasks_for_user(db, user)


@router.patch("/{task_id}/submission", response_model=TaskResponse)
def submit_task(
    task_id: int,
    payload: TaskSubmissionUpdate,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return update_task_submission(db, task_id, user, payload)
