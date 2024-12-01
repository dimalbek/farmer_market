# # backend/app/utils/email_utils.py

# from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
# from fastapi import BackgroundTasks
# from pydantic import EmailStr
# from typing import List

from app.config import MAIL_PASSWORD, MAIL_USERNAME
from fastapi import HTTPException
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from pydantic import EmailStr
from starlette.responses import JSONResponse

# print(f"MAIL_USERNAME: {MAIL_USERNAME}")
# print(f"MAIL_FROM: {MAIL_FROM}")
# print(f"MAIL_PORT: {MAIL_PORT}")
# print(f"MAIL_SERVER: {MAIL_SERVER}")
# print(f"MAIL_PASSWORD: {MAIL_PASSWORD}")

# # Email Configuration
# conf = ConnectionConfig(
#     MAIL_USERNAME=MAIL_USERNAME,
#     MAIL_PASSWORD=MAIL_PASSWORD,
#     MAIL_FROM=MAIL_FROM,
#     MAIL_PORT=MAIL_PORT,
#     MAIL_SERVER=MAIL_SERVER,
#     MAIL_FROM_NAME=MAIL_FROM_NAME,
#     MAIL_STARTTLS=MAIL_TLS,      # Correct field name
#     MAIL_SSL_TLS=MAIL_SSL,       # Correct field name
#     USE_CREDENTIALS=True,
#     TEMPLATE_FOLDER=None          # Disable templates for plain text emails
# )

# email_utils.py


# Email configuration
conf = ConnectionConfig(
    MAIL_USERNAME = MAIL_USERNAME,
    MAIL_PASSWORD = MAIL_PASSWORD,
    MAIL_FROM = MAIL_USERNAME,
    MAIL_PORT = 587,
    MAIL_SERVER = "smtp.gmail.com",
    MAIL_FROM_NAME="Farmus",
    MAIL_STARTTLS = True,
    MAIL_SSL_TLS = False,
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True
)

async def send_email(recipient: EmailStr, subject: str, body: str) -> JSONResponse:
    """
    Send an email using the FastAPI Mail service.
    
    Parameters:
    - subject: Subject of the email
    - recipients: List of email addresses to send the email to
    - body: HTML body of the email

    Returns:
    - JSONResponse indicating success or failure
    """
    html = f"""<p>{body}</p> """

    # Create the message object
    message = MessageSchema(
        subject=subject,
        recipients=[recipient],
        body=html,
        subtype=MessageType.html
    )
    
    fm = FastMail(conf)
    
    try:
        # Send the email
        await fm.send_message(message)
        return JSONResponse(status_code=200, content={"message": "Email has been sent successfully"})
    except Exception as e:
        # Handle any errors that occur during the sending process
        raise HTTPException(status_code=500, detail=f"Error sending email: {str(e)}")



# async def send_email_async(subject: str, email_to: EmailStr, body: str):
#     message = MessageSchema(
#         subject=subject,
#         recipients=[email_to],
#         body=body,
#         subtype='plain',  # Send as plain text
#     )
    
#     fm = FastMail(conf)
#     await fm.send_message(message)

# def send_email_background(background_tasks: BackgroundTasks, subject: str, email_to: EmailStr, body: str):
#     message = MessageSchema(
#         subject=subject,
#         recipients=[email_to],
#         body=body,
#         subtype='plain',  # Send as plain text
#     )
#     fm = FastMail(conf)
#     background_tasks.add_task(
#         fm.send_message, message
#     )

# # Optional: Test the email sending functionality
# if __name__ == "__main__":
#     import asyncio

#     async def test_email():
#         await send_email_async(
#             subject="Test Email",
#             email_to="dimalbek@gmail.com",  # Replace with a valid email
#             body="This is a test email sent from FastAPI using Fastmail."
#         )

#     asyncio.run(test_email())