from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import BigInteger, Date, DateTime, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class InternPod(Base):
    __tablename__ = "intern_pods"

    id: Mapped[int] = mapped_column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True)
    pod_name: Mapped[str] = mapped_column(String(150), nullable=False)
    assigned_project_id: Mapped[int | None] = mapped_column(BigInteger)
    assigned_feature_module: Mapped[str | None] = mapped_column(String(255))
    mentor_employee_id: Mapped[int | None] = mapped_column(BigInteger)
    start_date: Mapped[date | None] = mapped_column(Date)
    target_date: Mapped[date | None] = mapped_column(Date)
    status: Mapped[str | None] = mapped_column(String(50))
    progress_percentage: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


class InternPodMember(Base):
    __tablename__ = "intern_pod_members"

    id: Mapped[int] = mapped_column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True)
    pod_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    intern_user_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    status: Mapped[str | None] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
