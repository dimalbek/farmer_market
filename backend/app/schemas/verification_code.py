
from pydantic import BaseModel, EmailStr


class VerificationCodeCreate(BaseModel):
    email: EmailStr
    purpose: str  # 'registration' or 'login'

class VerificationCodeVerify(BaseModel):
    email: EmailStr
    code: str

class UserRegistrationData(BaseModel):
    email: EmailStr
    code: str
    fullname: str
    password: str
    phone: str
    role: str

    class Config:
        # This allows FastAPI to accept form data, not just JSON
        orm_mode = True