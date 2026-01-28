from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse
from services.bg_remove_service import bg_remove_service

router = APIRouter(tags=["Image Background Remove"])

@router.post("/bgremove")
async def bg_remove(
    image: UploadFile = File(...),
    bg_type: str = Form(...),  # transparent | color | image
    bg_color: str | None = Form(None),
    bg_image: UploadFile | None = File(None),
):
    try:
        result = await bg_remove_service(
            image=image,
            bg_type=bg_type,
            bg_color=bg_color,
            bg_image=bg_image,
        )

        return {
            "status": "success",
            "preview": result["preview"],
            "final": result["final"],
        }

    except Exception as e:
        print("❌ BG REMOVE ERROR:", e)
        return JSONResponse(400, {"message": str(e)})