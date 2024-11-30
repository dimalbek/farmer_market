from typing import List, Optional

from fastapi import APIRouter, Depends, Response, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session
from ..repositories.products import ProductsRepository
from ..schemas.products import ProductCreate, ProductUpdate, ProductInfo
from ..database.database import get_db
from fastapi.security import OAuth2PasswordBearer

from ..utils.file_upload import save_product_images
from ..utils.security import decode_jwt_token, check_user_role, check_farmer_approval
from ..database.models import User

router = APIRouter()
products_repository = ProductsRepository()
VALID_CATEGORIES = {"Vegetables", "Fruits", "Seeds", "Dairy", "Meat", "Equipment"}
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/users/login")


@router.post("/", response_model=ProductInfo, status_code=201)
def create_product(
        name: str = Form(...),
        quantity: int = Form(...),
        category: str = Form(...),
        description: Optional[str] = Form(None),
        price: float = Form(...),
        images: List[UploadFile] = File(...),
        token: str = Depends(oauth2_scheme),
        db: Session = Depends(get_db),
        farmer: User = Depends(check_farmer_approval)
):
    """
    Create a new product with multiple images.
    """
    if category not in VALID_CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category: {category}. Allowed categories are: {', '.join(VALID_CATEGORIES)}"
        )

    # Verify user role
    user_id = decode_jwt_token(token)
    check_user_role(token, db, ["Farmer", "Admin"])

    # Save images and get their URLs
    image_urls = save_product_images(images)

    # Create the product input data
    product_input = ProductCreate(
        name=name,
        category=category,
        price=price,
        quantity=quantity,
        description=description
    )

    # Create the product
    product = products_repository.create_product(db, product_input, user_id, image_urls)

    # Return the product data as JSON
    return product


@router.get("/", response_model=List[ProductInfo])
def get_all_products(db: Session = Depends(get_db)):
    """
    Get all products.
    """
    products = products_repository.get_all_products(db)
    return products


# Get a product by its ID
@router.get("/{product_id}", response_model=ProductInfo)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """
    Get product details by its ID.

    - **product_id**: The ID of the product.
    - **db**: Database session.

    Returns:
    - The product details if found.
    """
    product = products_repository.get_product_by_id(db, product_id)
    return product


# Update a product (Farmers and Admins)
@router.patch("/{product_id}", status_code=200)
def update_product(
        product_id: int,
        product_input: ProductUpdate,
        token: str = Depends(oauth2_scheme),
        db: Session = Depends(get_db),
):
    """
    Update an existing product.

    - **product_id**: The ID of the product to update.
    - **product_input**: Updated product details (e.g., price, quantity, etc.).
    - **token**: The access token of the user (must be a Farmer or Admin).
    - **db**: Database session.

    Returns:
    - A success message with the updated product's ID.
    """
    check_user_role(token, db, ["Farmer", "Admin"])
    updated_product = products_repository.update_product(db, product_id, product_input)
    return Response(content=f"Product with id {product_id} updated", status_code=200)


# Delete a product (Farmers and Admins)
@router.delete("/{product_id}", status_code=200)
def delete_product(
        product_id: int, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    """
    Delete an existing product.

    - **product_id**: The ID of the product to delete.
    - **token**: The access token of the user (must be a Farmer or Admin).
    - **db**: Database session.

    Returns:
    - A success message with the deleted product's ID.
    """
    check_user_role(token, db, ["Farmer", "Admin"])
    deleted_product = products_repository.delete_product(db, product_id)
    return Response(content=f"Product with id {product_id} deleted", status_code=200)


# Get all products of a farmer by farmer ID
@router.get("/farmer/{farmer_id}", response_model=list[ProductInfo])
def get_products_by_farmer(farmer_id: int, db: Session = Depends(get_db)):
    """
    Get all products belonging to a specific farmer.

    - **farmer_id**: The ID of the farmer.
    - **db**: Database session.

    Returns:
    - A list of products belonging to the farmer.
    """
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

    - **category**: Filter products by category.
    - **price_from**: Minimum price.
    - **price_until**: Maximum price (use -1 for no upper limit).
    - **quantity_from**: Minimum quantity.
    - **quantity_until**: Maximum quantity (use -1 for no upper limit).

    Returns:
    - A list of products matching the search criteria.
    """
    products = products_repository.search_products(
        db, category, price_from, price_until, quantity_from, quantity_until
    )
    return products

