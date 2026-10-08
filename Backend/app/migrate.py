from pathlib import Path

from .database import engine


MIGRATIONS_DIRECTORY = Path(__file__).with_name("migrations")


def run_migrations() -> None:
    connection = engine.raw_connection()
    try:
        cursor = connection.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version VARCHAR(255) PRIMARY KEY,
                applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        connection.commit()
        cursor.execute("SELECT version FROM schema_migrations")
        applied = {row[0] for row in cursor.fetchall()}

        for migration_path in sorted(MIGRATIONS_DIRECTORY.glob("*.sql")):
            if migration_path.name in applied:
                continue
            sql = migration_path.read_text(encoding="utf-8").strip()
            if sql:
                cursor.execute(sql)
            cursor.execute(
                "INSERT INTO schema_migrations (version) VALUES (%s)",
                (migration_path.name,),
            )
            connection.commit()
            print(f"Applied migration {migration_path.name}")
        cursor.close()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


if __name__ == "__main__":
    run_migrations()
