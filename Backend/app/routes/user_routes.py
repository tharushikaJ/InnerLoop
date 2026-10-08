from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..schemas.user_schema import SupervisorOption, UserResponse, UserUpdate
from ..services.user_service import active_supervisors, update_user
from ..utils.permissions import require_roles


router = APIRouter(prefix="/api/users", tags=["users"])
management_only = require_roles("management")


@router.get("", response_model=list[UserResponse])
def list_users(_user=Depends(management_only), db: Session = Depends(get_db)):
    return db.query(User).order_by(User.name.asc()).all()


@router.get("/supervisors", response_model=list[SupervisorOption])
def list_supervisors(_user=Depends(management_only), db: Session = Depends(get_db)):
    return active_supervisors(db)


@router.patch("/{user_id}", response_model=UserResponse)
def update(
    user_id: int,
    payload: UserUpdate,
    _user=Depends(management_only),
    db: Session = Depends(get_db),
):
    return update_user(db, user_id, payload)
