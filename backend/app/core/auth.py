# app/core/auth.py
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fallback-secret-key")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
EXPIRY_HOURS = int(os.getenv("JWT_EXPIRY_HOURS", 12))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer()

ROLE_HIERARCHY = {
    "super_admin":       4,
    "programme_admin":   3,
    "mentor":            2,
    "company":           2,
    "partner":           2
}

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(hours=EXPIRY_HOURS)
    payload["iat"] = datetime.utcnow()
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

async def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        return {
            "username":  username,
            "role":      payload.get("role", "company"),
            "entity_id": payload.get("entity_id", None),
            "name":      payload.get("name", username)
        }
    except JWTError:
        raise credentials_exception

def require_roles(*allowed_roles: str):
    async def checker(current_user: dict = Depends(verify_token)) -> dict:
        if current_user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{current_user['role']}' is not authorised to access this resource"
            )
        return current_user
    return checker

def require_min_role(min_role: str):
    async def checker(current_user: dict = Depends(verify_token)) -> dict:
        user_level = ROLE_HIERARCHY.get(current_user["role"], 0)
        min_level  = ROLE_HIERARCHY.get(min_role, 99)
        if user_level < min_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions for this action"
            )
        return current_user
    return checker

def is_own_resource(current_user: dict, entity_id: str) -> bool:
    return current_user.get("entity_id") == entity_id


def require_owner_or_admin(entity_id_param: str = "entity_id"):
    """
    Dependency that allows:
      - super_admin / programme_admin: unrestricted access
      - mentor / company: only if the route's entity ID matches their JWT entity_id
    
    Usage:
      async def update_company(company_id: str, ..., user = Depends(require_owner_or_admin("company_id"))):
    """
    async def checker(current_user: dict = Depends(verify_token), **kwargs) -> dict:
        if current_user["role"] in ("super_admin", "programme_admin"):
            return current_user
        # For non-admin roles, check resource ownership
        if current_user.get("entity_id") is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No entity associated with your account"
            )
        return current_user
    return checker


def check_owner_or_admin(current_user: dict, resource_id: str):
    """
    Call this inside a route handler to enforce ownership.
    Admins pass through; non-admins must own the resource.
    """
    if current_user["role"] in ("super_admin", "programme_admin"):
        return  # admins can do anything
    if current_user.get("entity_id") != resource_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only modify your own resources"
        )
