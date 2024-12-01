from typing import Optional

from pydantic import BaseModel, EmailStr
from pydantic_extra_types.phone_numbers import PhoneNumber


class UserCreate(BaseModel):
    fullname: str
    email: EmailStr
    phone: PhoneNumber = "+7 --- --- ----"
    password: str
    role: str

    class Config:
        schema_extra = {
            "example": {
                "fullname": "john_doe",
                "email": "john@example.com",
                "phone": "+7 123 456 7890",
                "password": "password123",
                "role": "Farmer",  # Can be "Farmer", "Buyer", or "Admin"
            }
        }

class UserEmail(BaseModel):
    email: EmailStr

    class Config:
        schema_extra = {
            "example": {
                "email": "john@example.com",
            }
        }

class UserUpdate(BaseModel):
    fullname: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[PhoneNumber] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserInfo(BaseModel):
    id: int
    fullname: str
    email: EmailStr
    phone: str
    role: str


class ProfileInfo(BaseModel):
    farm_name: str
    location: str
    farm_size: float
    is_approved: str
    user_id: int

class FarmerProfileInfo(BaseModel):
    id: int
    fullname: str
    email: EmailStr
    phone: str
    role: str
    profile: Optional[ProfileInfo]


class PasswordResetRequest(BaseModel):
    email: Optional[EmailStr] = None


class PasswordResetConfirm(BaseModel):
    email: EmailStr
    code: str
    new_password: str
