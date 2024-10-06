from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from ..database.models import User
from ..schemas.users import UserCreate, UserLogin, UserUpdate
from ..schemas.buyers import BuyerProfileCreate
from ..schemas.farmers import FarmerProfileCreate


class UsersRepository:
    def create_user(self, db: Session, user_data: UserCreate) -> User:
        try:
            existing_user = db.query(User).filter(User.email == user_data.email).first()

            if existing_user:
                raise HTTPException(
                    status_code=400, detail="User with this email already exists"
                )

            new_user = User(
                username=user_data.username,
                email=user_data.email,
                phone=user_data.phone,
                password=user_data.password,
                role=user_data.role,
            )

            db.add(new_user)
            db.commit()
            db.refresh(new_user)

        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=400, detail="Integrity error")

        return new_user

    def create_profile(self, db: Session, user_id: int, profile_data):
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if user.role == "Farmer":
            profile = FarmerProfileCreate(
                user_id=user.id,
                farm_name=profile_data.farm_name,
                location=profile_data.location,
                farm_size=profile_data.farm_size,
            )
            db.add(profile)

        elif user.role == "Buyer":
            profile = BuyerProfileCreate(
                user_id=user.id, delivery_address=profile_data.delivery_address
            )
            db.add(profile)

        db.commit()

    def get_user_by_email(self, db: Session, email: str) -> User:
        """Get user by email (for login purposes)"""
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    def update_user(self, db: Session, user_id: int, user_data: UserUpdate):
        db_user = db.query(User).filter(User.id == user_id).first()
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")

        for field, value in user_data.model_dump(exclude_unset=True).items():
            setattr(db_user, field, value)

        try:
            db.commit()
            db.refresh(db_user)
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=400, detail="Integrity error")

    def get_user_by_id(self, db: Session, user_id: int) -> User:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
