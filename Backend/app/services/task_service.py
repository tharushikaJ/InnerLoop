from fastapi import HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ..models.task import Task
from ..models.user import User
from ..schemas.task_schema import TaskSubmissionUpdate
from .project_service import intern_pod_ids


def tasks_for_user(db: Session, user: User) -> list[Task]:
    query = db.query(Task)
    if user.role == "intern":
        pod_ids = intern_pod_ids(db, user.id)
        conditions = [Task.assigned_user_id == user.id]
        if pod_ids:
            conditions.append(Task.assigned_intern_pod_id.in_(pod_ids))
        query = query.filter(or_(*conditions))
    return query.order_by(Task.due_date.asc().nullslast(), Task.id.desc()).all()


def update_task_submission(
    db: Session,
    task_id: int,
    user: User,
    payload: TaskSubmissionUpdate,
) -> Task:
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    pod_ids = intern_pod_ids(db, user.id) if user.role == "intern" else []
    can_update = task.assigned_user_id == user.id or task.assigned_intern_pod_id in pod_ids
    if user.role != "intern" or not can_update:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You cannot update this task")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task
