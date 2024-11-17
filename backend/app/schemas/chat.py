from pydantic import BaseModel
from typing import List, Optional


class MessageBase(BaseModel):
    content: str


class MessageCreate(MessageBase):
    pass


class MessageInfo(MessageBase):
    sender_id: int


class ChatBase(BaseModel):
    buyer_id: int
    farmer_id: int


class ChatCreate(ChatBase):
    pass


class ChatInfo(ChatBase):
    id: int
    messages: Optional[List[MessageInfo]] = []

    class Config:
        orm_mode = True
