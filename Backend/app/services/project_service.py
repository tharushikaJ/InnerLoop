from sqlalchemy import false, or_
from sqlalchemy.orm import Session

from ..models.intern_pod import InternPod, InternPodMember
from ..models.project import Project
from ..models.user import User


def intern_pod_ids(db: Session, user_id: int) -> list[int]:
    return [
        row[0]
        for row in db.query(InternPodMember.pod_id)
        .filter(InternPodMember.intern_user_id == user_id)
        .all()
    ]


def projects_for_user(db: Session, user: User) -> list[Project]:
    query = db.query(Project)
    if user.role == "intern":
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
