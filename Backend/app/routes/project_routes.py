from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas.project_schema import ProjectResponse
from ..services.project_service import projects_for_user
from ..utils.permissions import get_current_user


router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("", response_model=list[ProjectResponse])
def list_projects(user=Depends(get_current_user), db: Session = Depends(get_db)):
    return projects_for_user(db, user)
