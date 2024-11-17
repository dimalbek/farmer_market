from pydantic import BaseModel
from typing import List


class CartItem(BaseModel):
    product_id: int
    quantity: int


class Cart(BaseModel):
    items: List[CartItem]
