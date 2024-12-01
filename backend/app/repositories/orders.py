from typing import List

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database.models import Order, OrderItem, Product
from ..schemas.orders import OrderCreate, OrderUpdate
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

class OrdersRepository:
    def create_order(self, db: Session, order_data: OrderCreate, buyer_id: int) -> Order:
        """Create a new order and associated order items."""
        logger.info(f"Starting order creation for buyer_id: {buyer_id}")
        try:
            # Create the order
            new_order = Order(
                buyer_id=buyer_id,
                total_price=order_data.total_price,
                status=order_data.status,
            )
            db.add(new_order)
            db.commit()
            db.refresh(new_order)
            logger.info(f"New order created with ID: {new_order.id}")

            # Create order items
            for item_data in order_data.items:
                product = db.query(Product).filter(Product.id == item_data.product_id).first()
                if not product:
                    logger.warning(f"Product with ID {item_data.product_id} not found.")
                    raise HTTPException(status_code=400, detail=f"Product with ID {item_data.product_id} not found.")
                if product.quantity < item_data.quantity:
                    logger.warning(f"Insufficient stock for product {product.name}. Available: {product.quantity}, Requested: {item_data.quantity}")
                    raise HTTPException(status_code=400, detail=f"Insufficient stock for product {product.name}.")

                order_item = OrderItem(
                    order_id=new_order.id,
                    product_id=item_data.product_id,
                    quantity=item_data.quantity
                )
                db.add(order_item)
                product.quantity -= item_data.quantity  # Adjust product stock
            db.commit()
            logger.info(f"Order created with ID: {new_order.id}")
        except HTTPException as e:
            db.rollback()
            logger.error(f"Order creation failed: {e.detail}")
            raise e
        except IntegrityError:
            db.rollback()
            logger.exception("Integrity error during order creation.")
            raise HTTPException(status_code=400, detail="Order creation error")
        except Exception as e:
            db.rollback()
            logger.exception("Unexpected error during order creation.")
            raise HTTPException(status_code=500, detail="Internal server error during order creation.")

        return new_order

    def get_order_by_id(self, db: Session, order_id: int) -> Order:
        """Retrieve an order by its ID."""
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return order

    def get_orders_by_user_id(self, db: Session, user_id: int) -> List[Order]:
        """Retrieve all orders for a specific user."""
        return db.query(Order).filter(Order.buyer_id == user_id).all()


    def update_order(self, db: Session, order_id: int, order_data: OrderUpdate) -> Order:
        """Update the status of an order."""
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        # Применение обновлений из OrderUpdate
        for field, value in order_data.model_dump(exclude_unset=True).items():
            setattr(order, field, value)

        try:
            db.commit()
            db.refresh(order)
            logger.info(f"Order ID {order_id} успешно обновлён.")
        except IntegrityError:
            db.rollback()
            logger.error("Ошибка целостности при обновлении заказа.")
            raise HTTPException(status_code=400, detail="Ошибка обновления заказа.")
        except Exception as e:
            db.rollback()
            logger.exception("Неожиданная ошибка при обновлении заказа.")
            raise HTTPException(status_code=500, detail="Внутренняя ошибка при обновлении заказа.")

        return order

    def delete_order(self, db: Session, order_id: int):
        """Delete an order and associated items."""
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        try:
            db.delete(order)
            db.commit()
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=500, detail="Error deleting order")