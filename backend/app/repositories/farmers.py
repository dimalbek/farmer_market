from sqlalchemy.orm import Session
from ..database.models import FarmerProfile, User
from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError

class FarmersRepository:
    def get_all_farmers(self, db: Session):
        """Retrieve all farmers with their data."""
        farmers = db.query(FarmerProfile).all()
        if not farmers:
            raise HTTPException(status_code=404, detail="No farmers found")
        return farmers

    def approve_farmer(self, db: Session, user_id: int):
        """Set is_approved to True for a farmer profile by user_id."""
        farmer = db.query(FarmerProfile).filter(FarmerProfile.user_id == user_id).first()
        if not farmer:
            return None

        farmer.is_approved = True
        try:
            db.commit()
            db.refresh(farmer)
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=500, detail="Error updating farmer approval status")
        return farmer