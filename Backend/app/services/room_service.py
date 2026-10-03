from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..models.meeting import Meeting
from ..models.room import MeetingRoom
from ..schemas.room_schema import MeetingRoomCreate, MeetingRoomUpdate


def list_rooms(db: Session) -> list[MeetingRoom]:
    return db.query(MeetingRoom).order_by(MeetingRoom.room_name.asc()).all()


def list_calendar(db: Session) -> list[dict]:
    meetings = db.query(Meeting).filter(Meeting.meeting_room_id.is_not(None)).order_by(Meeting.start_datetime.asc()).all()
    return [
        {
            "meeting_id": meeting.id,
            "room_id": meeting.meeting_room_id,
            "meeting_title": meeting.meeting_title,
            "meeting_type": meeting.meeting_type,
            "start_datetime": meeting.start_datetime.isoformat(),
            "end_datetime": meeting.end_datetime.isoformat(),
            "status": meeting.status,
        }
        for meeting in meetings
    ]


def create_room(db: Session, payload: MeetingRoomCreate) -> MeetingRoom:
    room = MeetingRoom(**payload.model_dump())
    db.add(room)
    db.commit()
    db.refresh(room)
    return room


def update_room(db: Session, room_id: int, payload: MeetingRoomUpdate) -> MeetingRoom:
    room = db.query(MeetingRoom).filter(MeetingRoom.id == room_id).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting room not found")
    for field, value in payload.model_dump().items():
        setattr(room, field, value)
    db.commit()
    db.refresh(room)
    return room


def delete_room(db: Session, room_id: int) -> None:
    room = db.query(MeetingRoom).filter(MeetingRoom.id == room_id).first()
    if not room:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting room not found")
    try:
        db.delete(room)
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Room cannot be deleted while meetings use it") from error