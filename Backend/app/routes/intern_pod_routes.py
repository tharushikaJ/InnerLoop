from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas.intern_pod_schema import InternPodCreate, InternPodMemberCreate, InternPodMemberResponse, InternPodResponse, InternPodUpdate
from ..schemas.user_schema import UserResponse
from ..services import intern_pod_service
from ..utils.permissions import require_roles


router = APIRouter(prefix="/api/intern-pods", tags=["intern-pods"])
employee_or_management = require_roles("employee", "management")
employee_only = require_roles("employee")


@router.get("", response_model=list[InternPodResponse])
def list_intern_pods(_user=Depends(employee_or_management), db: Session = Depends(get_db)):
    return intern_pod_service.list_intern_pods(db)


@router.get("/mentors", response_model=list[UserResponse])
def list_mentors(_user=Depends(employee_or_management), db: Session = Depends(get_db)):
    return intern_pod_service.list_mentors(db)


@router.get("/interns", response_model=list[UserResponse])
def list_interns(user=Depends(employee_or_management), db: Session = Depends(get_db)):
    return intern_pod_service.list_interns(db, user)


@router.post("", response_model=InternPodResponse, status_code=status.HTTP_201_CREATED)
def create_intern_pod(payload: InternPodCreate, user=Depends(employee_only), db: Session = Depends(get_db)):
    return intern_pod_service.create_intern_pod(db, payload, user.id)


@router.put("/{pod_id}", response_model=InternPodResponse)
def update_intern_pod(pod_id: int, payload: InternPodUpdate, _user=Depends(employee_only), db: Session = Depends(get_db)):
    return intern_pod_service.update_intern_pod(db, pod_id, payload)


@router.delete("/{pod_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_intern_pod(pod_id: int, _user=Depends(employee_only), db: Session = Depends(get_db)):
    intern_pod_service.delete_intern_pod(db, pod_id)


@router.post("/{pod_id}/members", response_model=InternPodMemberResponse, status_code=status.HTTP_201_CREATED)
def add_member(pod_id: int, payload: InternPodMemberCreate, user=Depends(employee_only), db: Session = Depends(get_db)):
    return intern_pod_service.add_member(db, pod_id, payload, user.id)


@router.delete("/{pod_id}/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_member(pod_id: int, member_id: int, _user=Depends(employee_only), db: Session = Depends(get_db)):
    intern_pod_service.remove_member(db, pod_id, member_id)
