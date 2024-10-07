from fastapi import APIRouter, Depends, Response, HTTPException
from sqlalchemy.orm import Session
from ..repositories.products import ProductsRepository
from ..schemas.products import ProductCreate, ProductUpdate, ProductInfo
from ..database.database import get_db
from fastapi.security import OAuth2PasswordBearer
from ..utils.security import decode_jwt_token, check_user_role

router = APIRouter()
products_repository = ProductsRepository()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/users/login")
VALID_CATEGORIES = {
    "Vegetables",
    "Fruits",
    "Seeds",
    "Dairy",
    "Meat",
    "Equipment",
}


# Create a new product (Farmers and Admins)
@router.post("/")
def create_product(
    product_input: ProductCreate,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    if product_input.category not in VALID_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Invalid category: {product_input.category}. Allowed categories are: {', '.join(VALID_CATEGORIES)}")
    check_user_role(token, db, ["Farmer", "Admin"])
    user_id = decode_jwt_token(token)
    product = products_repository.create_product(db, product_input, user_id)
    return Response(content=f"Product with id {product.id} created", status_code=200)


# Get a product by its ID
@router.get("/{product_id}", response_model=ProductInfo)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = products_repository.get_product_by_id(db, product_id)
    return product


# Update a product (Farmers and Admins)
@router.patch("/{product_id}")
def update_product(
    product_id: int,
    product_input: ProductUpdate,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    check_user_role(token, db, ["Farmer", "Admin"])
    updated_product = products_repository.update_product(db, product_id, product_input)
    return Response(content=f"Product with id {product_id} updated", status_code=200)


# Delete a product (Farmers and Admins)
@router.delete("/{product_id}")
def delete_product(
    product_id: int, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    check_user_role(token, db, ["Farmer", "Admin"])
    deleted_product = products_repository.delete_product(db, product_id)
    return Response(content=f"Product with id {product_id} deleted", status_code=200)
