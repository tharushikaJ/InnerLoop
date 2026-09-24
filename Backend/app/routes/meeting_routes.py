from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.meeting import Meeting
from ..schemas.meeting_schema import MeetingResponse
from ..utils.permissions import require_roles


router = APIRouter(prefix="/api/meetings", tags=["meetings"])
employee_or_management = require_roles("employee", "management")


@router.get("", response_model=list[MeetingResponse])
def list_meetings(_user=Depends(employee_or_management), db: Session = Depends(get_db)):
    return db.query(Meeting).order_by(Meeting.start_datetime.asc()).all()
