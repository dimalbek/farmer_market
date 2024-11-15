from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database.database import get_db
from ..repositories.farmers import FarmersRepository
from ..schemas.farmers import FarmerInfo
from ..schemas.users import FarmerProfileInfo, ProfileInfo

router = APIRouter()
farmers_repository = FarmersRepository()


# 1. Get all farmers with their data
# @router.get("/", response_model=list[FarmerInfo])
# def get_all_farmers(db: Session = Depends(get_db)):
#     """Fetch all farmers with their profile data."""
#     farmers = farmers_repository.get_all_farmers(db)
#     return farmers


@router.get("/", response_model=list[FarmerProfileInfo])
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


# 2. Approve a farmer profile by user_id
@router.patch("/{user_id}/approve")
def approve_farmer(user_id: int, db: Session = Depends(get_db)):
    """Set is_approved to True for a farmer profile by user_id."""
    farmer = farmers_repository.approve_farmer(db, user_id)
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer profile not found")
    return {"message": f"Farmer profile for user_id {user_id} approved successfully"}
