BEGIN;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS assigned_supervisor_id BIGINT DEFAULT NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_user_assigned_supervisor') THEN
        ALTER TABLE users ADD CONSTRAINT fk_user_assigned_supervisor
            FOREIGN KEY (assigned_supervisor_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_user_supervisor_role') THEN
        ALTER TABLE users ADD CONSTRAINT check_user_supervisor_role
            CHECK (role = 'intern' OR assigned_supervisor_id IS NULL);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_assigned_supervisor ON users(assigned_supervisor_id);

CREATE OR REPLACE FUNCTION enforce_user_supervisor_assignment()
RETURNS TRIGGER AS $$
DECLARE
    supervisor_role VARCHAR(50);
    supervisor_status VARCHAR(50);
BEGIN
    IF NEW.role <> 'intern' AND NEW.assigned_supervisor_id IS NOT NULL THEN
        RAISE EXCEPTION 'Only interns can have an assigned supervisor.';
    END IF;
    IF NEW.assigned_supervisor_id IS NOT NULL THEN
        IF NEW.id IS NOT NULL AND NEW.assigned_supervisor_id = NEW.id THEN
            RAISE EXCEPTION 'A user cannot be assigned as their own supervisor.';
        END IF;
        SELECT role, status INTO supervisor_role, supervisor_status
        FROM users WHERE id = NEW.assigned_supervisor_id;
        IF NOT FOUND OR supervisor_role <> 'employee' OR supervisor_status <> 'active' THEN
            RAISE EXCEPTION 'The selected supervisor must be an active employee.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_user_supervisor ON users;
CREATE TRIGGER trg_validate_user_supervisor
BEFORE INSERT OR UPDATE OF role, status, assigned_supervisor_id ON users
FOR EACH ROW EXECUTE FUNCTION enforce_user_supervisor_assignment();

CREATE OR REPLACE FUNCTION clear_invalid_supervisor_assignments()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.role = 'employee' AND (NEW.role <> 'employee' OR NEW.status <> 'active') THEN
        UPDATE users SET assigned_supervisor_id = NULL WHERE assigned_supervisor_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_clear_invalid_supervisor_assignments ON users;
CREATE TRIGGER trg_clear_invalid_supervisor_assignments
AFTER UPDATE OF role, status ON users
FOR EACH ROW EXECUTE FUNCTION clear_invalid_supervisor_assignments();

COMMIT;
