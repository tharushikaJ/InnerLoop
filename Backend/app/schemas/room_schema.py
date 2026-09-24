from pydantic import BaseModel, ConfigDict


class MeetingRoomResponse(BaseModel):
    id: int
    room_name: str
    location: str | None = None
    capacity: int | None = None
    status: str | None = None

    model_config = ConfigDict(from_attributes=True)
