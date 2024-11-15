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


# Get all products of a farmer by farmer ID
@router.get("/farmer/{farmer_id}", response_model=list[ProductInfo])
def get_products_by_farmer(farmer_id: int, db: Session = Depends(get_db)):
    """Fetch all products belonging to a specific farmer."""
    products = products_repository.get_products_by_farmer_id(db, farmer_id)
    if not products:
        raise HTTPException(status_code=404, detail="No products found for this farmer")
    return products


@router.get("/search", response_model=list[ProductInfo])
def search_products(
    db: Session = Depends(get_db),
    category: str = None,
    price_from: float = 0.0,
    price_until: float = -1.0,
    quantity_from: int = 0,
    quantity_until: int = -1,
):
    """
    Search for products based on category, price range, and quantity range.

    Parameters:
    - `category`: Filter products by category.
    - `price_from`: Minimum price.
    - `price_until`: Maximum price (use -1 for no upper limit).
    - `quantity_from`: Minimum quantity.
    - `quantity_until`: Maximum quantity (use -1 for no upper limit).
    """
    products = products_repository.search_products(
        db, category, price_from, price_until, quantity_from, quantity_until
    )
    return products