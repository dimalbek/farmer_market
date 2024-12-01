from typing import List

from pydantic import BaseModel


class CartItem(BaseModel):
    product_id: int
    quantity: int


class Cart(BaseModel):
    items: List[CartItem]
