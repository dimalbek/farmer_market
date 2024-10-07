from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from ..database.models import Order, OrderItem
from ..schemas.orders import OrderCreate
from typing import List


class OrdersRepository:
    def create_order(self, db: Session, buyer_id: int, order_data: OrderCreate):
        try:
            new_order = Order(
                buyer_id=buyer_id, total_price=order_data.total_price, status="Pending"
            )
            db.add(new_order)
            db.commit()
            db.refresh(new_order)

            for item in order_data.items:
                new_item = OrderItem(
                    product_id=item.product_id,
                    order_id=new_order.id,
                    quantity=item.quantity,
                )
                db.add(new_item)
            db.commit()
            return new_order
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=400, detail="Order creation failed")

    def get_order_by_id(self, db: Session, order_id: int):
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return order
