from fastapi import APIRouter, Depends, Response, HTTPException
from sqlalchemy.orm import Session
from ..repositories.comments import CommentsRepository
from ..schemas.comments import CommentCreate, CommentInfoList
from ..database.database import get_db
from fastapi.security import OAuth2PasswordBearer
from ..utils.security import decode_jwt_token, check_user_role

router = APIRouter()
comments_repository = CommentsRepository()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/users/login")


# Create a comment on a product (Anyone)
@router.post("/products/{product_id}/comments", status_code=200)
def create_comment(
    product_id: int,
    comment_input: CommentCreate,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """
    Create a comment for a specific product.

    - **product_id**: The ID of the product to comment on.
    - **comment_input**: The content of the comment.
    - **token**: The access token of the user.
    - **db**: Database session.

    Returns:
    - A success message with the created comment's ID and the associated product ID.
    """
    user_id = decode_jwt_token(token)
    comment = comments_repository.create_comment(db, user_id, product_id, comment_input)
    return Response(
        status_code=200,
        content=f"Comment with id {comment.id} created on product with id {product_id}",
    )


# Get comments on a product (Anyone)
@router.get("/products/{product_id}/comments", response_model=CommentInfoList)
def get_comments(product_id: int, db: Session = Depends(get_db)):
    """
    Get all comments for a specific product.

    - **product_id**: The ID of the product to retrieve comments for.
    - **db**: Database session.

    Returns:
    - A list of comments for the specified product.
    """
    comments = comments_repository.get_comment_by_product_id(db, product_id)
    return CommentInfoList(comments=comments)


# Update a comment (Users and Admins)
@router.patch("/products/{product_id}/comments/{comment_id}", status_code=200)
def update_comment(
    product_id: int,
    comment_id: int,
    comment_input: str,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """
    Update a comment for a specific product.

    - **product_id**: The ID of the product the comment belongs to.
    - **comment_id**: The ID of the comment to update.
    - **comment_input**: The new content for the comment.
    - **token**: The access token of the user.
    - **db**: Database session.

    Returns:
    - A success message with the updated comment's ID.
    """
    user_id = decode_jwt_token(token)
    comment = comments_repository.get_comment_by_id(db, comment_id)

    # Check if the user owns the comment or is an Admin
    if comment.author_id != user_id:
        check_user_role(token, db, ["Admin"])

    comments_repository.update_comment(db, comment_id, comment_input)
    return Response(status_code=200, content=f"Comment with id {comment_id} updated")


# Delete a comment (Users and Admins)
@router.delete("/products/{product_id}/comments/{comment_id}", status_code=200)
def delete_comment(
    product_id: int,
    comment_id: int,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """
    Delete a comment for a specific product.

    - **product_id**: The ID of the product the comment belongs to.
    - **comment_id**: The ID of the comment to delete.
    - **token**: The access token of the user.
    - **db**: Database session.

    Returns:
    - A success message with the deleted comment's ID.
    """
    user_id = decode_jwt_token(token)
    comment = comments_repository.get_comment_by_id(db, comment_id)

    # Check if the user owns the comment or is an Admin
    if comment.author_id != user_id:
        check_user_role(token, db, ["Admin"])

    comments_repository.delete_comment(db, comment_id)
    return Response(status_code=200, content=f"Comment with id {comment_id} deleted")