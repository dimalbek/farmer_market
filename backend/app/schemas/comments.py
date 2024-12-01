from datetime import datetime
from typing import List

from pydantic import BaseModel


class CommentCreate(BaseModel):
    content: str


class CommentInfo(BaseModel):
    id: int
    content: str
    created_at: datetime
    author_id: int

    class Config:
        orm_mode = True
        from_attributes = True


class CommentInfoList(BaseModel):
    comments: List[CommentInfo]
