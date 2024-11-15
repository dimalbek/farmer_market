from fastapi import FastAPI
from app.api.auth import router as auth_router
from app.api.products import router as products_router
from app.api.profiles import router as profiles_router
from app.api.comments import router as comments_router
from app.api.orders import router as orders_router 
from fastapi.middleware.cors import CORSMiddleware
import requests
import time
import threading

app = FastAPI()

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

@app.get("/healthcheck")
def health_check():
    return {"status": "ok"}


# # ping
# def send_ping():
#     while True:
#         try:
#             response = requests.get(
#                 "LINK to deployed back"
#             )
#             print(f"Ping status: {response.status_code}")
#         except Exception as e:
#             print(f"Failed to ping the server: {e}")
#         time.sleep(600)  # Sleep 10 minutes


# # Run ping thread
# ping_thread = threading.Thread(target=send_ping)
# ping_thread.daemon = True
# ping_thread.start()