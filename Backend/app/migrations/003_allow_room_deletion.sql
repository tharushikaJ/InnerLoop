BEGIN;

ALTER TABLE meetings
    DROP CONSTRAINT IF EXISTS fk_meeting_room;

ALTER TABLE meetings
    ADD CONSTRAINT fk_meeting_room
    FOREIGN KEY (meeting_room_id)
    REFERENCES meeting_rooms(id)
    ON DELETE SET NULL;

COMMIT;
