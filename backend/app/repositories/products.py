from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from ..database.models import Product
from ..schemas.products import ProductCreate, ProductUpdate
from typing import List


class ProductsRepository:
    def create_product(self, db: Session, product_data: ProductCreate, farmer_id: int):
        try:
            new_product = Product(
                name=product_data.name,
                category=product_data.category,
                price=product_data.price,
                quantity=product_data.quantity,
                farmer_id=farmer_id,
            )
            db.add(new_product)
            db.commit()
            db.refresh(new_product)
        except IntegrityError:
            db.rollback()
            raise HTTPException(status_code=400, detail="Product creation error")
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
