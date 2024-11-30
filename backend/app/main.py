from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.api.auth import router as auth_router
from app.api.products import router as products_router
from app.api.profiles import router as profiles_router
from app.api.comments import router as comments_router
from app.api.orders import router as orders_router
from app.api.chat import router as chat_router
from app.api.admin import router as admin_router
from app.api.checkout import router as checkout_router
from app.api.webhook import router as webhooks_router
from app.api.cart import router as cart_router
from fastapi.middleware.cors import CORSMiddleware
import requests
import time
import threading
import socketio
app = FastAPI()

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins=[])
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)

# Include routers
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(products_router, prefix="/products", tags=["products"])
app.include_router(profiles_router, prefix="/profiles", tags=["profiles"])
app.include_router(comments_router, prefix="/comments", tags=["comments"])
app.include_router(orders_router, prefix="/orders", tags=["orders"])
app.include_router(chat_router, prefix="/chat", tags=["chat"])
app.include_router(admin_router)
app.include_router(checkout_router, prefix="/checkout", tags=["Checkout"])
app.include_router(webhooks_router, prefix="/webhooks", tags=["Webhooks"])
app.include_router(cart_router, prefix="/cart", tags=["Carts"])
app.mount("/static", StaticFiles(directory="uploaded_images"), name="static")


@app.get("/healthcheck")
def health_check():
    return {"status": "ok"}


# ping
def send_ping():
    while True:
        try:
            response = requests.get(
                "https://8379-178-91-253-103.ngrok-free.app/healthcheck"
            )
            print(f"Ping status: {response.status_code}")
        except Exception as e:
            print(f"Failed to ping the server: {e}")
        time.sleep(600)  # Sleep 10 minutes


# Run ping thread
ping_thread = threading.Thread(target=send_ping)
ping_thread.daemon = True
ping_thread.start()