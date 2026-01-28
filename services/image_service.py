from typing import List

from fastapi import UploadFile
from PIL import Image
import os


from utils.file_utils import (
    save_image_file,
    get_converted_image_path,
    delete_file, get_image_pdf_path,
)

SUPPORTED_FORMATS = ["jpg", "jpeg", "png", "webp", "bmp", "tiff"]

# 🧠 Pillow format mapping
FORMAT_MAP = {
    "jpg": "JPEG",
    "jpeg": "JPEG",
    "png": "PNG",
    "webp": "WEBP",
    "bmp": "BMP",
    "tiff": "TIFF",
}
# 📄 A4 size in points (72 DPI)
A4_WIDTH = 595
A4_HEIGHT = 842

async def convert_image_service(
    image: UploadFile,
    target_format: str,
):
    if not image.filename or "." not in image.filename:
        raise ValueError("Invalid image file")

    input_ext = image.filename.rsplit(".", 1)[-1].lower()
    target_format = target_format.lower()

    if input_ext not in SUPPORTED_FORMATS:
        raise ValueError(f"Unsupported input image format: {input_ext}")

    if target_format not in SUPPORTED_FORMATS:
        raise ValueError(f"Unsupported target format: {target_format}")

    input_path = save_image_file(image)

    try:
        img = Image.open(input_path)

        # JPG/JPEG needs RGB
        if target_format in ["jpg", "jpeg"]:
            img = img.convert("RGB")

        base_name = os.path.splitext(image.filename)[0]
        output_name = f"{base_name}.{target_format}"
        output_path = get_converted_image_path(output_name)

        # ✅ Correct Pillow format
        pillow_format = FORMAT_MAP[target_format]
        img.save(output_path, format=pillow_format)

        return output_path, output_name

    finally:
        delete_file(input_path)

async def images_to_pdf_service(images: List[UploadFile]):
    if not images:
        raise ValueError("No images provided")

    image_paths = []
    pdf_pages = []

    try:
        for image in images:
            if "." not in image.filename:
                raise ValueError("Invalid image file")

            ext = image.filename.rsplit(".", 1)[-1].lower()
            if ext not in SUPPORTED_FORMATS:
                raise ValueError(f"Unsupported format: {ext}")

            # Save image temporarily
            path = save_image_file(image)
            image_paths.append(path)

            img = Image.open(path)

            # Convert to RGB (PDF safe)
            if img.mode != "RGB":
                img = img.convert("RGB")

            # 🧠 Resize image to fit A4 (keep aspect ratio)
            img.thumbnail((A4_WIDTH - 40, A4_HEIGHT - 40))

            # 🧾 Create white A4 page
            page = Image.new("RGB", (A4_WIDTH, A4_HEIGHT), "white")

            # 📐 Center image on page
            x = (A4_WIDTH - img.width) // 2
            y = (A4_HEIGHT - img.height) // 2

            page.paste(img, (x, y))

            pdf_pages.append(page)

        # 📄 Save PDF
        output_name = "scanned.pdf"
        output_path = get_image_pdf_path(output_name)

        pdf_pages[0].save(
            output_path,
            save_all=True,
            append_images=pdf_pages[1:]
        )

        return output_path, output_name

    finally:
        for path in image_paths:
            delete_file(path)



async def compress_image_service(
    image: UploadFile,
    target_kb: int | None = None,
    quality_percent: int | None = None,
):
    if "." not in image.filename:
        raise ValueError("Invalid image file")

    ext = image.filename.rsplit(".", 1)[-1].lower()

    if ext not in SUPPORTED_FORMATS:
        raise ValueError("Unsupported image format")

    if not target_kb and not quality_percent:
        raise ValueError("Either target_kb or quality_percent is required")

    input_path = save_image_file(image)

    try:
        img = Image.open(input_path)

        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")

        base_name = os.path.splitext(image.filename)[0]
        output_name = f"{base_name}_compressed.{ext}"
        output_path = get_converted_image_path(output_name)

        # 🎯 Case 1: Percentage based compression
        if quality_percent:
            quality = max(30, min(quality_percent, 95))

            img.save(
                output_path,
                quality=quality,
                optimize=True,
                progressive=True
            )

            return output_path, output_name

        # 🎯 Case 2: Target size based compression (SMART)
        target_bytes = target_kb * 1024

        quality = 95
        step = 5

        while quality >= 30:
            img.save(
                output_path,
                quality=quality,
                optimize=True,
                progressive=True
            )

            if os.path.getsize(output_path) <= target_bytes:
                break

            quality -= step

        return output_path, output_name

    finally:
        delete_file(input_path)
