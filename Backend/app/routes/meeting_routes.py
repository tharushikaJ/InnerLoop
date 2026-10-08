from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas.meeting_schema import MeetingCreate, MeetingOptionsResponse, MeetingResponse, MeetingUpdate
from ..services import meeting_service
from ..utils.permissions import require_roles


router = APIRouter(prefix="/api/meetings", tags=["meetings"])
employee_or_management = require_roles("employee", "management")
employee_only = require_roles("employee")


@router.get("", response_model=list[MeetingResponse])
def list_meetings(_user=Depends(employee_or_management), db: Session = Depends(get_db)):
    return meeting_service.list_meetings(db)


@router.get("/options", response_model=MeetingOptionsResponse)
def meeting_options(_user=Depends(employee_or_management), db: Session = Depends(get_db)):
    return meeting_service.meeting_options(db)


@router.post("", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
def create_meeting(payload: MeetingCreate, user=Depends(employee_only), db: Session = Depends(get_db)):
    return meeting_service.create_meeting(db, payload, user.id)


@router.put("/{meeting_id}", response_model=MeetingResponse)
def update_meeting(meeting_id: int, payload: MeetingUpdate, _user=Depends(employee_only), db: Session = Depends(get_db)):
    return meeting_service.update_meeting(db, meeting_id, payload)


@router.delete("/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meeting(meeting_id: int, _user=Depends(employee_only), db: Session = Depends(get_db)):
    meeting_service.delete_meeting(db, meeting_id)
