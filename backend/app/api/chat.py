from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from ..repositories.chat import ChatRepository
from ..schemas.chat import ChatCreate, MessageCreate
from ..database.database import get_db
from ..utils.security import decode_jwt_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/users/login")
router = APIRouter()
chat_repository = ChatRepository()


# Route to initiate a chat
@router.post("/chats/")
def create_chat(chat_data: ChatCreate, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user_id = decode_jwt_token(token)

    # Ensure the user is a buyer
    if chat_data.buyer_id != user_id:
        raise HTTPException(status_code=403, detail="Only buyers can initiate a chat")

    chat = chat_repository.create_chat(db, chat_data)
    return {"chat_id": chat.id}


# WebSocket for real-time chat
@router.websocket("/ws/chats/{chat_id}")
async def chat_websocket(websocket: WebSocket, chat_id: int, token: str = Depends(oauth2_scheme),
                         db: Session = Depends(get_db)):
    await websocket.accept()
    user_id = decode_jwt_token(token)

    chat = chat_repository.get_chat_by_id(db, chat_id)
    if not chat:
        await websocket.close(code=1008)
        raise HTTPException(status_code=404, detail="Chat not found")

    # Ensure user is a participant
    if user_id not in [chat.buyer_id, chat.farmer_id]:
        await websocket.close(code=1008)
        raise HTTPException(status_code=403, detail="Access forbidden")

    try:
        while True:
            data = await websocket.receive_json()
            message = chat_repository.create_message(db, chat_id, user_id, MessageCreate(content=data["content"]))
            await websocket.send_json({"sender_id": message.sender_id, "content": message.content})
    except WebSocketDisconnect:
        print("WebSocket disconnected")
