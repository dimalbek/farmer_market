from sqlalchemy.orm import Session

from ..database.models import Chat, Message


class ChatRepository:
    def get_chat_by_id(self, db: Session, chat_id: int) -> Chat:
        return db.query(Chat).filter(Chat.id == chat_id).first()

    def get_chat_between_users(self, db: Session, buyer_id: int, farmer_id: int) -> Chat:
        return db.query(Chat).filter(
            Chat.buyer_id == buyer_id,
            Chat.farmer_id == farmer_id
        ).first()

    def create_chat(self, db: Session, buyer_id: int, farmer_id: int) -> Chat:
        new_chat = Chat(buyer_id=buyer_id, farmer_id=farmer_id)
        db.add(new_chat)
        db.commit()
        db.refresh(new_chat)
        return new_chat

    def create_message(self, db: Session, chat_id: int, sender_id: int, content: str) -> Message:
        new_message = Message(chat_id=chat_id, sender_id=sender_id, content=content)
        db.add(new_message)
        db.commit()
        db.refresh(new_message)
        return new_message

    def get_user_chats(self, db: Session, user_id: int, role: str):
        if role == "Buyer":
            return db.query(Chat).filter(Chat.buyer_id == user_id).all()
        elif role == "Farmer":
            return db.query(Chat).filter(Chat.farmer_id == user_id).all()
        else:
            return []

    def get_chat_messages(self, db: Session, chat_id: int):
        return db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.timestamp).all()

    def get_recent_messages(self, db: Session, chat_id: int, limit: int = 50):
        messages = (
            db.query(Message)
            .filter(Message.chat_id == chat_id)
            .order_by(Message.timestamp.desc())
            .limit(limit)
            .all()
        )
        return list(reversed(messages))