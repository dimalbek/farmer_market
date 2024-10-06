from pydantic import BaseModel, EmailStr
from typing import Optional
from pydantic_extra_types.phone_numbers import PhoneNumber


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    phone: PhoneNumber = "+7 --- --- ----"
    password: str
    role: str

    class Config:
        schema_extra = {
            "example": {
                "username": "john_doe",
                "email": "john@example.com",
                "phone": "+7 123 456 7890",
                "password": "password123",
                "role": "Farmer",  # Can be "Farmer", "Buyer", or "Admin"
            }
        }

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[PhoneNumber] = None
    password: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserInfo(BaseModel):
    id: int
    username: str
    email: EmailStr
    phone: str
    role: str
