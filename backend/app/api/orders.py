from typing import List

from fastapi import APIRouter, Depends, Response, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from ..database.database import get_db
from ..database.models import User, FarmerProfile
from ..repositories.orders import OrdersRepository
from ..schemas.orders import OrderInfo, OrderUpdate, FarmerOrderInfo, FarmerPurchasedProducts, \
    ProductInfo, OrderedProductDetail
from ..utils.security import check_user_role, decode_jwt_token, users_repository

router = APIRouter()
orders_repository = OrdersRepository()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/users/login")

@router.get("/", response_model=List[OrderInfo])
def get_orders(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Get all orders for the authenticated user.

    - **token**: The access token of the user.
    - **db**: Database session.

    Returns:
    - A list of orders belonging to the user.
    """
    user_id = decode_jwt_token(token)
    orders = orders_repository.get_orders_by_user_id(db, user_id)
    return orders

@router.get("/{order_id}", response_model=OrderInfo)
def get_order(
    order_id: int,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    user_id = decode_jwt_token(token)
    order = orders_repository.get_order_by_id(db, order_id)

    if order.buyer_id != user_id:
        check_user_role(token, db, ["Admin"])

    order_info = OrderInfo(
        id=order.id,
        total_price=order.total_price,
        status=order.status,
        created_at=order.created_at,
        buyer_id=order.buyer_id,
        items=[
            OrderedProductDetail(
                product=ProductInfo(
                    id=item.product.id,
                    name=item.product.name,
                    description=item.product.description,
                    category=item.product.category,
                    price=item.product.price
                ),
                quantity=item.quantity
            )
            for item in order.items
        ]
    )

    return order_info

# Update an order status (Buyers and Admins)
@router.patch("/{order_id}", status_code=200)
def update_order(
    order_id: int,
    order_input: OrderUpdate,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """
    Update an existing order's status.

    - **order_id**: The ID of the order to update.
    - **order_input**: Updated order details (e.g., status, quantity).
    - **token**: The access token of the user (must be the buyer or an Admin).
    - **db**: Database session.

    Returns:
    - A success message with the updated order's ID.
    """
    user_id = decode_jwt_token(token)
    order = orders_repository.get_order_by_id(db, order_id)

    # Only the buyer who created the order or an Admin can update the order
    if order.buyer_id != user_id:
        check_user_role(token, db, ["Admin"])

    updated_order = orders_repository.update_order(db, order_id, order_input)
    return Response(content=f"Order with id {order_id} updated", status_code=200)


# Delete an order (Admins only)
@router.delete("/{order_id}", status_code=200)
def delete_order(
    order_id: int, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    """
    Delete an order.

    - **order_id**: The ID of the order to delete.
    - **token**: The access token of the user (must be an Admin).
    - **db**: Database session.

    Returns:
    - A success message with the deleted order's ID.
    """
    check_user_role(token, db, ["Admin"])
    orders_repository.delete_order(db, order_id)
    return Response(content=f"Order with id {order_id} deleted", status_code=200)


@router.get("/farmer/orders", response_model=FarmerPurchasedProducts)
def get_farmer_orders(
        token: str = Depends(oauth2_scheme),
        db: Session = Depends(get_db)
):
    """
    Get all orders placed to a specific farmer.

    - **farmer_id**: The ID of the farmer.
    - **token**: The access token of the user.
    - **db**: Database session.

    Returns:
    - A list of orders with buyer and product details related to the farmer.
    """
    user_id = decode_jwt_token(token)

    check_user_role(token, db, ["Farmer"])
    user = users_repository.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials.")

    farmer_orders = orders_repository.get_purchased_products_by_farmer_user_id(db, user_id)
    return farmer_orders