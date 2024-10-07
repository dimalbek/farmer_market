from pydantic import BaseModel


class BuyerProfileCreate(BaseModel):
    delivery_address: str

    class Config:
        schema_extra = {"example": {"delivery_address": "123 Street, City, Country"}}
