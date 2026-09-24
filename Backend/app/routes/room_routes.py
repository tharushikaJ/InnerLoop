from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.room import MeetingRoom
from ..schemas.room_schema import MeetingRoomResponse
from ..utils.permissions import require_roles


router = APIRouter(prefix="/api/meeting-rooms", tags=["meeting-rooms"])
employee_or_management = require_roles("employee", "management")


@router.get("", response_model=list[MeetingRoomResponse])
def list_rooms(_user=Depends(employee_or_management), db: Session = Depends(get_db)):
    return db.query(MeetingRoom).order_by(MeetingRoom.room_name.asc()).all()
