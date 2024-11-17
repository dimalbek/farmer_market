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