from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import Optional, List
import logging

from app.core.auth import (
    hash_password,
    verify_password,
    create_access_token,
    verify_token,
    require_roles,
)
from app.services import dal

router = APIRouter()
logger = logging.getLogger(__name__)

# ── Firestore collection for users ─────────────────────────────────
USERS_COLLECTION = "users"

# ── Seed users (created in Firestore on first boot) ────────────────
SEED_USERS = [
    {
        "username": "superadmin",
        "password": "admin123",
        "role": "super_admin",
        "name": "Super Admin",
        "entity_id": None,
    },
    {
        "username": "progadmin",
        "password": "admin123",
        "role": "programme_admin",
        "name": "Programme Admin",
        "entity_id": None,
    },
    {
        "username": "mentor01",
        "password": "mentor123",
        "role": "mentor",
        "name": "Azri Hassan",
        "entity_id": "mentor-azri-hassan",
    },
    {
        "username": "company01",
        "password": "company123",
        "role": "company",
        "name": "DataCo KL",
        "entity_id": "company-dataco-kl",
    },
]


async def seed_default_users():
    """Create default users in Firestore if they don't already exist."""
    from app.services.firestore import get_firestore_client
    db = get_firestore_client()
    
    for user in SEED_USERS:
        doc_ref = db.collection(USERS_COLLECTION).document(user["username"])
        doc = await doc_ref.get()
        if not doc.exists:
            await doc_ref.set({
                "username":  user["username"],
                "password":  hash_password(user["password"]),
                "role":      user["role"],
                "name":      user["name"],
                "entity_id": user["entity_id"],
            })
            logger.info(f"Seeded user: {user['username']}")
        else:
            logger.debug(f"User already exists: {user['username']}")


async def _get_user(username: str) -> Optional[dict]:
    """Fetch a user from Firestore by username (document ID)."""
    from app.services.firestore import get_firestore_client
    db = get_firestore_client()
    doc = await db.collection(USERS_COLLECTION).document(username).get()
    if doc.exists:
        return doc.to_dict()
    return None


async def _list_users() -> List[dict]:
    """List all users from Firestore."""
    from app.services.firestore import get_firestore_client
    db = get_firestore_client()
    docs = db.collection(USERS_COLLECTION).stream()
    users = []
    async for doc in docs:
        data = doc.to_dict()
        users.append({
            "username":  data.get("username", doc.id),
            "role":      data.get("role"),
            "name":      data.get("name"),
            "entity_id": data.get("entity_id"),
        })
    return users


# ── Request / Response models ──────────────────────────────────────
class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class MeResponse(BaseModel):
    username: str
    role: str
    name: str
    entity_id: str | None = None


class RegisterUserRequest(BaseModel):
    username: str
    password: str
    role: str
    name: str
    entity_id: Optional[str] = None


class UserResponse(BaseModel):
    username: str
    role: str
    name: str
    entity_id: Optional[str] = None


# ── Routes ─────────────────────────────────────────────────────────


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Authenticate with username/password and receive a JWT."""
    user = await _get_user(request.username)
    if not user or not verify_password(request.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    token = create_access_token({
        "sub":       user["username"],
        "role":      user["role"],
        "name":      user["name"],
        "entity_id": user.get("entity_id"),
    })

    return LoginResponse(
        access_token=token,
        user={
            "username":  user["username"],
            "role":      user["role"],
            "name":      user["name"],
            "entity_id": user.get("entity_id"),
        },
    )


@router.get("/me", response_model=MeResponse)
async def get_current_user(current_user: dict = Depends(verify_token)):
    """Return the currently authenticated user's profile."""
    return MeResponse(**current_user)


@router.post("/logout")
async def logout():
    """Logout endpoint (stateless JWT — frontend clears the token)."""
    return {"message": "Logged out successfully"}


# ── Admin-only user management ─────────────────────────────────────
@router.get("/users", response_model=List[UserResponse])
async def list_all_users(_user: dict = Depends(require_roles("super_admin"))):
    """List all registered users (super_admin only)."""
    return await _list_users()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(request: RegisterUserRequest, _user: dict = Depends(require_roles("super_admin"))):
    """Create a new user (super_admin only)."""
    valid_roles = ["super_admin", "programme_admin", "mentor", "company", "partner"]
    if request.role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
        )

    existing = await _get_user(request.username)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"User '{request.username}' already exists"
        )

    from app.services.firestore import get_firestore_client
    db = get_firestore_client()
    await db.collection(USERS_COLLECTION).document(request.username).set({
        "username":  request.username,
        "password":  hash_password(request.password),
        "role":      request.role,
        "name":      request.name,
        "entity_id": request.entity_id,
    })

    return UserResponse(
        username=request.username,
        role=request.role,
        name=request.name,
        entity_id=request.entity_id,
    )


@router.delete("/users/{username}")
async def delete_user(username: str, _user: dict = Depends(require_roles("super_admin"))):
    """Delete a user (super_admin only). Cannot delete yourself."""
    if username == _user["username"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )

    existing = await _get_user(username)
    if not existing:
        raise HTTPException(status_code=404, detail=f"User '{username}' not found")

    from app.services.firestore import get_firestore_client
    db = get_firestore_client()
    await db.collection(USERS_COLLECTION).document(username).delete()

    return {"message": f"User '{username}' deleted successfully"}
