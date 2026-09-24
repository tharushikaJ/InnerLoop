from typing import List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..models.intern_pod import InternPod, InternPodMember
from ..schemas.intern_pod_schema import (
    InternPodCreate,
    InternPodMemberCreate,
    InternPodMemberUpdate,
    InternPodUpdate,
)


def get_intern_pods(db: Session, project_id: Optional[int] = None) -> List[InternPod]:
    query = db.query(InternPod)
    if project_id is not None:
        query = query.filter(InternPod.assigned_project_id == project_id)
    return query.order_by(InternPod.created_at.desc()).all()


def get_intern_pod_by_id(db: Session, pod_id: int) -> InternPod:
    pod = db.query(InternPod).filter(InternPod.id == pod_id).first()
    if not pod:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intern pod not found",
        )
    return pod


def create_intern_pod(db: Session, payload: InternPodCreate) -> InternPod:
    pod = InternPod(**payload.model_dump())
    db.add(pod)
    db.commit()
    db.refresh(pod)
    return pod


def update_intern_pod(db: Session, pod_id: int, payload: InternPodUpdate) -> InternPod:
    pod = get_intern_pod_by_id(db, pod_id)
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(pod, field, value)
    db.commit()
    db.refresh(pod)
    return pod


def delete_intern_pod(db: Session, pod_id: int) -> None:
    pod = get_intern_pod_by_id(db, pod_id)
    db.delete(pod)
    db.commit()


def get_intern_pod_members(db: Session, pod_id: int) -> List[InternPodMember]:
    get_intern_pod_by_id(db, pod_id)
    return (
        db.query(InternPodMember)
        .filter(InternPodMember.pod_id == pod_id)
        .order_by(InternPodMember.created_at.desc())
        .all()
    )


def add_member_to_pod(db: Session, pod_id: int, payload: InternPodMemberCreate) -> InternPodMember:
    get_intern_pod_by_id(db, pod_id)
    member = InternPodMember(pod_id=pod_id, **payload.model_dump())
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


def update_member_in_pod(
    db: Session,
    pod_id: int,
    member_id: int,
    payload: InternPodMemberUpdate,
) -> InternPodMember:
    get_intern_pod_by_id(db, pod_id)
    member = (
        db.query(InternPodMember)
        .filter(InternPodMember.id == member_id, InternPodMember.pod_id == pod_id)
        .first()
    )
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intern pod member not found",
        )

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(member, field, value)
    db.commit()
    db.refresh(member)
    return member


def remove_member_from_pod(db: Session, pod_id: int, member_id: int) -> None:
    get_intern_pod_by_id(db, pod_id)
    member = (
        db.query(InternPodMember)
        .filter(InternPodMember.id == member_id, InternPodMember.pod_id == pod_id)
        .first()
    )
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intern pod member not found",
        )
    db.delete(member)
    db.commit()
