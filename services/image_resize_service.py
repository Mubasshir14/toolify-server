# import os
# from uuid import uuid4
# from fastapi import UploadFile
# from PIL import Image
#
# BASE_DIR = os.path.abspath("static/image_resize")
# ORIGINAL_DIR = os.path.join(BASE_DIR, "originals")
# MODIFIED_DIR = os.path.join(BASE_DIR, "modified")
#
# os.makedirs(ORIGINAL_DIR, exist_ok=True)
# os.makedirs(MODIFIED_DIR, exist_ok=True)
#
# SUPPORTED_FORMATS = ("jpg", "jpeg", "png", "webp")
#
# async def image_resize_service(
#     image: UploadFile,
#     resize_mode: str | None,
#     width: int | None,
#     height: int | None,
#     percentage: int | None,
#     crop: dict | None,
#     rotate: int | None = 0,
# ):
#     ext = image.filename.rsplit(".", 1)[-1].lower()
#     if ext not in SUPPORTED_FORMATS:
#         raise ValueError("Unsupported image format")
#
#     uid = str(uuid4())
#     original_path = os.path.join(ORIGINAL_DIR, f"{uid}.{ext}")
#     modified_path = os.path.join(MODIFIED_DIR, f"{uid}.{ext}")
#
#     with open(original_path, "wb") as f:
#         f.write(await image.read())
#
#     img = Image.open(original_path)
#
#     # 🔹 CROP
#     if crop:
#         x = int(crop["x"])
#         y = int(crop["y"])
#         w = int(crop["width"])
#         h = int(crop["height"])
#         img = img.crop((x, y, x + w, y + h))
#
#     # 🔹 ROTATE
#     if rotate and rotate != 0:
#         img = img.rotate(-rotate, expand=True)
#
#     # 🔹 RESIZE
#     if resize_mode == "percentage":
#         if not percentage:
#             raise ValueError("Percentage required")
#         scale = percentage / 100
#         img = img.resize(
#             (int(img.width * scale), int(img.height * scale)),
#             Image.LANCZOS
#         )
#
#     elif resize_mode == "dimension":
#         if not width or not height:
#             raise ValueError("Width & height required")
#         img = img.resize((width, height), Image.LANCZOS)
#
#     if img.mode in ("RGBA", "P"):
#         img = img.convert("RGB")
#
#     img.save(modified_path, quality=95, optimize=True)
#
#     return {
#         "original": f"/static/image_resize/originals/{uid}.{ext}",
#         "modified": f"/static/image_resize/modified/{uid}.{ext}",
#         "width": img.width,
#         "height": img.height
#     }
import os
from uuid import uuid4
from fastapi import UploadFile
from PIL import Image

BASE_DIR = os.path.abspath("static/image_resize")
ORIGINAL_DIR = os.path.join(BASE_DIR, "originals")
MODIFIED_DIR = os.path.join(BASE_DIR, "modified")

os.makedirs(ORIGINAL_DIR, exist_ok=True)
os.makedirs(MODIFIED_DIR, exist_ok=True)

SUPPORTED_FORMATS = ("jpg", "jpeg", "png", "webp")

async def image_resize_service(
    image: UploadFile,
    resize_mode: str | None,
    width: int | None,
    height: int | None,
    percentage: int | None,
    crop: dict | None,
    rotate: int = 0,
):
    ext = image.filename.rsplit(".", 1)[-1].lower()
    if ext not in SUPPORTED_FORMATS:
        raise ValueError("Unsupported image format")

    uid = str(uuid4())
    original_path = os.path.join(ORIGINAL_DIR, f"{uid}.{ext}")
    modified_path = os.path.join(MODIFIED_DIR, f"{uid}.{ext}")

    with open(original_path, "wb") as f:
        f.write(await image.read())

    img = Image.open(original_path)

    if crop:
        x, y, w, h = map(int, (crop["x"], crop["y"], crop["width"], crop["height"]))
        img = img.crop((x, y, x + w, y + h))

    if rotate:
        img = img.rotate(-rotate, expand=True)

    if resize_mode == "percentage":
        scale = percentage / 100
        img = img.resize((int(img.width * scale), int(img.height * scale)), Image.LANCZOS)
    elif resize_mode == "dimension":
        img = img.resize((width, height), Image.LANCZOS)

    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")

    img.save(modified_path, quality=95)

    return {
        "uid": uid,
        "ext": ext,
        "preview": f"/static/image_resize/modified/{uid}.{ext}"
    }
