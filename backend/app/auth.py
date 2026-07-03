from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings
from app.database import get_supabase
from app.schemas import UserRole
from supabase import Client #type: ignore
from fastapi import Header, HTTPException, status
from jose import JWTError, jwt
from app.config import settings
from app.database import db

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Bearer scheme
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def decode_access_token(token: str) -> Dict[str, Any]:
    """Decode and verify JWT token"""
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
from app.database import db     
from fastapi import Header, HTTPException, status
from app.database import db


async def get_current_user(
    authorization: str = Header(None),
):
    """
    Get current authenticated user
    using Supabase session JWT
    """

    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
        )

    # Expect: Bearer <token>
    try:
        scheme, token = authorization.split()

        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=401,
                detail="Invalid auth scheme",
            )

    except ValueError:
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization format",
        )

    try:
        supabase = db.get_admin_client()

        # 🔐 Verify Supabase JWT
        user_response = supabase.auth.get_user(token)

        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired token",
            )

        user = user_response.user
        metadata = user.user_metadata or {}

        return {
            "id": user.id,
            "email": user.email,
            "username": metadata.get("username"),
            "phone_number": metadata.get("phone_number"),
            "role": metadata.get("role", "customer"),
            "created_at": user.created_at,
        }

    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Auth failed: {str(e)}",
        )

class RoleChecker:
    """Dependency for checking user roles"""
    
    def __init__(self, allowed_roles: list[UserRole]):
        self.allowed_roles = allowed_roles
    
    async def __call__(self, current_user: dict = Depends(get_current_user)) -> dict:
        user_role = current_user.get("role")
        
        if user_role not in [role.value for role in self.allowed_roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {[r.value for r in self.allowed_roles]}"
            )
        
        return current_user


# Role-specific dependencies
require_customer = RoleChecker([UserRole.CUSTOMER, UserRole.STAFF, UserRole.ADMIN])
require_staff = RoleChecker([UserRole.STAFF, UserRole.ADMIN])
require_admin = RoleChecker([UserRole.ADMIN])


def verify_staff_access_code(code: str) -> bool:
    """Verify staff access code"""
    return code == settings.STAFF_ACCESS_CODE
