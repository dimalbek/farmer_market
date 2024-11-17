from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from ..repositories.chat import ChatRepository
from ..schemas.chat import ChatCreate, MessageCreate
from ..database.database import get_db
from ..utils.security import decode_jwt_token, check_user_role
import logging

router = APIRouter()
chat_repository = ChatRepository()

# Инициализация логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("websocket-chat")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/users/login")
# Подключения WebSocket
active_connections = {}

@router.post("/chats/")
def create_chat(chat_data: ChatCreate, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Create a new chat between a buyer and a farmer.
    """
    user_id = decode_jwt_token(token)

    # Ensure the user is a buyer
    check_user_role(token, db, ["Buyer"])
    chat = chat_repository.create_chat(db, chat_data)
    return {"chat_id": chat.id}

@router.websocket("/ws/chats/{chat_id}")
async def chat_websocket(websocket: WebSocket, chat_id: int, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    WebSocket endpoint for real-time chat between a buyer and a farmer.
    """
    await websocket.accept()
    user_id = decode_jwt_token(token)

    chat = chat_repository.get_chat_by_id(db, chat_id)
    if not chat:
        logger.error(f"Chat with id {chat_id} not found")
        await websocket.close(code=1008)
        raise HTTPException(status_code=404, detail="Chat not found")

    if user_id not in [chat.buyer_id, chat.farmer_id]:
        logger.error(f"Unauthorized access by user {user_id} to chat {chat_id}")
        await websocket.close(code=1008)
        raise HTTPException(status_code=403, detail="Access forbidden")

    # Управление подключениями
    if chat_id not in active_connections:
        active_connections[chat_id] = []
    active_connections[chat_id].append(websocket)

    # Отправка истории сообщений при подключении
    messages = chat_repository.get_messages_by_chat_id(db, chat_id)
    await websocket.send_json({
        "type": "history",
        "messages": [
            {"sender_id": msg.sender_id, "content": msg.content} for msg in messages
        ]
    })

    try:
        while True:
            data = await websocket.receive_json()

            # Валидация данных
            if not data.get("content") or not data["content"].strip():
                logger.warning(f"Empty message received from user {user_id} in chat {chat_id}")
                await websocket.send_json({"error": "Message content cannot be empty"})
                continue

            # Сохранение сообщения
            message = chat_repository.create_message(db, chat_id, user_id, MessageCreate(content=data["content"]))
            logger.info(f"Message from user {user_id} saved in chat {chat_id}: {message.content}")

            # Отправка сообщения всем участникам чата
            for connection in active_connections[chat_id]:
                await connection.send_json({"type": "message", "sender_id": message.sender_id, "content": message.content})
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for user {user_id} in chat {chat_id}")
        active_connections[chat_id].remove(websocket)
        if not active_connections[chat_id]:  # Удаляем пустую запись
            del active_connections[chat_id]
    except Exception as e:
        logger.exception(f"Unexpected error in WebSocket for chat {chat_id}: {e}")
        await websocket.close(code=1011)