from sqlalchemy.orm import Session, joinedload

from ..database.models import User


class BuyersRepository:
    def get_all_buyers(self, db: Session):
        """
        Fetch all users with the role 'Buyer', including their profile.
        """
        return (
            db.query(User)
            .filter(User.role == "Buyer")
            .options(joinedload(User.buyer_profile))  # Eager load profile data
            .all()
        )