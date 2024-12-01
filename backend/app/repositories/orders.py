from typing import List

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database.models import Order, OrderItem, Product
from ..schemas.orders import OrderCreate, OrderUpdate


class OrdersRepository:
    def create_order(self, db: Session, order_data: OrderCreate, buyer_id: int) -> Order:
        """Create a new order and associated order items."""
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
            
            # Create order items
            for item_data in order_data.items:
                product = db.query(Product).filter(Product.id == item_data.product_id).first()
                if not product or product.quantity < item_data.quantity:
                    raise HTTPException(status_code=400, detail="Product not available or insufficient quantity")
                
                order_item = OrderItem(
                    order_id=new_order.id,
                    product_id=item_data.product_id,
                    quantity=item_data.quantity
                )
                db.add(order_item)
                product.quantity -= item_data.quantity  # Adjust product stock
            db.commit()
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=400, detail="Order creation error")

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

        for field, value in order_data.model_dump(exclude_unset=True).items():
            setattr(order, field, value)

        try:
            db.commit()
            db.refresh(order)
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=400, detail="Error updating order")
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