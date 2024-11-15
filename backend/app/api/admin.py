from typing import List

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..repositories.buyers import BuyersRepository
from ..repositories.farmers import FarmersRepository
from ..repositories.users import UsersRepository
from ..schemas.buyers import BuyerProfileWithUserInfo, BuyerProfileInfo
from ..schemas.farmers import FarmerInfo
from ..schemas.users import FarmerProfileInfo, ProfileInfo, UserInfo, UserUpdate
from ..utils.security import decode_jwt_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/users/login")
users_repository = UsersRepository()
def admin_required(
        token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    user_id = decode_jwt_token(token)
    user = users_repository.get_user_by_id(db, user_id)
    if user.role != "Admin":
        raise HTTPException(status_code=403, detail="Insufficient permissions.")
    return user

farmers_repository = FarmersRepository()
buyers_repository = BuyersRepository()
router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(admin_required)],
)

# 1. Get all farmers with their data
# @router.get("/", response_model=list[FarmerInfo])
# def get_all_farmers(db: Session = Depends(get_db)):
#     """Fetch all farmers with their profile data."""
#     farmers = farmers_repository.get_all_farmers(db)
#     return farmers


@router.get("/farmers", response_model=list[FarmerProfileInfo])
def get_all_farmers(db: Session = Depends(get_db)):
    """
    Fetch all farmers with their profile data.
    """
    # Fetch farmers with their user and profile data
    farmers = farmers_repository.get_all_farmers(db)
    serialized_farmers = [
        FarmerProfileInfo(
            id=farmer.id,
            fullname=farmer.fullname,
            email=farmer.email,
            phone=farmer.phone,
            role=farmer.role,
            profile=ProfileInfo(
                farm_name=farmer.farmer_profile.farm_name,
                location=farmer.farmer_profile.location,
                farm_size=farmer.farmer_profile.farm_size,
                is_approved=farmer.farmer_profile.is_approved,
                user_id=farmer.farmer_profile.user_id,
            )
            if farmer.farmer_profile
            else None,
        )
        for farmer in farmers
    ]
    return serialized_farmers


@router.get("/buyers", response_model=list[BuyerProfileWithUserInfo])
def get_all_buyers(db: Session = Depends(get_db)):
    """
    Fetch all buyers with their profile data.
    """
    # Fetch buyers with their user and profile data
    buyers = buyers_repository.get_all_buyers(db)
    serialized_buyers = [
        BuyerProfileWithUserInfo(
            id=buyer.id,
            fullname=buyer.fullname,
            email=buyer.email,
            phone=buyer.phone,
            role=buyer.role,
            profile=(
                BuyerProfileInfo(
                    delivery_address=buyer.buyer_profile.delivery_address,
                    user_id=buyer.buyer_profile.user_id,
                )
                if buyer.buyer_profile
                else None
            ),
        )
        for buyer in buyers
    ]
    return serialized_buyers


# # 2. Approve a farmer profile by user_id
# @router.patch("/{user_id}/approve")
# def approve_farmer(user_id: int, db: Session = Depends(get_db)):
#     """Set is_approved to True for a farmer profile by user_id."""
#     farmer = farmers_repository.approve_farmer(db, user_id)
#     if not farmer:
#         raise HTTPException(status_code=404, detail="Farmer profile not found")
#     return {"message": f"Farmer profile for user_id {user_id} approved successfully"}

@router.patch("/{user_id}/approve")
def approve_farmer(user_id: int, is_approved: bool, db: Session = Depends(get_db)):
    """
    Set is_approved to True or False for a farmer profile by user_id.
    
    Query Parameter:
    - is_approved (bool): The new approval status.
    """
    farmer = farmers_repository.update_farmer_approval(db, user_id, is_approved)
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer profile not found")

    status_message = "approved" if is_approved else "disapproved"
    return {"message": f"Farmer profile for user_id {user_id} has been {status_message}."}

# Endpoint to get all users
@router.get("/users", response_model=List[UserInfo])
def get_all_users( db: Session = Depends(get_db)):
    users = users_repository.get_all_users(db)
    return [
        UserInfo(
            id=user.id,
            fullname=user.fullname,
            email=user.email,
            phone=str(user.phone),
            role=user.role,
        )
        for user in users
    ]


# Endpoint to get a user by ID
@router.get("/users/{user_id}", response_model=UserInfo)
def get_user_by_id(
        user_id: int,
        db: Session = Depends(get_db),
):
    user = users_repository.get_user_by_id(db, user_id)
    return UserInfo(
        id=user.id,
        fullname=user.fullname,
        email=user.email,
        phone=str(user.phone),
        role=user.role,
    )


# Endpoint to update a user
@router.patch("/users/{user_id}")
def update_user(
        user_id: int,
        user_input: UserUpdate,
        db: Session = Depends(get_db),
):
    updated_user = users_repository.update_user(db, user_id, user_input)
    return {
        "message": "User updated successfully",
        "user": updated_user,
    }


# Endpoint to delete a user
@router.delete("/users/{user_id}")
def delete_user(
        user_id: int,
        db: Session = Depends(get_db),
):
    users_repository.delete_user(db, user_id)
    return {"message": f"User with ID {user_id} has been deleted successfully."}
