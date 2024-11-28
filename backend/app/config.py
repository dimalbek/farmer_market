# backend/app/config.py

from dotenv import load_dotenv
import os
STRIPE_PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY")
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
from pathlib import Path

# Define the path to the .env file
env_path = Path(__file__).resolve().parents[2] / '.env'  # Adjust based on your project structure
print(f".env !!!!!!!! {env_path}")  # Use f-string to print the actual path

# Load the .env file
load_dotenv(dotenv_path=env_path)

# Security
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY is not set in the environment variables.")

# Email Configuration
MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
# MAIL_FROM = os.getenv("MAIL_FROM")
# MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
# MAIL_SERVER = os.getenv("MAIL_SERVER")
# MAIL_FROM_NAME = os.getenv("MAIL_FROM_NAME")
# MAIL_TLS = os.getenv("MAIL_TLS", "True").lower() in ("true", "1", "t")
# MAIL_SSL = os.getenv("MAIL_SSL", "False").lower() in ("true", "1", "t")

# JWT Settings
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 14400))