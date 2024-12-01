from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    total_price: float
    status: str
    items: List[OrderItemCreate]


class OrderUpdate(BaseModel):
    status: Optional[str] = None


class OrderInfo(BaseModel):
    id: int
    total_price: float
    status: str
    created_at: datetime
    buyer_id: int

    class Config:
        orm_mode = True
        from_attributes = True


class BuyerInfo(BaseModel):
    id: int
    fullname: str
    email: str
    phone: str

    class Config:
        orm_mode = True

class OrderedProductInfo(BaseModel):
    product_id: int
    name: str
    quantity: int
    price: float

    class Config:
        orm_mode = True

class FarmerOrderInfo(BaseModel):
    order_id: int
    total_price: float
    status: str
    created_at: datetime
    buyer: BuyerInfo
    items: List[OrderedProductInfo]

    class Config:
        orm_mode = True
