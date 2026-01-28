from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles

# Existing routers
from controllers.pdf_controller import router as pdf_router
from controllers.image_controller import router as image_router
from controllers.pdf_to_image_controller import router as pdf_image_router
from controllers.image_resize_controller import router as image_resize_router
from controllers.bg_remove_controller import router as bg_remove_router



app = FastAPI(
    title="Toolify API",
    description="PDF & Image processing service",
    version="1.0.0"
)

# 🔐 CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # production এ frontend domain দিবে
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🩺 Health check
@app.get("/")
def health_check():
    return {
        "status": "ok",
        "message": "Toolify API running 🚀"
    }

# 📦 Static files (for preview images)
app.mount("/static", StaticFiles(directory="static"), name="static")

# 📄 PDF tools (split, merge, compress, image→pdf)
app.include_router(pdf_router, prefix="/api/pdf")

# 🖼️ Image tools (convert, compress, to-pdf)
app.include_router(image_router, prefix="/api/image")

# 🆕 PDF → Image (preview + zip)
app.include_router(pdf_image_router, prefix="/api/pdf")

# 🆕 Image Resize / Crop
app.include_router(image_resize_router, prefix="/api/image")

# BG Remove
app.include_router(bg_remove_router, prefix="/api/image")

