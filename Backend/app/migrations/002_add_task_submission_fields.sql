ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS submission_status VARCHAR(50) NOT NULL DEFAULT 'Not submitted',
    ADD COLUMN IF NOT EXISTS supervisor_feedback TEXT;
