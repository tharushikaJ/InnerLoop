from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.intern_pod import InternPod
from ..schemas.intern_pod_schema import InternPodResponse
from ..utils.permissions import require_roles


router = APIRouter(prefix="/api/intern-pods", tags=["intern-pods"])
employee_or_management = require_roles("employee", "management")


@router.get("", response_model=list[InternPodResponse])
def list_intern_pods(_user=Depends(employee_or_management), db: Session = Depends(get_db)):
    return db.query(InternPod).order_by(InternPod.updated_at.desc()).all()
