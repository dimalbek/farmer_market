from pydantic import BaseModel
from typing import Optional, List


class ProductImageInfo(BaseModel):
    id: int
    image_url: str

    class Config:
        orm_mode = True


class ProductCreate(BaseModel):
    name: str
    category: str
    price: float
    quantity: int
    description: Optional[str] = None


class ProductInfo(BaseModel):
    id: int
    name: str
    category: str
    price: float
    quantity: int
    farmer_id: int
    description: Optional[str] = None
    images: List[ProductImageInfo] = []

    class Config:
        orm_mode = True


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
