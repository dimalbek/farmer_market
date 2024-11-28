from typing import List

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from ..database.models import User, BuyerProfile, FarmerProfile, VerificationCode
from ..schemas.users import UserCreate, UserLogin, UserUpdate
from ..schemas.buyers import BuyerProfileCreate
from ..schemas.farmers import FarmerProfileCreate
from ..schemas.verification_code import VerificationCodeCreate
from ..utils.code_generator import generate_verification_code
from datetime import datetime, timedelta

class UsersRepository:
    def create_user(self, db: Session, user_data: UserCreate) -> User:
        try:
            existing_user = db.query(User).filter(User.email == user_data.email).first()

            if existing_user:
                raise HTTPException(
                    status_code=400, detail="User with this email already exists"
                )

            existing_user_by_phone = db.query(User).filter(User.phone == user_data.phone).first()
            
            if existing_user_by_phone:
                raise HTTPException(
                    status_code=400, detail="User with this phone number already exists"
                )

            new_user = User(
                fullname=user_data.fullname,
                email=user_data.email,
                phone=user_data.phone,
                password_hashed=user_data.password,
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
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            if user.role == "Farmer" or (
                    user.role == "Admin" and len(profile_data.__fields__) == 3
            ):
                profile = FarmerProfile(
                    user_id=user.id,
                    farm_name=profile_data.farm_name,
                    location=profile_data.location,
                    farm_size=profile_data.farm_size,
                )
                db.add(profile)

            elif user.role == "Buyer" or (
                    user.role == "Admin" and len(profile_data.__fields__) == 1
            ):
                profile = BuyerProfile(
                    user_id=user.id, delivery_address=profile_data.delivery_address
                )
                db.add(profile)

            db.commit()
            db.refresh(profile)

        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=400, detail="Integrity error")

    def get_user_by_email(self, db: Session, email: str) -> User:
        """Get user by email (for login purposes)"""
        user = db.query(User).filter(User.email == email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    def get_user_by_email_reg(self, db: Session, email: str) -> User:
        """Get user by email (for registration purposes)"""
        user = db.query(User).filter(User.email == email).first()

        return user

    def update_user(self, db: Session, user_id: int, user_data: UserUpdate):
        db_user = db.query(User).filter(User.id == user_id).first()
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")

        if user_data.email:
            existing_email = db.query(User).filter(User.email == user_data.email).first()
            if existing_email and existing_email.id != user_id:  # Ensure the user is not updating to their own email
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already in use")

        if user_data.phone:
            existing_phone = db.query(User).filter(User.phone == user_data.phone).first()
            if existing_phone and existing_phone.id != user_id:  # Ensure the user is not updating to their own phone number
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Phone number already in use")

        for field, value in user_data.model_dump(exclude_unset=True).items():
            setattr(db_user, field, value)

        try:
            db.commit()
            db.refresh(db_user)
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=400, detail="Integrity error")
        return {
            "id": db_user.id,
            "fullname": db_user.fullname,
            "email": db_user.email,
            "phone": db_user.phone,
            "role": db_user.role,  # Assuming role is part of the User model
        }

    def get_user_by_id(self, db: Session, user_id: int) -> User:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    def get_all_users(self, db: Session) -> List[User]:
        """Get all users from the database."""
        return db.query(User).all()

    def delete_user(self, db: Session, user_id: int):
        """Delete a user by their ID."""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        db.delete(user)
        db.commit()

    def get_profile_by_id(self, db: Session, farmer_id: int) -> User:
        user = db.query(FarmerProfile).filter(FarmerProfile.id == farmer_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    def create_verification_code(self, db: Session, verification_data: VerificationCodeCreate) -> VerificationCode:
        code = generate_verification_code()
        expires_at = datetime.utcnow() + timedelta(minutes=10)  # Code valid for 10 minutes
        verification_code = VerificationCode(
            email=verification_data.email,
            code=code,
            purpose=verification_data.purpose,
            expires_at=expires_at,
            user_id=None  # Will be set upon confirmation for login
        )
        db.add(verification_code)
        db.commit()
        db.refresh(verification_code)
        return verification_code

    def verify_code(self, db: Session, email: str, code: str, purpose: str) -> bool:
        verification_entry = db.query(VerificationCode).filter(
            VerificationCode.email == email,
            VerificationCode.code == code,
            VerificationCode.purpose == purpose,
            VerificationCode.expires_at >= datetime.utcnow()
        ).first()

        if verification_entry:
            # Optionally delete or invalidate the code after verification
            db.delete(verification_entry)
            db.commit()
            return True
        return False
