from sqlalchemy.orm import Session

from ..database.models import CartItem, Product


class CartRepository:
    def validate_cart_items(self, db: Session, cart_items: list):
        """Validate cart items against available stock."""
        for item in cart_items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if not product:
                raise ValueError(f"Product with ID {item.product_id} does not exist.")
            if product.quantity < item.quantity:
                raise ValueError(
                    f"Insufficient stock for product {product.name}. Available: {product.quantity}, Requested: {item.quantity}")

    def get_cart(self, db: Session, user_id: int):
        return (
            db.query(CartItem, Product)
            .join(Product, CartItem.product_id == Product.id)
            .filter(CartItem.user_id == user_id)
            .all()
        )

    def add_to_cart(self, db: Session, user_id: int, product_id: int, quantity: int):
        item = db.query(CartItem).filter(CartItem.user_id == user_id, CartItem.product_id == product_id).first()
        if item:
            item.quantity += quantity
        else:
            item = CartItem(user_id=user_id, product_id=product_id, quantity=quantity)
            db.add(item)
        db.commit()
        db.refresh(item)
        return item

    def clear_cart(self, db: Session, user_id: int):
        db.query(CartItem).filter(CartItem.user_id == user_id).delete()
        db.commit()

    def remove_item_from_cart(self, db: Session, user_id: int, product_id: int):
        item = db.query(CartItem).filter(CartItem.user_id == user_id, CartItem.product_id == product_id).first()
        if not item:
            raise ValueError("Item not found in the cart.")
        db.delete(item)
        db.commit()

    def update_cart_item_quantity(self, db: Session, user_id: int, product_id: int, quantity: int):
        item = db.query(CartItem).filter(CartItem.user_id == user_id, CartItem.product_id == product_id).first()
        if not item:
            raise ValueError("Item not found in the cart.")
        if quantity <= 0:
            db.delete(item)  # Remove the item if quantity is set to 0 or less
        else:
            item.quantity = quantity
        db.commit()
        return item

    def calculate_total(self, db: Session, cart_items: list):
        """Calculate total price of the cart."""
        total_price = 0.0
        for cart_item, product in cart_items:
            total_price += product.price * cart_item.quantity
        return total_price
