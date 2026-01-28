import os, zipfile
from fastapi import UploadFile
from pdf2image import convert_from_path
from uuid import uuid4
from PIL import Image

POPPLER_PATH = r"C:\poppler-25.12.0\Library\bin"

BASE_DIR = "pdf_to_image"
PREVIEW_DIR = os.path.join(BASE_DIR, "previews")
ZIP_DIR = os.path.join(BASE_DIR, "zips")

os.makedirs(PREVIEW_DIR, exist_ok=True)
os.makedirs(ZIP_DIR, exist_ok=True)

async def pdf_to_image_service(pdf: UploadFile):
    uid = str(uuid4())
    pdf_path = os.path.join(BASE_DIR, f"{uid}.pdf")

    with open(pdf_path, "wb") as f:
        f.write(await pdf.read())

    images = convert_from_path(
        pdf_path,
        dpi=200,
        poppler_path=POPPLER_PATH,
        fmt="png",
        thread_count=2
    )

    image_names = []

    for i, img in enumerate(images, start=1):
        img = img.convert("RGB")
        name = f"{uid}_page_{i}.png"
        path = os.path.join(PREVIEW_DIR, name)
        img.save(path, "PNG")
        image_names.append(name)

    zip_name = f"{uid}.zip"
    zip_path = os.path.join(ZIP_DIR, zip_name)

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
        for name in image_names:
            z.write(os.path.join(PREVIEW_DIR, name), name)

    os.remove(pdf_path)

    return {
        "zip": zip_name,
        "previews": image_names
    }
