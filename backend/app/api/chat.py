from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List
from ..database.database import get_db
from ..utils.security import get_current_user_websocket, get_current_user
from ..repositories.chat import ChatRepository
from ..repositories.users import UsersRepository
from ..database.models import User
from ..schemas.chat import MessageResponse, ChatResponse, ChatResponseWithMessages
from ..utils.connection_manager import ConnectionManager
from fastapi.encoders import jsonable_encoder
from fastapi.websockets import WebSocketState
router = APIRouter()
chat_repository = ChatRepository()
users_repository = UsersRepository()
manager = ConnectionManager()
import logging


logging.basicConfig(
    level=logging.INFO,  # Записывать все логи уровня INFO и выше
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),  # Запись логов в консоль
        logging.FileHandler("app.log")  # Запись логов в файл
    ]
)

logger = logging.getLogger(__name__)
@router.get("/chats/{chat_id}", response_model=ChatResponseWithMessages)
def get_chat(chat_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    # Check if the chat exists
    chat = chat_repository.get_chat_by_id(db, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Check if the user is part of the chat
    if user.id != chat.buyer_id and user.id != chat.farmer_id:
        raise HTTPException(status_code=403, detail="You are not a participant in this chat")

    # Enforce communication rules
    if user.role == "Farmer":
        # Farmers cannot communicate with other farmers
        other_user = users_repository.get_user_by_id(db, chat.buyer_id)
        if other_user.role != "Buyer":
            raise HTTPException(status_code=403, detail="Farmers cannot communicate with other farmers")
    elif user.role == "Buyer":
        # Buyers cannot communicate with other buyers
        other_user = users_repository.get_user_by_id(db, chat.farmer_id)
        if other_user.role != "Farmer":
            raise HTTPException(status_code=403, detail="Buyers cannot communicate with other buyers")
    else:
        # Admins can communicate with anyone
        pass

    # Get the messages
    messages = chat_repository.get_recent_messages(db, chat_id, limit=50)

    # Return chat info and messages
    return ChatResponseWithMessages(
        id=chat.id,
        buyer_id=chat.buyer_id,
        farmer_id=chat.farmer_id,
        messages=messages
    )

# WebSocket endpoint for chat (simplified)
@router.websocket("/ws/chat/{chat_id}")
async def websocket_chat(websocket: WebSocket, chat_id: int, db: Session = Depends(get_db)):
    logger.info(f"New WebSocket connection request for chat_id={chat_id}")
    user = await get_current_user_websocket(websocket, db)
    logger.info(f"Authenticated WebSocket user: user_id={user.id}, chat_id={chat_id}")

    chat = chat_repository.get_chat_by_id(db, chat_id)
    if not chat:
        await websocket.close(code=1008)
        logger.error("Chat not found")
        return

    if user.id not in [chat.buyer_id, chat.farmer_id]:
        await websocket.close(code=1008)
        logger.error("User not a participant of this chat")
        return

    await manager.connect(chat_id, websocket)
    logger.info(f"WebSocket connection established: user_id={user.id}, chat_id={chat_id}")

    try:
        while True:
            data = await websocket.receive_json()
            logger.info(f"Received WebSocket message: {data}")

            content = data.get("content")
            if content:
                message = chat_repository.create_message(
                    db, chat_id=chat_id, sender_id=user.id, content=content
                )
                logger.info(f"Message saved: message_id={message.id}, chat_id={chat_id}, user_id={user.id}")

                message_orm = MessageResponse.from_orm(message)
                message_dict = jsonable_encoder(message_orm)
                await manager.broadcast(chat_id, message_dict)
    except WebSocketDisconnect:
        logger.warning(f"WebSocket disconnected: chat_id={chat_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
    finally:
        if websocket.client_state != WebSocketState.DISCONNECTED:
            await websocket.close()
        manager.disconnect(chat_id, websocket)
        logger.info(f"WebSocket connection closed: user_id={user.id}, chat_id={chat_id}")

# Endpoint for buyer to initiate a chat with a farmer
@router.post("/chats/{farmer_id}", response_model=ChatResponse)
def create_chat_with_farmer(farmer_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    logger.info(f"Starting to create chat with farmer_id={farmer_id} for user_id={user.id}, role={user.role}")

    if user.role != "Buyer":
        logger.error(f"Permission denied: user_id={user.id} is not a Buyer")
        raise HTTPException(status_code=403, detail="Only buyers can initiate chats")

    farmer = users_repository.get_user_by_id(db, farmer_id)
    if not farmer or farmer.role != "Farmer":
        logger.error(f"Farmer not found: farmer_id={farmer_id}")
        raise HTTPException(status_code=404, detail="Farmer not found")

    existing_chat = chat_repository.get_chat_between_users(db=db, buyer_id=user.id, farmer_id=farmer_id)
    if existing_chat:
        logger.info(f"Existing chat found: chat_id={existing_chat.id} for user_id={user.id}")
        return ChatResponse.from_orm(existing_chat)

    new_chat = chat_repository.create_chat(db=db, buyer_id=user.id, farmer_id=farmer_id)
    logger.info(f"Chat successfully created: chat_id={new_chat.id}")
    return ChatResponse.from_orm(new_chat)

# Endpoint to get chats for the current user
@router.get("/chats/", response_model=List[ChatResponse])
def get_user_chats(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    chats = chat_repository.get_user_chats(db, user_id=user.id, role=user.role)
    return chats