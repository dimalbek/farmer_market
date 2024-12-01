# api/checkout.py
import stripe
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from ..config import STRIPE_SECRET_KEY
from ..database.database import get_db
from ..repositories.cart import CartRepository
from ..utils.security import decode_jwt_token

router = APIRouter()
cart_repository = CartRepository()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/users/login")

stripe.api_key = STRIPE_SECRET_KEY

@router.post("/create-checkout-session")
def create_checkout_session(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user_id = decode_jwt_token(token)
    cart_items = cart_repository.get_cart(db, user_id)

    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty.")

    line_items = []
    for cart_item, product in cart_items:
        line_items.append({
            'price_data': {
                'currency': 'usd',  # Adjust currency as needed
                'product_data': {
                    'name': product.name,
                    'description': product.description,
                },
                'unit_amount': int(product.price * 100),  # Stripe expects amount in cents
            },
            'quantity': cart_item.quantity,
        })

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            success_url='https://your-domain.com/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url='https://your-domain.com/cancel',
            client_reference_id=str(user_id),  # Store user ID for reference
        )
        return {'checkout_url': checkout_session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))