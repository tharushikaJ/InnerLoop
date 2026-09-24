from datetime import date, datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from ..models.intern_pod import InternPod
from ..models.meeting import Meeting
from ..models.project import Project
from ..models.task import Task
from ..models.user import User
from .project_service import projects_for_user
from .task_service import tasks_for_user


DONE_STATUSES = {"completed", "done", "closed"}


def dashboard_for_user(db: Session, user: User) -> dict:
    projects = projects_for_user(db, user)
    tasks = tasks_for_user(db, user)
    open_tasks = [task for task in tasks if (task.status or "").lower() not in DONE_STATUSES]
    overdue_tasks = [task for task in open_tasks if task.due_date and task.due_date < date.today()]

    metrics = {
        "projects": len(projects),
        "open_tasks": len(open_tasks),
        "overdue_tasks": len(overdue_tasks),
        "completed_tasks": len(tasks) - len(open_tasks),
    }
    meetings = []
    pod_progress = []

    if user.role in {"employee", "management"}:
        meetings = (
            db.query(Meeting)
            .filter(Meeting.start_datetime >= datetime.now())
            .order_by(Meeting.start_datetime.asc())
            .limit(5)
            .all()
        )
        metrics["upcoming_meetings"] = len(meetings)

    if user.role == "management":
        lowered_status = func.lower(func.coalesce(Project.current_status, ""))
        metrics.update({
            "active_projects": db.query(Project).filter(lowered_status.in_(["active", "in progress", "on track"])).count(),
            "delayed_projects": db.query(Project).filter(lowered_status == "delayed").count(),
            "blocked_projects": db.query(Project).filter(lowered_status == "blocked").count(),
        })
        pods = db.query(InternPod).order_by(InternPod.updated_at.desc()).limit(8).all()
        pod_progress = [
            {
                "id": pod.id,
                "name": pod.pod_name,
                "status": pod.status,
                "progress": float(pod.progress_percentage or 0),
            }
            for pod in pods
        ]

    return {
        "role": user.role,
        "metrics": metrics,
        "projects": projects[:5],
        "tasks": tasks[:8],
        "meetings": meetings,
        "pod_progress": pod_progress,
    }
