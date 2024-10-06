from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    ForeignKey,
    Text,
    DateTime,
    Boolean,
    Enum,
)
from sqlalchemy.orm import relationship
from .database import Base
import pytz
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String, unique=True, nullable=False)
    password_hashed = Column(String, nullable=False)
    role = Column(Enum("Farmer", "Buyer", "Admin", name="user_roles"), nullable=False)
    is_active = Column(Boolean, default=True)

    # One-to-one relationships
    farmer_profile = relationship("FarmerProfile", back_populates="user", uselist=False)
    buyer_profile = relationship("BuyerProfile", back_populates="user", uselist=False)

    # One-to-many relationships
    posts = relationship("Post", back_populates="user")
    comments = relationship("Comment", back_populates="user")

    @property
    def profile(self):
        """Return the appropriate profile based on the user's role."""
        if self.role == "Farmer":
            return self.farmer_profile
        elif self.role == "Buyer":
            return self.buyer_profile
        else:
            return None


class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    farm_name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    farm_size = Column(Float, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))

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


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("buyer_profiles.id"))
    total_price = Column(Float, nullable=False)
    status = Column(
        Enum("Pending", "Processing", "Delivered", "Cancelled", name="order_status"),
        default="Pending",
    )
    created_at = Column(DateTime, default=datetime.now(pytz.timezone("Asia/Almaty")))

    buyer = relationship("BuyerProfile", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")


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
    created_at = Column(DateTime, default=datetime.now(pytz.timezone("Asia/Almaty")))
    author_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))

    user = relationship("User", back_populates="comments")
    product = relationship("Product", back_populates="comments")
