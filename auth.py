import os
from datetime import datetime, timedelta

from dotenv import load_dotenv
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


# Load environment variables
load_dotenv()


# JWT configuration
SECRET = os.getenv("JWT_SECRET")
ALGO = "HS256"


# Password hashing
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# OAuth2 bearer token
security = HTTPBearer()


# ============================================================
# PASSWORD FUNCTIONS
# ============================================================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(
    password: str,
    hashed_password: str
) -> bool:

    return pwd_context.verify(
        password,
        hashed_password
    )


# ============================================================
# JWT FUNCTIONS
# ============================================================

def create_token(data: dict) -> str:

    if not SECRET:
        raise RuntimeError(
            "JWT_SECRET is not configured in .env"
        )

    to_encode = data.copy()

    to_encode["exp"] = (
        datetime.utcnow()
        + timedelta(hours=8)
    )

    return jwt.encode(
        to_encode,
        SECRET,
        algorithm=ALGO
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:

    if not SECRET:
        raise RuntimeError(
            "JWT_SECRET is not configured in .env"
        )

    token = credentials.credentials

    try:

        payload = jwt.decode(
            token,
            SECRET,
            algorithms=[ALGO]
        )

        employee_id = payload.get("sub")
        role = payload.get("role")

        if not employee_id or not role:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token"
            )

        return payload

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )