from fastapi import FastAPI
from app.api.auth import router as auth_router
from app.api.products import router as products_router
from app.api.profiles import router as profiles_router
from app.api.comments import router as comments_router

app = FastAPI()

# Include routers
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(products_router, prefix="/products", tags=["products"])
app.include_router(profiles_router, prefix="/profiles", tags=["profiles"])
app.include_router(comments_router, prefix="/comments", tags=["comments"])
