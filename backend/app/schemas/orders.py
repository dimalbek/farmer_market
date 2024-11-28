from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


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
