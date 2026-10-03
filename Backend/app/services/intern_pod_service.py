from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..models.intern_pod import InternPod, InternPodMember
from ..models.user import User
from ..schemas.intern_pod_schema import InternPodCreate, InternPodMemberCreate, InternPodUpdate


def get_intern_pod(db: Session, pod_id: int) -> InternPod:
    pod = db.query(InternPod).filter(InternPod.id == pod_id).first()
    if not pod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Intern pod not found")
    return pod


def list_intern_pods(db: Session) -> list[InternPod]:
    return db.query(InternPod).order_by(InternPod.updated_at.desc()).all()


def list_mentors(db: Session) -> list[User]:
    return db.query(User).filter(User.role == "employee").order_by(User.name.asc()).all()


def list_interns(db: Session) -> list[User]:
    return db.query(User).filter(User.role == "intern").order_by(User.name.asc()).all()


def create_intern_pod(db: Session, payload: InternPodCreate) -> InternPod:
    pod = InternPod(**payload.model_dump())
    db.add(pod)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Selected project or mentor does not exist") from error
    db.refresh(pod)
    return pod


def update_intern_pod(db: Session, pod_id: int, payload: InternPodUpdate) -> InternPod:
    pod = get_intern_pod(db, pod_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(pod, field, value)
    db.commit()
    db.refresh(pod)
    return pod


def delete_intern_pod(db: Session, pod_id: int) -> None:
    db.delete(get_intern_pod(db, pod_id))
    db.commit()


def add_member(db: Session, pod_id: int, payload: InternPodMemberCreate) -> InternPodMember:
    get_intern_pod(db, pod_id)
    member = InternPodMember(pod_id=pod_id, **payload.model_dump())
    db.add(member)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User does not exist or is already assigned to this pod") from error
    db.refresh(member)
    return member


def remove_member(db: Session, pod_id: int, member_id: int) -> None:
    get_intern_pod(db, pod_id)
    member = db.query(InternPodMember).filter(InternPodMember.id == member_id, InternPodMember.pod_id == pod_id).first()
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Intern pod member not found")
    db.delete(member)
    db.commit()
