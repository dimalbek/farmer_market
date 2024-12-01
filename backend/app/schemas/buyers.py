from typing import Optional

from pydantic import BaseModel, EmailStr


class BuyerProfileCreate(BaseModel):
    delivery_address: str

    class Config:
        schema_extra = {"example": {"delivery_address": "123 Street, City, Country"}}


class BuyerProfileInfo(BaseModel):
    delivery_address: str
    user_id: int


class BuyerProfileWithUserInfo(BaseModel):
    id: int
    fullname: str
    email: EmailStr
    phone: str
    role: str
    profile: Optional[BuyerProfileInfo]

    class Config:
        orm_mode = True
