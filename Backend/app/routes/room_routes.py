from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas.room_schema import MeetingRoomCreate, MeetingRoomResponse, MeetingRoomUpdate, RoomCalendarEntry
from ..services import room_service
from ..utils.permissions import require_roles


router = APIRouter(prefix="/api/meeting-rooms", tags=["meeting-rooms"])
employee_or_management = require_roles("employee", "management")
employee_only = require_roles("employee")


@router.get("", response_model=list[MeetingRoomResponse])
def list_rooms(_user=Depends(employee_or_management), db: Session = Depends(get_db)):
    return room_service.list_rooms(db)


@router.get("/calendar", response_model=list[RoomCalendarEntry])
def room_calendar(_user=Depends(employee_or_management), db: Session = Depends(get_db)):
    return room_service.list_calendar(db)


@router.post("", response_model=MeetingRoomResponse, status_code=status.HTTP_201_CREATED)
def create_room(payload: MeetingRoomCreate, _user=Depends(employee_only), db: Session = Depends(get_db)):
    return room_service.create_room(db, payload)


@router.put("/{room_id}", response_model=MeetingRoomResponse)
def update_room(room_id: int, payload: MeetingRoomUpdate, _user=Depends(employee_only), db: Session = Depends(get_db)):
    return room_service.update_room(db, room_id, payload)


@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_room(room_id: int, _user=Depends(employee_only), db: Session = Depends(get_db)):
    room_service.delete_room(db, room_id)
