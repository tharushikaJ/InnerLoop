from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas.project_schema import ProjectCreate, ProjectOptionsResponse, ProjectResponse
from ..services.project_service import create_project, project_options, project_records_for_user
from ..utils.permissions import get_current_user, require_roles


router = APIRouter(prefix="/api/projects", tags=["projects"])
employee_only = require_roles("employee")


@router.get("", response_model=list[ProjectResponse])
def list_projects(user=Depends(get_current_user), db: Session = Depends(get_db)):
    return project_records_for_user(db, user)


@router.get("/options", response_model=ProjectOptionsResponse)
def options(_user=Depends(employee_only), db: Session = Depends(get_db)):
    return project_options(db)


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create(payload: ProjectCreate, user=Depends(employee_only), db: Session = Depends(get_db)):
    return create_project(db, payload, default_responsible_employee_id=user.id)
