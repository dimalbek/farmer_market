from pydantic import BaseModel
from typing import Optional


class ProductCreate(BaseModel):
    name: str
    category: str
    price: float
    quantity: int


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None


class ProductInfo(BaseModel):
    id: int
    name: str
    category: str
    price: float
    quantity: int
