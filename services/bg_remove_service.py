import os
from uuid import uuid4
from PIL import Image
from rembg import remove
from fastapi import UploadFile

BASE_DIR = "static/bgremove"
PREVIEW_DIR = os.path.join(BASE_DIR, "preview")
FINAL_DIR = os.path.join(BASE_DIR, "final")

os.makedirs(PREVIEW_DIR, exist_ok=True)
os.makedirs(FINAL_DIR, exist_ok=True)

async def bg_remove_service(
    image: UploadFile,
    bg_type: str,
    bg_color: str | None = None,
    bg_image: UploadFile | None = None,
):
    uid = str(uuid4())

    input_path = os.path.join(BASE_DIR, f"{uid}_input.png")
    preview_path = os.path.join(PREVIEW_DIR, f"{uid}_preview.png")
    final_path = os.path.join(FINAL_DIR, f"{uid}_final.png")

    # save input
    with open(input_path, "wb") as f:
        f.write(await image.read())

    original = Image.open(input_path).convert("RGBA")

    # remove bg
    removed = remove(original)
    removed.save(preview_path)

    final_img = removed

    # solid color bg
    if bg_type == "color" and bg_color:
        bg = Image.new("RGBA", removed.size, bg_color)
        bg.paste(removed, (0, 0), removed)
        final_img = bg

    # image bg
    if bg_type == "image" and bg_image:
        bg_path = os.path.join(BASE_DIR, f"{uid}_bg.png")
        with open(bg_path, "wb") as f:
            f.write(await bg_image.read())

        bg = Image.open(bg_path).convert("RGBA")
        bg = bg.resize(removed.size)
        bg.paste(removed, (0, 0), removed)
        final_img = bg

    final_img.save(final_path)

    return {
        "preview": f"/static/bgremove/preview/{uid}_preview.png",
        "final": f"/static/bgremove/final/{uid}_final.png",
    }
