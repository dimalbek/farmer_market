from pydantic import BaseModel
from enum import Enum

class ApprovalStatusEnum(str, Enum):
    APPROVED = "approved"
    REJECTED = "rejected"
    PENDING = "pending"

class FarmerProfileRead(BaseModel):
    id: int
    farm_name: str
    location: str
    farm_size: float
    user_id: int
    is_approved: ApprovalStatusEnum

    class Config:
        orm_mode = True  # Enables compatibility with ORM objects

class FarmerProfileCreate(BaseModel):
    farm_name: str
    location: str
    farm_size: float

    class Config:
        schema_extra = {
            "example": {
                "farm_name": "Doe Farms",
                "location": "Astana",
                "farm_size": 150.5,
            }
        }

class FarmerInfo(BaseModel):
    id: int
    farm_name: str
    location: str
    farm_size: float
    is_approved: bool
    user_id: int

    class Config:
        orm_mode = True
        from_attributes = True
