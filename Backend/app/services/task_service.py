from sqlalchemy import or_
from sqlalchemy.orm import Session

from ..models.task import Task
from ..models.user import User
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
