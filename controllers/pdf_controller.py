from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse
from services.pdf_service import split_pdf_service, merge_pdf_service, compress_pdf_service

from PyPDF2 import PdfReader
import tempfile
import os

router = APIRouter(tags=["PDF"])


# =========================
# PDF SPLIT
# =========================
@router.post("/split")
async def split_pdf(
    pdf: UploadFile = File(...),
    start_page: int = Form(...),
    end_page: int = Form(...)
):
    try:
        output_path, filename = await split_pdf_service(
            pdf=pdf,
            start_page=start_page,
            end_page=end_page
        )

        return FileResponse(
            path=output_path,
            filename=filename,
            media_type="application/pdf"
        )

    except ValueError as e:
        return JSONResponse(
            status_code=400,
            content={
                "status": "error",
                "message": str(e)
            }
        )


# =========================
# PDF METADATA (NEW)
# =========================
@router.post("/metadata")
async def pdf_metadata(
    pdf: UploadFile = File(...)
):
    """
    Returns total number of pages in uploaded PDF.
    Used for preview & validation.
    """

    try:
        # Save temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(await pdf.read())
            tmp_path = tmp.name

        reader = PdfReader(tmp_path)
        total_pages = len(reader.pages)

        return {
            "status": "success",
            "total_pages": total_pages
        }

    except Exception:
        return JSONResponse(
            status_code=400,
            content={
                "status": "error",
                "message": "Invalid or corrupted PDF file"
            }
        )

    finally:
        if 'tmp_path' in locals() and os.path.exists(tmp_path):
            os.remove(tmp_path)

# ======================
# PDF MERGE (NEW)
# ======================
@router.post("/merge")
async def merge_pdf(
    pdf1: UploadFile = File(...),
    pdf2: UploadFile = File(...),
):
    try:
        output_path, filename = await merge_pdf_service(pdf1, pdf2)

        return FileResponse(
            path=output_path,
            filename=filename,
            media_type="application/pdf",
        )

    except ValueError as e:
        return JSONResponse(
            status_code=400,
            content={
                "status": "error",
                "message": str(e),
            },
        )

    except Exception:
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": "Internal server error while merging PDFs",
            },
        )

# ======================
# PDF Compress
# ======================
@router.post("/compress")
async def compress_pdf(
    pdf: UploadFile = File(...),
    mode: str = Form(...),
    value: int = Form(...),
    quality: str = Form("medium"),
):
    try:
        output_path, filename = await compress_pdf_service(
            pdf=pdf,
            mode=mode,
            value=value,
            quality=quality,
        )

        return FileResponse(
            path=output_path,
            filename=filename,
            media_type="application/pdf",
        )

    except Exception as e:
        print("❌ PDF COMPRESS ERROR:", e)
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": "PDF compression failed"},
        )
