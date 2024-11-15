from fastapi import APIRouter, Depends, Response, HTTPException
from sqlalchemy.orm import Session
from ..repositories.orders import OrdersRepository
from ..schemas.orders import OrderCreate, OrderUpdate, OrderInfo
from ..database.database import get_db
from fastapi.security import OAuth2PasswordBearer
from ..utils.security import decode_jwt_token, check_user_role

router = APIRouter()
orders_repository = OrdersRepository()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/users/login")


# Create a new order (Buyers only)
@router.post("/", status_code=200)
def create_order(
    order_input: OrderCreate,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """
    Create a new order.

    - **order_input**: The details of the order to create.
    - **token**: The access token of the user (must be a Buyer).
    - **db**: Database session.

    Returns:
    - A success message with the created order's ID.
    """
    check_user_role(token, db, ["Buyer"])
    user_id = decode_jwt_token(token)
    order = orders_repository.create_order(db, order_input, user_id)
    return Response(content=f"Order with id {order.id} created", status_code=200)


# Get an order by its ID
@router.get("/{order_id}", response_model=OrderInfo)
def get_order(
    order_id: int, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    """
    Get order details by its ID.

    - **order_id**: The ID of the order to retrieve.
    - **token**: The access token of the user.
    - **db**: Database session.

    Returns:
    - The order details if the user is the buyer or an Admin.
    """
    user_id = decode_jwt_token(token)
    order = orders_repository.get_order_by_id(db, order_id)

    # Ensure that the user is either the buyer or an Admin
    if order.buyer_id != user_id:
        check_user_role(token, db, ["Admin"])

    return order


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