from fastapi import HTTPException
from sqlalchemy.orm import Session
from ..database.models import Comment, Product, User
from ..schemas.comments import CommentCreate, CommentInfo

class CommentsRepository:
    def create_comment(
        self, db: Session, user_id: int, product_id: int, comment_data: CommentCreate
    ):
        """Create a comment for a given product by a user."""
        try:
            user = db.query(User).filter(User.id == user_id).first()
            product = db.query(Product).filter(Product.id == product_id).first()

            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            if not product:
                raise HTTPException(status_code=404, detail="Product not found")

            new_comment = Comment(
                content=comment_data.content, author_id=user_id, product_id=product_id
            )
            db.add(new_comment)
            db.commit()
            db.refresh(new_comment)

        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=str(e))

        return new_comment

    def get_comment_by_product_id(self, db: Session, product_id: int):
        """Retrieve all comments for a given product."""
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        comments = db.query(Comment).filter(Comment.product_id == product_id).all()
        return [CommentInfo.from_orm(comment) for comment in comments]

    def get_comment_by_id(self, db: Session, comment_id: int):
        """Retrieve a specific comment by its ID."""
        comment = db.query(Comment).filter(Comment.id == comment_id).first()
        if not comment:
            raise HTTPException(status_code=404, detail="Comment not found")
        return comment

    def update_comment(self, db: Session, comment_id: int, new_content: str):
        """Update the content of a specific comment."""
        comment = self.get_comment_by_id(db, comment_id)
        comment.content = new_content

        try:
            db.commit()
            db.refresh(comment)
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=str(e))

        return comment

    def delete_comment(self, db: Session, comment_id: int):
        """Delete a specific comment."""
        comment = self.get_comment_by_id(db, comment_id)

        try:
            db.delete(comment)
            db.commit()
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=str(e))
