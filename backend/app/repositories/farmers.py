from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from ..database.models import FarmerProfile, User


class FarmersRepository:
    # def get_all_farmers(self, db: Session):
    #     """Retrieve all farmers with their data."""
    #     farmers = db.query(FarmerProfile).all()
    #     if not farmers:
    #         raise HTTPException(status_code=404, detail="No farmers found")
    #     return farmers

    def get_all_farmers(self, db: Session):
        """
        Fetch all users with the role 'Farmer', including their profile.
        """
        return (
            db.query(User)
            .filter(User.role == "Farmer")
            .options(joinedload(User.farmer_profile))  # Eager load profile data
            .all()
        )

    def approve_farmer(self, db: Session, user_id: int):
        """Set is_approved to True for a farmer profile by user_id."""
        farmer = (
            db.query(FarmerProfile).filter(FarmerProfile.user_id == user_id).first()
        )
        if not farmer:
            return None

        farmer.is_approved = "approved"
        try:
            db.commit()
            db.refresh(farmer)
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=500, detail="Error updating farmer approval status"
            )
        return farmer

    def update_farmer_approval(self, db: Session, user_id: int, approval_status: str):
        """
        Set is_approved to the given boolean value for a farmer profile by user_id.
        """
        if approval_status not in ("approved", "rejected", "pending"):
            raise HTTPException(
                status_code=400,
                detail="Invalid approval status. Must be 'approved', 'rejected', or 'pending'."
            )
    
        farmer = (
            db.query(FarmerProfile).filter(FarmerProfile.user_id == user_id).first()
        )
        if not farmer:
            return None

        farmer.is_approved = approval_status
        try:
            db.commit()
            db.refresh(farmer)
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=500, detail="Error updating farmer approval status"
            )

        return farmer
