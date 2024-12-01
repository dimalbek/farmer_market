
from sqlalchemy import (Boolean, Column, DateTime, Enum, Float, ForeignKey,
                        Integer, String, Text)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    fullname = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    password_hashed = Column(String, nullable=False)
    role = Column(Enum("Farmer", "Buyer", "Admin", name="user_roles"), nullable=False)
    is_active = Column(Boolean, default=True)

    # One-to-one relationships
    farmer_profile = relationship("FarmerProfile", back_populates="user", uselist=False)
    buyer_profile = relationship("BuyerProfile", back_populates="user", uselist=False)

    # One-to-many relationships
    # posts = relationship("Post", back_populates="user")
    comments = relationship("Comment", back_populates="user")
    cart_items = relationship("CartItem", back_populates="user", cascade="all, delete-orphan")
    verification_codes = relationship("VerificationCode", back_populates="user")

    @property
    def profile(self):
        """Return the appropriate profile based on the user's role."""
        if self.role == "Farmer":
            return self.farmer_profile
        elif self.role == "Buyer":
            return self.buyer_profile
        else:
            return {
                "farmer_profile": self.farmer_profile,
                "buyer_profile": self.buyer_profile,
            }


class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    farm_name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    farm_size = Column(Float, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    is_approved = Column(
        Enum("approved", "rejected", "pending", name="approval_status"),
        default="pending",
        nullable=False
    )

    user = relationship("User", back_populates="farmer_profile")
    products = relationship("Product", back_populates="farmer")


class BuyerProfile(Base):
    __tablename__ = "buyer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    delivery_address = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="buyer_profile")
    orders = relationship("Order", back_populates="buyer")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)  # Add this line
    category = Column(
        Enum(
            "Vegetables",
            "Fruits",
            "Seeds",
            "Dairy",
            "Meat",
            "Equipment",
            name="product_category",
        ),
        nullable=False,
    )
    price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)
    farmer_id = Column(Integer, ForeignKey("farmer_profiles.id"))
    farmer = relationship("FarmerProfile", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product")
    comments = relationship("Comment", back_populates="product")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    cart_items = relationship("CartItem", back_populates="product", cascade="all, delete-orphan")

class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    image_url = Column(String, nullable=False)

    product = relationship("Product", back_populates="images")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("buyer_profiles.id"))
    total_price = Column(Float, nullable=False)
    status = Column(
        Enum("Pending", "Processing", "Delivered", "Cancelled", name="order_status"),
        default="Pending",
    )
    created_at = Column(DateTime(timezone=True), default=func.now())

    buyer = relationship("BuyerProfile", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")
    payment = relationship("Payment", back_populates="order", uselist=False)


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    order_id = Column(Integer, ForeignKey("orders.id"))
    quantity = Column(Integer, nullable=False)

    product = relationship("Product", back_populates="order_items")
    order = relationship("Order", back_populates="items")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=func.now())
    author_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))

    user = relationship("User", back_populates="comments")
    product = relationship("Product", back_populates="comments")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    amount = Column(Float, nullable=False)
    status = Column(
        Enum("Pending", "Completed", "Failed", name="payment_status"), nullable=False
    )

    order = relationship("Order", back_populates="payment")


class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    messages = relationship("Message", back_populates="chat", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chats.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=func.now())

    chat = relationship("Chat", back_populates="messages")
    sender = relationship("User", backref="messages_sent")


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, nullable=False)

    user = relationship("User", back_populates="cart_items")
    product = relationship("Product")


class VerificationCode(Base):
    __tablename__ = "verification_codes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Nullable for registration
    email = Column(String, index=True, nullable=False)  # For registration, user might not exist yet
    code = Column(String, nullable=False)
    purpose = Column(String, nullable=False)  # 'registration' or 'login'
    expires_at = Column(DateTime, nullable=False)
    
    user = relationship("User", back_populates="verification_codes")