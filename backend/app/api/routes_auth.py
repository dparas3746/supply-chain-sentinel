from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.organization import User, Organization
from app.schemas.auth import LoginRequest, TokenResponse, UserResponse
from app.security.auth import verify_password, create_access_token, get_current_user
from app.services.audit_service import AuditLoggerService

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials"
        )

    org = db.query(Organization).filter(Organization.id == user.org_id).first()
    token = create_access_token(data={"sub": user.id, "org_id": user.org_id, "role": user.role})

    AuditLoggerService.log_event(
        db,
        org_id=user.org_id,
        action="USER_LOGIN_SUCCESS",
        target_resource=user.email,
        user_id=user.id,
        details={"role": user.role}
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in=28800,
        user=UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            org_id=user.org_id,
            org_name=org.name if org else "Default Organization",
            created_at=user.created_at
        )
    )

@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    org = db.query(Organization).filter(Organization.id == current_user.org_id).first()
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        org_id=current_user.org_id,
        org_name=org.name if org else "Enterprise Organization",
        created_at=current_user.created_at
    )
