from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..models.user import User
from ..schemas.auth_schema import LoginRequest, RegisterRequest
from ..utils.security import hash_password, verify_password


INVALID_CREDENTIALS = "Invalid email or password."


def register_user(db: Session, payload: RegisterRequest) -> User:
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    supervisor = None
    if payload.assigned_supervisor_id is not None:
        supervisor = db.query(User).filter(
            User.id == payload.assigned_supervisor_id,
            User.role == "employee",
            User.status == "active",
        ).first()
        if not supervisor:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The selected supervisor is not an active employee or does not exist.",
            )

    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=payload.role,
        designation=payload.designation,
        department=payload.department,
        assigned_supervisor_id=supervisor.id if supervisor else None,
        status="active",
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        ) from None
    db.refresh(user)
    return user


def authenticate_user(db: Session, payload: LoginRequest) -> User:
    user = db.query(User).filter(User.email == payload.email).first()
    valid = (
        user is not None
        and user.status == "active"
        and verify_password(payload.password, user.password_hash)
    )
    if not valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=INVALID_CREDENTIALS,
        )
    return user


def get_active_user(db: Session, user_id: int) -> User:
    user = db.query(User).filter(User.id == user_id, User.status == "active").first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )
    return user
