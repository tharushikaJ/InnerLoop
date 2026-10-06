from fastapi import HTTPException, status
from sqlalchemy import false, or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..models.intern_pod import InternPod, InternPodMember
from ..models.project import Project
from ..models.user import User
from ..schemas.project_schema import ProjectCreate


def intern_pod_ids(db: Session, user_id: int) -> list[int]:
    return [
        row[0]
        for row in db.query(InternPodMember.pod_id)
        .filter(InternPodMember.intern_user_id == user_id)
        .all()
    ]


def projects_for_user(db: Session, user: User) -> list[Project]:
    query = db.query(Project)
    if user.role == "employee":
        query = query.filter(Project.responsible_employee_id == user.id)
    elif user.role == "intern":
        pod_ids = intern_pod_ids(db, user.id)
        if not pod_ids:
            return []
        assigned_project_ids = [
            row[0]
            for row in db.query(InternPod.assigned_project_id)
            .filter(InternPod.id.in_(pod_ids), InternPod.assigned_project_id.is_not(None))
            .all()
        ]
        conditions = [Project.assigned_intern_pod_id.in_(pod_ids)]
        conditions.append(Project.id.in_(assigned_project_ids) if assigned_project_ids else false())
        query = query.filter(or_(*conditions))
    return query.order_by(Project.updated_at.desc(), Project.id.desc()).all()


def project_data(db: Session, project: Project) -> dict:
    employee_name = None
    pod_name = None
    if project.responsible_employee_id:
        employee_name = db.query(User.name).filter(User.id == project.responsible_employee_id).scalar()
    if project.assigned_intern_pod_id:
        pod_name = db.query(InternPod.pod_name).filter(InternPod.id == project.assigned_intern_pod_id).scalar()
    return {
        column.name: getattr(project, column.name)
        for column in Project.__table__.columns
    } | {
        "responsible_employee_name": employee_name,
        "assigned_intern_pod_name": pod_name,
    }


def project_records_for_user(db: Session, user: User) -> list[dict]:
    return [project_data(db, project) for project in projects_for_user(db, user)]


def project_options(db: Session) -> dict:
    return {
        "employees": [
            {"id": employee.id, "name": employee.name, "designation": employee.designation}
            for employee in db.query(User)
            .filter(User.role == "employee", User.status == "active")
            .order_by(User.name.asc())
            .all()
        ],
        "pods": [
            {"id": pod.id, "pod_name": pod.pod_name}
            for pod in db.query(InternPod).order_by(InternPod.pod_name.asc()).all()
        ],
    }


def create_project(
    db: Session,
    payload: ProjectCreate,
    default_responsible_employee_id: int | None = None,
) -> dict:
    values = payload.model_dump()
    if values["responsible_employee_id"] is None:
        values["responsible_employee_id"] = default_responsible_employee_id
    if values["responsible_employee_id"] is not None:
        employee_exists = db.query(User.id).filter(
            User.id == values["responsible_employee_id"],
            User.role == "employee",
            User.status == "active",
        ).first()
        if not employee_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The selected responsible employee is not active or does not exist.",
            )
    if payload.assigned_intern_pod_id is not None:
        pod_exists = db.query(InternPod.id).filter(
            InternPod.id == payload.assigned_intern_pod_id
        ).first()
        if not pod_exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The selected intern pod does not exist.",
            )
    project = Project(**values)
    db.add(project)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The selected responsible employee or intern pod does not exist.",
        ) from error
    db.refresh(project)
    return project_data(db, project)
