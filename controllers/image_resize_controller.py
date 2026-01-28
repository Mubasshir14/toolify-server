# from fastapi import APIRouter, UploadFile, File, Form
# from fastapi.responses import JSONResponse
# from services.image_resize_service import image_resize_service
# import json
#
# router = APIRouter(tags=["Image Resize"])
#
# @router.post("/resize")
# async def resize_image(
#     image: UploadFile = File(...),
#     resize_mode: str | None = Form(None),
#     width: int | None = Form(None),
#     height: int | None = Form(None),
#     percentage: int | None = Form(None),
#     crop: str | None = Form(None),
#     rotate: int | None = Form(0),
# ):
#     try:
#         crop_data = json.loads(crop) if crop else None
#
#         result = await image_resize_service(
#             image=image,
#             resize_mode=resize_mode,
#             width=width,
#             height=height,
#             percentage=percentage,
#             crop=crop_data,
#             rotate=rotate,
#         )
#
#         return {
#             "status": "success",
#             "original_preview": result["original"],
#             "modified_preview": result["modified"],
#             "output_size": {
#                 "width": result["width"],
#                 "height": result["height"],
#             },
#         }
#
#     except Exception as e:
#         print("❌ IMAGE RESIZE ERROR:", e)
#         return JSONResponse(status_code=400, content={"message": str(e)})
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import FileResponse
from services.image_resize_service import image_resize_service
import json, os

router = APIRouter(tags=["Image Resize"])

@router.post("/resize")
async def resize_image(
    image: UploadFile = File(...),
    resize_mode: str = Form(...),
    width: int | None = Form(None),
    height: int | None = Form(None),
    percentage: int | None = Form(None),
    crop: str | None = Form(None),
    rotate: int = Form(0),
):
    crop_data = json.loads(crop) if crop else None

    data = await image_resize_service(
        image, resize_mode, width, height, percentage, crop_data, rotate
    )

    return {
        "preview": data["preview"],
        "download": f"/api/image/download/{data['uid']}.{data['ext']}"
    }


@router.get("/download/{filename}")
def download_image(filename: str):
    path = os.path.join("static/image_resize/modified", filename)

    return FileResponse(
        path,
        media_type="application/octet-stream",
        filename=filename  # 🔥 FORCE DOWNLOAD
    )
