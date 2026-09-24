from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..schemas.user_schema import UserResponse
from ..utils.permissions import require_roles


router = APIRouter(prefix="/api/users", tags=["users"])
management_only = require_roles("management")


@router.get("", response_model=list[UserResponse])
def list_users(_user=Depends(management_only), db: Session = Depends(get_db)):
    return db.query(User).order_by(User.name.asc()).all()
