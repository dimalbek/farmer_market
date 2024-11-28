from typing import Optional

from sqlalchemy.orm import Session
from ..database.models import Chat, Message
from ..schemas.chat import ChatCreate, MessageCreate

class ChatRepository:
    def create_chat(self, db: Session, chat_data: ChatCreate) -> Chat:
        chat = Chat(buyer_id=chat_data.buyer_id, farmer_id=chat_data.farmer_id)
        db.add(chat)
        db.commit()
        db.refresh(chat)
        return chat

    def get_chat_by_id(self, db: Session, chat_id: int) -> Chat:
        return db.query(Chat).filter(Chat.id == chat_id).first()

    def create_message(self, db: Session, chat_id: int, sender_id: int, message_data: MessageCreate) -> Message:
        message = Message(chat_id=chat_id, sender_id=sender_id, content=message_data.content)
        db.add(message)
        db.commit()
        db.refresh(message)
        return message


    def get_message_history(self, db: Session, chat_id: int):
        """
        Retrieve the full message history for a given chat.
        """
        return db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.id).all()

    def get_chat_between_users(self, db: Session, buyer_id: int, farmer_id: int) -> Optional[Chat]:
        """
        Check if a chat already exists between a buyer and a farmer.

        :param db: Database session
        :param buyer_id: The ID of the buyer
        :param farmer_id: The ID of the farmer
        :return: The existing Chat object if found, otherwise None
        """
        return db.query(Chat).filter(
            Chat.buyer_id == buyer_id,
            Chat.farmer_id == farmer_id
        ).first()