from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from ..repositories.users import UsersRepository
from ..database.database import get_db
from ..database.models import User


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "Messi>Ronaldo"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440

users_repository = UsersRepository()


def hash_password(password: str) -> str:
    """Hash the user's password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify the hashed password matches the plain password."""
    return pwd_context.verify(plain_password, hashed_password)


def create_jwt_token(user_id: int) -> str:
    """Create a JWT token for the given user ID."""
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"user_id": user_id, "exp": expire}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_jwt_token(token: str) -> int:
    """Decode the JWT token and extract the user ID."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=ALGORITHM)
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise JWTError("Invalid token")
        return user_id
    except JWTError as e:
        raise e


def check_user_role(token: str, db: Session, allowed_roles: list):
    """Check if the user's role matches any role in the allowed_roles list."""
    user_id = decode_jwt_token(token)
    user = users_repository.get_user_by_id(db, user_id)

    # Allow admins to bypass any role checks
    if user.role == "Admin":
        return user_id

    # Check if the user has any of the allowed roles
    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=403, detail="You do not have permission to perform this action."
        )

    return user_id


def check_farmer_approval(user_id: int, db: Session = Depends(get_db)):
    """
    Verify that the user is a farmer with is_approved=True.
    """
    user = db.query(User).filter(User.id == user_id, User.role == "Farmer").first()
    if not user:
        raise HTTPException(
            status_code=403, detail="Access forbidden: User is not a farmer."
        )
    if not user.farmer_profile or not user.farmer_profile.is_approved:
        raise HTTPException(
            status_code=403, detail="Access forbidden: Farmer is not approved."
        )
    return user
