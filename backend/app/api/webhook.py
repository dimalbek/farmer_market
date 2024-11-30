# api/webhooks.py
from fastapi import APIRouter, Request, HTTPException, Depends
from starlette.responses import JSONResponse
import stripe
from ..config import STRIPE_WEBHOOK_SECRET, STRIPE_SECRET_KEY
from sqlalchemy.orm import Session
from ..repositories.orders import OrdersRepository
from ..repositories.cart import CartRepository
from ..database.database import get_db
from ..schemas.orders import OrderCreate

router = APIRouter()
orders_repository = OrdersRepository()
cart_repository = CartRepository()

stripe.api_key = STRIPE_SECRET_KEY

@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        # Invalid payload
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']

        # Fulfill the purchase
        handle_checkout_session(session, db)

    return JSONResponse(status_code=200, content={"status": "success"})

def handle_checkout_session(session, db: Session):
    user_id = int(session.get('client_reference_id'))
    # You can retrieve the cart items again or store necessary info in metadata
    cart_items = cart_repository.get_cart(db, user_id)
    total_price = 0.0

    # Prepare OrderCreate schema data
    order_items_data = []
    for cart_item, product in cart_items:
        if product.quantity < cart_item.quantity:
            # Handle insufficient stock
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")

        order_items_data.append({
            'product_id': product.id,
            'quantity': cart_item.quantity
        })
        total_price += product.price * cart_item.quantity

    order_data = OrderCreate(
        total_price=total_price,
        status='Processing',
        items=order_items_data
    )

    # Create the order
    orders_repository.create_order(db, order_data, user_id)

    # Clear the cart
    cart_repository.clear_cart(db, user_id)