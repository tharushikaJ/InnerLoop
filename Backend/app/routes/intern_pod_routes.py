from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..schemas.intern_pod_schema import (
    InternPodCreate,
    InternPodMemberCreate,
    InternPodMemberResponse,
    InternPodMemberUpdate,
    InternPodResponse,
    InternPodUpdate,
)
from ..services import intern_pod_service

router = APIRouter(prefix="/api/intern-pods", tags=["intern-pods"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("", response_model=List[InternPodResponse])
def list_intern_pods(
    project_id: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
):
    return intern_pod_service.get_intern_pods(db=db, project_id=project_id)


@router.post("", response_model=InternPodResponse, status_code=status.HTTP_201_CREATED)
def create_intern_pod(
    payload: InternPodCreate,
    db: Session = Depends(get_db),
):
    return intern_pod_service.create_intern_pod(db=db, payload=payload)


@router.get("/{pod_id}", response_model=InternPodResponse)
def get_intern_pod(
    pod_id: int,
    db: Session = Depends(get_db),
):
    return intern_pod_service.get_intern_pod_by_id(db=db, pod_id=pod_id)


@router.put("/{pod_id}", response_model=InternPodResponse)
def update_intern_pod(
    pod_id: int,
    payload: InternPodUpdate,
    db: Session = Depends(get_db),
):
    return intern_pod_service.update_intern_pod(db=db, pod_id=pod_id, payload=payload)


@router.delete("/{pod_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_intern_pod(
    pod_id: int,
    db: Session = Depends(get_db),
):
    intern_pod_service.delete_intern_pod(db=db, pod_id=pod_id)
    return None


@router.get("/{pod_id}/members", response_model=List[InternPodMemberResponse])
def list_intern_pod_members(
    pod_id: int,
    db: Session = Depends(get_db),
):
    return intern_pod_service.get_intern_pod_members(db=db, pod_id=pod_id)


@router.post(
    "/{pod_id}/members",
    response_model=InternPodMemberResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_intern_pod_member(
    pod_id: int,
    payload: InternPodMemberCreate,
    db: Session = Depends(get_db),
):
    return intern_pod_service.add_member_to_pod(db=db, pod_id=pod_id, payload=payload)


@router.put("/{pod_id}/members/{member_id}", response_model=InternPodMemberResponse)
def update_intern_pod_member(
    pod_id: int,
    member_id: int,
    payload: InternPodMemberUpdate,
    db: Session = Depends(get_db),
):
    return intern_pod_service.update_member_in_pod(
        db=db,
        pod_id=pod_id,
        member_id=member_id,
        payload=payload,
    )


@router.delete("/{pod_id}/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_intern_pod_member(
    pod_id: int,
    member_id: int,
    db: Session = Depends(get_db),
):
    intern_pod_service.remove_member_from_pod(db=db, pod_id=pod_id, member_id=member_id)
    return None
