import os
import smtplib
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from typing import Optional

from fastapi import APIRouter, Depends, Response, HTTPException, Form, status
from fastapi.responses import JSONResponse
from jose import jwt
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from pydantic import EmailStr

from ..repositories.users import UsersRepository
from ..schemas.users import UserCreate, UserLogin, UserUpdate, UserInfo, PasswordResetRequest, PasswordResetConfirm
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
SECRET_KEY = "Messi>Ronaldo"
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USER = os.getenv("EMAIL_USER", "your_email@example.com")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "your_email_password")


# Registration endpoint
@router.post("/users", status_code=200)
def post_signup(user_input: UserCreate, db: Session = Depends(get_db)):
    if user_input.role not in VALID_ROLES:
        raise HTTPException(status_code=400,
                            detail=f"Invalid role: {user_input.role}. Allowed roles are: {', '.join(VALID_ROLES)}")
    user_input.password = hash_password(user_input.password)
    new_user = users_repository.create_user(db, user_input)
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"message": "Successfully signed up.", "user_id": new_user.id}
    )


# Login endpoint using email
@router.post("/users/login")
def post_login(login_data: UserLogin, db: Session = Depends(get_db)):
    user_data = UserLogin(email=login_data.email, password=login_data.password)
    user = users_repository.get_user_by_email(db, user_data.email)
    if not verify_password(login_data.password, user.password_hashed):
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
    updated_user = users_repository.update_user(db, user_id, user_input)
    return JSONResponse(content={"message": "User updated successfully", "user": updated_user}, status_code=200)


# Get current user info
@router.get("/users/me", response_model=UserInfo, status_code=200)
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

@router.get("/users/{user_id}", response_model=UserInfo, status_code=200)
def get_user_id(user_id: int, db: Session = Depends(get_db)):
    """
    Fetch user information by user ID.
    """

    # Fetch the user from the database
    user = users_repository.get_user_by_id(db, user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Return user information
    return UserInfo(
        id=user.id,
        fullname=user.fullname,
        email=user.email,
        phone=user.phone,
        role=user.role,
    )


@router.post("/auth/request-password-reset")
def request_password_reset(
        data: PasswordResetRequest,
        token: Optional[str] = Depends(oauth2_scheme),
        db: Session = Depends(get_db),
):
    """
    Endpoint to request a password reset.
    If token is provided, email is taken from the token.
    Otherwise, the user must provide their email.
    """
    if token:
        # Decode user ID from the token
        user_id = decode_jwt_token(token)
        user = users_repository.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")
    else:
        if not data.email:
            raise HTTPException(status_code=400, detail="Email must be provided if token is not present.")
        user = users_repository.get_user_by_email(db, data.email)
        if not user:
            raise HTTPException(status_code=404, detail="User with this email does not exist.")

    # Generate password reset token
    reset_token = jwt.encode(
        {
            "user_id": user.id,
            "exp": datetime.utcnow() + timedelta(hours=1),  # Token valid for 1 hour
        },
        SECRET_KEY,
        algorithm="HS256",
    )

    # Create reset link
    reset_link = f"http://your-frontend-url/reset-password?token={reset_token}"

    # Send email
    try:
        send_email(
            to_email=user.email,
            subject="Password Reset Request",
            body=f"Hello {user.fullname},\n\nClick the link below to reset your password:\n\n{reset_link}\n\nIf you did not request this, ignore this email.",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to send email.") from e

    return {"message": "Password reset email sent."}


@router.post("/auth/reset-password")
def reset_password(data: PasswordResetConfirm, db: Session = Depends(get_db)):
    """
    Endpoint to reset password using a token.
    """
    try:
        # Decode the token
        payload = jwt.decode(data.token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=400, detail="Invalid token.")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=400, detail="Token expired.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=400, detail="Invalid token.")

    user = users_repository.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    user.password = hash_password(data.new_password)
    db.commit()

    return {"message": "Password reset successfully."}


def send_email(to_email: str, subject: str, body: str):
    """
    Function to send an email using smtplib.
    """
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = EMAIL_USER
    msg["To"] = to_email

    with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASSWORD)
        server.sendmail(EMAIL_USER, to_email, msg.as_string())
