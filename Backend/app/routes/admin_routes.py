from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.audit_log import AuditLog
from ..utils.permissions import require_roles


router = APIRouter(prefix="/api", tags=["administration"])
management_only = require_roles("management")


@router.get("/audit-logs")
def list_audit_logs(_user=Depends(management_only), db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(200).all()
    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "module": log.module,
            "record_id": log.record_id,
            "description": log.description,
            "created_at": log.created_at,
        }
        for log in logs
    ]


@router.get("/settings")
def settings(_user=Depends(management_only)):
    return {
        "roles": ["intern", "employee", "management"],
        "authentication": "jwt_http_only_cookie",
        "service": "innerloop-backend",
    }
