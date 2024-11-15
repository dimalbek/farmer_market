from pydantic import BaseModel


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


from pydantic import BaseModel
from typing import Optional


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
