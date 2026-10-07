from fastapi import HTTPException, status
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..models.task import Task
from ..models.project import Project
from ..models.intern_pod import InternPod
from ..models.user import User
from ..schemas.task_schema import TaskCreate, TaskSubmissionUpdate, TaskUpdate
from .project_service import intern_pod_ids


def tasks_for_user(db: Session, user: User) -> list[Task]:
    query = db.query(Task)
    if user.role == "employee":
        responsible_project_ids = db.query(Project.id).filter(Project.responsible_employee_id == user.id)
        query = query.filter(or_(Task.assigned_user_id == user.id, Task.project_id.in_(responsible_project_ids)))
    elif user.role == "intern":
        pod_ids = intern_pod_ids(db, user.id)
        conditions = [Task.assigned_user_id == user.id]
        if pod_ids:
            conditions.append(Task.assigned_intern_pod_id.in_(pod_ids))
        query = query.filter(or_(*conditions))
    return query.order_by(Task.due_date.asc().nullslast(), Task.id.desc()).all()


def task_data(db: Session, task: Task) -> dict:
    project_name = db.query(Project.project_name).filter(Project.id == task.project_id).scalar() if task.project_id else None
    user_name = db.query(User.name).filter(User.id == task.assigned_user_id).scalar() if task.assigned_user_id else None
    pod_name = db.query(InternPod.pod_name).filter(InternPod.id == task.assigned_intern_pod_id).scalar() if task.assigned_intern_pod_id else None
    return {
        column.name: getattr(task, column.name)
        for column in Task.__table__.columns
    } | {
        "project_name": project_name,
        "assigned_user_name": user_name,
        "assigned_intern_pod_name": pod_name,
        "submission_status": "Submitted" if task.completion_evidence_link or task.progress_note else "Not submitted",
    }


def task_records_for_user(db: Session, user: User) -> list[dict]:
    return [task_data(db, task) for task in tasks_for_user(db, user)]


def task_options(db: Session) -> dict:
    return {
        "projects": [
            {"id": project.id, "project_name": project.project_name}
            for project in db.query(Project).order_by(Project.project_name.asc()).all()
        ],
        "assignees": [
            {"id": user.id, "name": user.name, "email": user.email, "role": user.role}
            for user in db.query(User)
            .filter(User.status == "active", User.role.in_(["employee", "intern"]))
            .order_by(User.name.asc()).all()
        ],
        "interns": [
            {"id": user.id, "name": user.name, "email": user.email}
            for user in db.query(User)
            .filter(User.status == "active", User.role == "intern")
            .order_by(User.name.asc()).all()
        ],
        "pods": [
            {"id": pod.id, "pod_name": pod.pod_name}
            for pod in db.query(InternPod).order_by(InternPod.pod_name.asc()).all()
        ],
    }


def create_task(
    db: Session,
    payload: TaskCreate,
    default_assigned_user_id: int | None = None,
) -> dict:
    values = payload.model_dump()
    if values["assigned_user_id"] is None:
        values["assigned_user_id"] = default_assigned_user_id
    if payload.project_id is not None and not db.query(Project.id).filter(Project.id == payload.project_id).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The selected project does not exist.")
    if values["assigned_user_id"] is not None:
        assignee_exists = db.query(User.id).filter(
            User.id == values["assigned_user_id"],
            User.status == "active",
            User.role.in_(["employee", "intern"]),
        ).first()
        if not assignee_exists:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The selected assignee is not active or does not exist.")
    if payload.assigned_intern_pod_id is not None and not db.query(InternPod.id).filter(InternPod.id == payload.assigned_intern_pod_id).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="The selected intern pod does not exist.")
    task = Task(**values)
    db.add(task)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="One or more selected project, assignee, or pod records do not exist.") from error
    db.refresh(task)
    return task_data(db, task)


def _can_work_on_task(db: Session, task: Task, user: User) -> bool:
    if user.role == "management":
        return False
    if user.role == "employee":
        responsible = task.project_id and db.query(Project.id).filter(Project.id == task.project_id, Project.responsible_employee_id == user.id).first()
        return task.assigned_user_id == user.id or bool(responsible)
    pod_ids = intern_pod_ids(db, user.id)
    return task.assigned_user_id == user.id or task.assigned_intern_pod_id in pod_ids


def update_task(db: Session, task_id: int, user: User, payload: TaskUpdate) -> dict:
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    if not _can_work_on_task(db, task, user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You cannot update this task")
    values = payload.model_dump(exclude_unset=True)
    if user.role != "management":
        allowed = {"status", "progress_note", "completion_evidence_link"}
        if set(values) - allowed:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only update task progress and evidence")
    for field, value in values.items():
        setattr(task, field, value)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="One or more selected project, assignee, or pod records do not exist.") from error
    db.refresh(task)
    return task_data(db, task)


def update_task_submission(
    db: Session,
    task_id: int,
    user: User,
    payload: TaskSubmissionUpdate,
) -> Task:
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    if not _can_work_on_task(db, task, user) or user.role == "management":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You cannot update this task")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task_data(db, task)
