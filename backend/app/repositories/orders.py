from typing import List

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session,  joinedload

from ..database.models import Order, OrderItem, Product, BuyerProfile, User, FarmerProfile
from ..schemas.orders import OrderCreate, OrderUpdate, FarmerOrderInfo, OrderedProductDetail, BuyerInfo, \
    FarmerPurchasedProducts, PurchasedProductInfo, ProductInfo
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
        """Retrieve an order by its ID, включая OrderItems и Products."""
        logger.info(f"Fetching order with ID: {order_id}")
        order = (
            db.query(Order)
            .options(
                joinedload(Order.items).joinedload(OrderItem.product)
            )
            .filter(Order.id == order_id)
            .first()
        )
        if not order:
            logger.warning(f"Order with ID {order_id} not found.")
            raise HTTPException(status_code=404, detail="Order not found")
        logger.info(f"Order with ID {order_id} fetched successfully.")
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

    def get_purchased_products_by_farmer_user_id(self, db: Session, farmer_user_id: int) -> FarmerPurchasedProducts:
        logger.info(f"Fetching purchased products for farmer_user_id: {farmer_user_id}")
        try:
            farmer_profile = db.query(FarmerProfile).filter(FarmerProfile.user_id == farmer_user_id).first()
            if not farmer_profile:
                logger.warning(f"FarmerProfile not found for user_id: {farmer_user_id}")
                raise HTTPException(status_code=404, detail="Farmer profile not found.")

            logger.info(f"Found FarmerProfile: id={farmer_profile.id}")

            order_items = (
                db.query(OrderItem)
                .join(Product)
                .join(Order)
                .filter(Product.farmer_id == farmer_profile.id)
                .all()
            )

            logger.info(f"Number of OrderItems fetched: {len(order_items)}")

            purchases = []
            for item in order_items:
                purchase = PurchasedProductInfo(
                    product=ProductInfo(
                        id=item.product.id,
                        name=item.product.name,
                        description=item.product.description,
                        category=item.product.category,
                        price=item.product.price
                    ),
                    quantity=item.quantity,
                    purchase_time=item.order.created_at
                )
                purchases.append(purchase)

            logger.info(f"Retrieved {len(purchases)} purchased products for farmer_user_id: {farmer_user_id}")

            return FarmerPurchasedProducts(purchases=purchases)

        except HTTPException as e:
            logger.error(f"Error fetching purchased products for farmer_user_id {farmer_user_id}: {e.detail}")
            raise e
        except Exception as e:
            logger.exception("Error fetching purchased products by farmer_user_id")
            raise HTTPException(status_code=500, detail="Internal server error while fetching purchased products.")