# api/checkout.py
import stripe
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from ..repositories.orders import OrdersRepository
from ..config import STRIPE_SECRET_KEY
from ..database.database import get_db
from ..repositories.cart import CartRepository
from ..schemas.orders import OrderCreate
from ..utils.security import decode_jwt_token
import logging
logging.basicConfig(
    level=logging.INFO,  # Записывать все логи уровня INFO и выше
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),  # Запись логов в консоль
        logging.FileHandler("app.log")  # Запись логов в файл
    ]
)
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

router = APIRouter()
cart_repository = CartRepository()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/users/login")
orders_repository = OrdersRepository()
stripe.api_key = STRIPE_SECRET_KEY

@router.post("/create-checkout-session")
def create_checkout_session(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user_id = decode_jwt_token(token)
    cart_items = cart_repository.get_cart(db, user_id)
    logger.info(f"User ID decoded from token: {user_id}")
    logger.info(f"Cart items retrieved: {cart_items}")

    if not cart_items:
        logger.warning("Cart is empty for user ID: {user_id}")
        raise HTTPException(status_code=400, detail="Cart is empty.")

    total_price = 0.0
    order_items_data = []
    line_items = []
    for cart_item, product in cart_items:
        try:
            logger.info(f"Processing cart item: {cart_item}, product: {product}")
            logger.info(
                f"Product ID: {product.id}, Name: {product.name}, Quantity: {product.quantity}, Price: {product.price}")
            logger.info(f"CartItem Quantity: {cart_item.quantity}")

            # Check if any quantities are None
            if product.quantity is None or cart_item.quantity is None:
                logger.error(f"Quantity is None for product {product.name} or cart item.")
                raise HTTPException(status_code=400, detail=f"Invalid quantity for product {product.name}")

            # Check if quantities are valid integers
            if not isinstance(product.quantity, int) or not isinstance(cart_item.quantity, int):
                logger.error(f"Invalid quantity type for product {product.name} or cart item.")
                raise HTTPException(status_code=400, detail=f"Invalid quantity type for product {product.name}")

            if product.quantity < cart_item.quantity:
                logger.warning(
                    f"Insufficient stock for {product.name}. Available: {product.quantity}, Requested: {cart_item.quantity}")
                raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")

            if product.price is None:
                logger.error(f"Product price is None for product {product.name}")
                raise HTTPException(status_code=400, detail=f"Product price is invalid for {product.name}")

            # Ensure product.price is a float
            price = float(product.price)

            order_items_data.append({
                'product_id': product.id,
                'quantity': cart_item.quantity
            })
            total_price += price * cart_item.quantity

            line_items.append({
                'price_data': {
                    'currency': 'kzt',
                    'product_data': {
                        'name': product.name,
                        'description': product.description or "",  # Handle None
                    },
                    'unit_amount': int(price * 100),
                },
                'quantity': cart_item.quantity,
            })
        except Exception as e:
            logger.exception(f"Exception occurred while processing cart item with product_id: {cart_item.product_id}")
            raise e

    order_data = OrderCreate(
        total_price=total_price,
        status='Pending',
        items=order_items_data
    )
    for item_data in order_data.items:
        logger.info(f"Order item data: Product ID: {item_data.product_id}, Quantity: {item_data.quantity}")
    logger.info(f"Creating order with data: {order_data}")
    try:
        order = orders_repository.create_order(db, order_data, user_id)
    except HTTPException as e:
        logger.error(f"Order creation failed: {e.detail}")
        raise e
    except Exception as e:
        logger.exception("An unexpected error occurred during order creation.")
        raise HTTPException(status_code=500, detail="Internal server error during order creation.")

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            success_url='http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url='http://localhost:3000/cancel',
            client_reference_id=str(user_id),
            metadata={'order_id': str(order.id)},  # Store order_id in metadata
        )
        return {'checkout_url': checkout_session.url}
    except stripe.error.StripeError as e:
        logger.error(f"Stripe API error: {e.user_message}")
        orders_repository.delete_order(db, order.id)
        raise HTTPException(status_code=502, detail=e.user_message)
    except HTTPException as e:
        logger.error(f"HTTP error occurred: {e.detail}")
        raise e
    except Exception as e:
        logger.exception("An unexpected error occurred during Stripe session creation.")
        orders_repository.delete_order(db, order.id)
        raise HTTPException(status_code=500, detail="Internal server error.")