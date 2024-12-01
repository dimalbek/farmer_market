
from pydantic import BaseModel, EmailStr, Field
from pydantic import ConfigDict

class PasswordResetInitiate(BaseModel):
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)

class PasswordResetConfirm(BaseModel):
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6)  # Assuming a 6-digit code
    new_password: str = Field(..., min_length=4)

    model_config = ConfigDict(from_attributes=True)