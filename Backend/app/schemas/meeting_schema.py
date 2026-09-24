from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MeetingResponse(BaseModel):
    id: int
    meeting_title: str
    meeting_type: str | None = None
    start_datetime: datetime
    end_datetime: datetime
    meeting_room_id: int | None = None
    status: str | None = None
    meeting_minutes: str | None = None
    created_by: int | None = None

    model_config = ConfigDict(from_attributes=True)
