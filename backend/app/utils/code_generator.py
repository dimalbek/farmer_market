import random
import string


def generate_verification_code(length: int = 6) -> str:
    """Generate a numeric verification code of specified length."""
    return ''.join(random.choices(string.digits, k=length))