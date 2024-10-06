from fastapi import APIRouter, Depends, Response, HTTPException
from sqlalchemy.orm import Session
from ..repositories.users import UsersRepository
from ..schemas.farmers import FarmerProfileCreate
from ..schemas.buyers import BuyerProfileCreate
from ..database.database import get_db
from fastapi.security import OAuth2PasswordBearer
from ..utils.security import decode_jwt_token, check_user_role
from .auth import users_repository

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/users/login")


# Create a farmer profile (Farmers and Admins)
@router.post("/farmer/")
def create_farmer_profile(
    profile_data: FarmerProfileCreate,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    check_user_role(token, db, ["Farmer", "Admin"])
    user_id = decode_jwt_token(token)
    users_repository.create_profile(db, user_id, profile_data)
    return Response(content="Farmer profile created", status_code=200)


# Create a buyer profile (Buyers and Admins)
@router.post("/buyer/")
def create_buyer_profile(
    profile_data: BuyerProfileCreate,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    check_user_role(token, db, ["Buyer", "Admin"])
    user_id = decode_jwt_token(token)
    users_repository.create_profile(db, user_id, profile_data)
    return Response(content="Buyer profile created", status_code=200)


# Get current user's profile
@router.get("/me")
def get_profile(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user_id = decode_jwt_token(token)
    user = users_repository.get_user_by_id(db, user_id)

    # Use the 'profile' property
    profile = user.profile

    if user.role == "Admin":
        return {"message": "Admin users do not have a specific profile."}
    elif not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return profile
