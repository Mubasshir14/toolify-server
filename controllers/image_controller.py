from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse
from services.image_service import convert_image_service, images_to_pdf_service, compress_image_service
from typing import List

router = APIRouter(tags=["Image"])

@router.post("/convert")
async def convert_image(
    image: UploadFile = File(...),
    target_format: str = Form(...)
):
    try:
        output_path, filename = await convert_image_service(image, target_format)

        return FileResponse(
            path=output_path,
            filename=filename,
            media_type="application/octet-stream"
        )

    except ValueError as e:
        return JSONResponse(status_code=400, content={"message": str(e)})


@router.post("/to-pdf")
async def images_to_pdf(
    images: List[UploadFile] = File(...)
):
    try:
        output_path, filename = await images_to_pdf_service(images)

        return FileResponse(
            path=output_path,
            filename=filename,
            media_type="application/pdf"
        )

    except ValueError as e:
        return JSONResponse(status_code=400, content={"message": str(e)})

    except Exception as e:
        print("❌ IMAGE TO PDF ERROR:", e)
        return JSONResponse(
            status_code=500,
            content={"message": "Failed to convert images to PDF"}
        )

@router.post("/compress")
async def compress_image(
    image: UploadFile = File(...),
    target_kb: int | None = Form(None),
    quality_percent: int | None = Form(None),
):
    try:
        output_path, filename = await compress_image_service(
            image=image,
            target_kb=target_kb,
            quality_percent=quality_percent,
        )

        return FileResponse(
            path=output_path,
            filename=filename,
            media_type="application/octet-stream",
        )

    except ValueError as e:
        return JSONResponse(
            status_code=400,
            content={"status": "error", "message": str(e)},
        )