from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..models.user import User
from ..schemas.user_schema import UserUpdate


def active_supervisors(db: Session) -> list[User]:
    return db.query(User).filter(
        User.role == "employee", User.status == "active"
    ).order_by(User.name.asc()).all()


def update_user(db: Session, user_id: int, payload: UserUpdate) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    values = payload.model_dump(exclude_unset=True)
    resulting_role = values.get("role", user.role)
    resulting_status = values.get("status", user.status)
    supervisor_id = values.get("assigned_supervisor_id", user.assigned_supervisor_id)

    if resulting_role != "intern":
        if values.get("assigned_supervisor_id") is not None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only interns can have an assigned supervisor.")
        supervisor_id = None
        values["assigned_supervisor_id"] = None

    if supervisor_id == user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A user cannot be assigned as their own supervisor.")
    if supervisor_id is not None:
        supervisor = db.query(User).filter(
            User.id == supervisor_id, User.role == "employee", User.status == "active"
        ).first()
        if not supervisor:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The selected supervisor is not an active employee or does not exist.",
            )

    loses_supervisor_eligibility = user.role == "employee" and (
        resulting_role != "employee" or resulting_status != "active"
    )
    if loses_supervisor_eligibility:
        db.query(User).filter(User.assigned_supervisor_id == user.id).update(
            {User.assigned_supervisor_id: None}, synchronize_session=False
        )

    for field, value in values.items():
        setattr(user, field, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A user with this email already exists.") from None
    db.refresh(user)
    return user
