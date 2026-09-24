from datetime import date, datetime

from sqlalchemy import BigInteger, Date, DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True)
    task_title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    project_id: Mapped[int | None] = mapped_column(BigInteger)
    assigned_user_id: Mapped[int | None] = mapped_column(BigInteger)
    assigned_intern_pod_id: Mapped[int | None] = mapped_column(BigInteger)
    priority: Mapped[str | None] = mapped_column(String(50))
    status: Mapped[str | None] = mapped_column(String(50))
    due_date: Mapped[date | None] = mapped_column(Date)
    progress_note: Mapped[str | None] = mapped_column(Text)
    created_source: Mapped[str | None] = mapped_column(String(100))
    completion_evidence_link: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
