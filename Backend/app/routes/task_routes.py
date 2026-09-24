from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas.task_schema import TaskResponse
from ..services.task_service import tasks_for_user
from ..utils.permissions import get_current_user


router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskResponse])
def list_tasks(user=Depends(get_current_user), db: Session = Depends(get_db)):
    return tasks_for_user(db, user)
