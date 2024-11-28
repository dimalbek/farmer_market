from pydantic import BaseModel
from typing import List
from datetime import datetime

class MessageResponse(BaseModel):
    id: int
    chat_id: int
    sender_id: int
    content: str
    timestamp: datetime


    class Config:
        from_attributes=True

class ChatResponse(BaseModel):
    id: int
    buyer_id: int
    farmer_id: int

    class Config:
        from_attributes = True

class ChatResponseWithMessages(ChatResponse):
    messages: List[MessageResponse]

    class Config:
        from_attributes = True