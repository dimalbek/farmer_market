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
