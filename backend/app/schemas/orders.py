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


class ProductInfo(BaseModel):
    id: int
    name: str
    description: str
    category: str
    price: float

    class Config:
        orm_mode = True

class OrderedProductDetail(BaseModel):
    product: ProductInfo
    quantity: int

    class Config:
        orm_mode = True

class OrderInfo(BaseModel):
    id: int
    total_price: float
    status: str
    created_at: datetime
    buyer_id: int
    items: List[OrderedProductDetail]

    class Config:
        orm_mode = True

class BuyerInfo(BaseModel):
    id: int
    fullname: str
    email: str
    phone: str

    class Config:
        orm_mode = True

class FarmerOrderInfo(BaseModel):
    order_id: int
    total_price: float
    status: str
    created_at: datetime
    buyer: BuyerInfo
    items: List[OrderedProductDetail]

    class Config:
        orm_mode = True


class PurchasedProductInfo(BaseModel):
    product: ProductInfo
    quantity: int
    purchase_time: datetime

    class Config:
        orm_mode = True


class FarmerPurchasedProducts(BaseModel):
    purchases: List[PurchasedProductInfo]

    class Config:
        orm_mode = True