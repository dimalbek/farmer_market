# In app/utils/file_upload.py

import os
from typing import List
from uuid import uuid4

from fastapi import UploadFile

UPLOAD_DIRECTORY = "uploaded_images"

def save_product_images(images: List[UploadFile]) -> List[str]:
    image_urls = []
    os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)
    for image in images:
        # You might want to add validation for image types here
        # Reset file pointer to the beginning
        image.file.seek(0)

        # Generate a unique filename
        file_extension = os.path.splitext(image.filename)[1]
        unique_filename = f"{uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIRECTORY, unique_filename)

        # Save the file
        with open(file_path, "wb") as buffer:
            buffer.write(image.file.read())

        image_url = f"/static/{unique_filename}"
        image_urls.append(image_url)
    return image_urls