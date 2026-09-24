from datetime import datetime

from sqlalchemy import Column, Date, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from ..database import Base


class InternPod(Base):
    __tablename__ = "intern_pods"

    id = Column(Integer, primary_key=True, index=True)
    pod_name = Column(String(150), nullable=False)
    assigned_project_id = Column(Integer, nullable=True)
    assigned_feature_module = Column(String(200), nullable=True)
    mentor_employee_id = Column(Integer, nullable=True)
    start_date = Column(Date, nullable=True)
    target_date = Column(Date, nullable=True)
    status = Column(String(50), default="Active", nullable=False)
    progress_percentage = Column(Float, default=0.0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    members = relationship(
        "InternPodMember",
        back_populates="pod",
        cascade="all, delete-orphan",
    )


class InternPodMember(Base):
    __tablename__ = "intern_pod_members"

    id = Column(Integer, primary_key=True, index=True)
    pod_id = Column(Integer, ForeignKey("intern_pods.id"), nullable=False)
    intern_user_id = Column(Integer, nullable=False)
    status = Column(String(50), default="Assigned", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    pod = relationship("InternPod", back_populates="members")
