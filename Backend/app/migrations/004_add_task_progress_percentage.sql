BEGIN;

ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS progress_percentage NUMERIC(5,2) NOT NULL DEFAULT 0
    CHECK (progress_percentage >= 0 AND progress_percentage <= 100);

COMMIT;
