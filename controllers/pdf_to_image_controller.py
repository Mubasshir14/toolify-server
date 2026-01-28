from fastapi import APIRouter, UploadFile, File
from fastapi.responses import FileResponse, JSONResponse
from services.pdf_to_image_service import pdf_to_image_service
import os

router = APIRouter(tags=["PDF → Image"])

@router.post("/to-image")
async def pdf_to_image(pdf: UploadFile = File(...)):
    try:
        data = await pdf_to_image_service(pdf)
        return {
            "status": "success",
            "zip_url": f"/api/pdf/download/{data['zip']}",
            "previews": [
                f"/api/pdf/preview/{name}" for name in data["previews"]
            ]
        }
    except Exception as e:
        print("❌ PDF TO IMAGE ERROR:", e)
        return JSONResponse(
            status_code=500,
            content={"message": str(e)}
        )

@router.get("/preview/{name}")
def preview(name: str):
    path = os.path.join("pdf_to_image/previews", name)
    if not os.path.exists(path):
        return JSONResponse(404, {"message": "Image not found"})
    return FileResponse(path, media_type="image/png")

@router.get("/download/{zip_name}")
def download(zip_name: str):
    path = os.path.join("pdf_to_image/zips", zip_name)
    if not os.path.exists(path):
        return JSONResponse(404, {"message": "Zip not found"})
    return FileResponse(path, filename="images.zip")
