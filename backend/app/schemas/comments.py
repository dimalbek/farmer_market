from pydantic import BaseModel
from typing import List
from datetime import datetime


class CommentCreate(BaseModel):
    content: str


class CommentInfo(BaseModel):
    id: int
    content: str
    created_at: datetime
    author_id: int


class CommentInfoList(BaseModel):
    comments: List[CommentInfo]
