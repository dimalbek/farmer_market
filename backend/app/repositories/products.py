from typing import List

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..database.models import FarmerProfile, OrderItem, Product, ProductImage
from ..schemas.products import ProductCreate, ProductUpdate


class ProductsRepository:
    def create_product(self, db: Session, product_input: ProductCreate, user_id: int, image_urls: List[str]):
        farmer_profile = db.query(FarmerProfile).filter(FarmerProfile.user_id == user_id).first()
        if not farmer_profile:
            raise HTTPException(status_code=404, detail="Farmer profile not found.")

        new_product = Product(
            name=product_input.name,
            category=product_input.category,
            price=product_input.price,
            quantity=product_input.quantity,
            description=product_input.description,
            farmer_id=farmer_profile.id
        )

        # Create ProductImage instances
        product_images = [ProductImage(image_url=url) for url in image_urls]
        new_product.images = product_images

        db.add(new_product)
        db.commit()
        db.refresh(new_product)
        return new_product

    def get_product_by_id(self, db: Session, product_id: int) -> Product:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return product

    def update_product(self, db: Session, product_id: int, product_data: ProductUpdate):
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        for field, value in product_data.model_dump(exclude_unset=True).items():
            setattr(product, field, value)

        try:
            db.commit()
            db.refresh(product)
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=400, detail="Error updating product")
        return product

    def delete_product(self, db: Session, product_id: int):
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        db.delete(product)
        db.commit()
        return product
    
    def get_products_by_farmer_id(self, db: Session, farmer_id: int):
        """Retrieve all products associated with a specific farmer."""
        products = db.query(Product).filter(Product.farmer_id == farmer_id).all()
        return products

    def search_products(
            self,
            db: Session,
            name: str = None,
            category: str = None,
            farm_location: str = None,
            price_from: float = 0.0,
            price_until: float = -1.0,
            sort_by: str = None,
    ):
        """Search for products based on various filters."""
        query = db.query(Product)

        # Join with FarmerProfile if farm_location is specified
        if farm_location:
            query = query.join(Product.farmer)
            query = query.filter(FarmerProfile.location.ilike(f"%{farm_location.lower()}%"))

        if name:
            query = query.filter(Product.name.ilike(f"%{name.lower()}%"))

        if category:
            query = query.filter(Product.category == category)

        if price_until != -1.0:
            query = query.filter(Product.price <= price_until)
        query = query.filter(Product.price >= price_from)

        # Sorting
        if sort_by == 'price_asc':
            query = query.order_by(Product.price.asc())
        elif sort_by == 'price_desc':
            query = query.order_by(Product.price.desc())
        elif sort_by == 'popularity':
            # Order by number of order_items (number of times the product has been ordered)
            query = (
                query.outerjoin(Product.order_items)
                .group_by(Product.id)
                .order_by(func.count(OrderItem.id).desc())
            )
        elif sort_by == 'newest':
            query = query.order_by(Product.created_at.desc())

        return query.all()

    def get_all_products(self, db: Session):
        """Retrieve all products."""
        return db.query(Product).all()


UPLOAD_DIRECTORY = "uploaded_images"