from pydantic import BaseModel, ConfigDict


class MeetingRoomResponse(BaseModel):
    id: int
    room_name: str
    location: str | None = None
    capacity: int | None = None
    status: str | None = None

    model_config = ConfigDict(from_attributes=True)


class MeetingRoomCreate(BaseModel):
    room_name: str
    location: str | None = None
    capacity: int | None = None
    status: str = "Available"


class MeetingRoomUpdate(MeetingRoomCreate):
    pass


class RoomCalendarEntry(BaseModel):
    meeting_id: int
    room_id: int
    meeting_title: str
    meeting_type: str | None = None
    start_datetime: str
    end_datetime: str
    status: str | None = None
