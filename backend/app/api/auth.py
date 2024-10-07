from fastapi import APIRouter, Depends, Response, HTTPException, Form
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from pydantic import EmailStr
from ..repositories.users import UsersRepository
from ..schemas.users import UserCreate, UserLogin, UserUpdate, UserInfo
from ..database.database import get_db
from ..utils.security import (
    hash_password,
    verify_password,
    create_jwt_token,
    decode_jwt_token,
)

router = APIRouter()
users_repository = UsersRepository()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/users/login")
VALID_ROLES = {"Farmer", "Buyer", "Admin"}


# Registration endpoint
@router.post("/users")
def post_signup(user_input: UserCreate, db: Session = Depends(get_db)):
    if user_input.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail=f"Invalid role: {user_input.role}. Allowed roles are: {', '.join(VALID_ROLES)}")
    user_input.password = hash_password(user_input.password)
    new_user = users_repository.create_user(db, user_input)
    return Response(
        status_code=200, content=f"Successfully signed up. User ID = {new_user.id}"
    )


# Login endpoint using email
@router.post("/users/login")
def post_login(
    username: EmailStr = Form(), password: str = Form(), db: Session = Depends(get_db)
):
    user_data = UserLogin(email=username, password=password)
    user = users_repository.get_user_by_email(db, user_data.email)
    if not verify_password(password, user.password_hashed):
        raise HTTPException(
            status_code=401,
            detail="Incorrect password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_jwt_token(user.id)
    return {"access_token": access_token, "token_type": "bearer"}


# Update user profile
@router.patch("/users/me")
def patch_user(
    user_input: UserUpdate,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    user_id = decode_jwt_token(token)
    user_input.password = hash_password(user_input.password)
    users_repository.update_user(db, user_id, user_input)
    return Response(content="User updated successfully", status_code=200)


# Get current user info
@router.get("/users/me", response_model=UserInfo)
def get_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user_id = decode_jwt_token(token)
    user = users_repository.get_user_by_id(db, user_id)
    return UserInfo(
        id=user_id,
        fullname=user.fullname,
        email=user.email,
        phone=user.phone,
        role=user.role,
    )
