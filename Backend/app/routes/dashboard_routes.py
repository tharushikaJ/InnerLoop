from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas.dashboard_schema import DashboardResponse
from ..services.dashboard_service import dashboard_for_user
from ..utils.permissions import get_current_user


router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardResponse)
def dashboard(user=Depends(get_current_user), db: Session = Depends(get_db)):
    return dashboard_for_user(db, user)
