from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..schemas.cart import Cart
from ..repositories.cart import CartRepository
from ..utils.security import decode_jwt_token
from ..database.database import get_db
from fastapi.security import OAuth2PasswordBearer

router = APIRouter()
cart_repository = CartRepository()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/users/login")


@router.get("/")
def get_cart(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user_id = decode_jwt_token(token)
    cart_items = cart_repository.get_cart(db, user_id)
    return [
        {
            "product_id": cart_item.product_id,
            "product_name": product.name,
            "price": product.price,
            "quantity": cart_item.quantity
        }
        for cart_item, product in cart_items
    ]


@router.post("/")
def add_to_cart(product_id: int, quantity: int, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user_id = decode_jwt_token(token)
    cart_item = cart_repository.add_to_cart(db, user_id, product_id, quantity)
    return {"message": "Item added to cart",
            "cart_item": {"product_id": cart_item.product_id, "quantity": cart_item.quantity}}


@router.delete("/{product_id}")
def remove_from_cart(product_id: int, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Remove a specific product from the cart.
    """
    user_id = decode_jwt_token(token)
    cart_repository.remove_item_from_cart(db, user_id, product_id)
    return {"message": f"Product with ID {product_id} removed from cart."}


@router.put("/{product_id}")
def update_cart_item(product_id: int, quantity: int, token: str = Depends(oauth2_scheme),
                     db: Session = Depends(get_db)):
    """
    Update the quantity of a specific product in the cart.
    """
    user_id = decode_jwt_token(token)
    cart_item = cart_repository.update_cart_item_quantity(db, user_id, product_id, quantity)
    return {"message": "Cart item updated.",
            "cart_item": {"product_id": cart_item.product_id, "quantity": cart_item.quantity}}


@router.delete("/")
def clear_cart(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Clear the entire cart for the user.
    """
    user_id = decode_jwt_token(token)
    cart_repository.clear_cart(db, user_id)
    return {"message": "Cart cleared successfully."}


@router.get("/total")
def get_cart_total(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Calculate the total price of the cart.
    """
    user_id = decode_jwt_token(token)
    cart_items = cart_repository.get_cart(db, user_id)
    total_price = cart_repository.calculate_total(db, cart_items)
    return {"total_price": total_price}
