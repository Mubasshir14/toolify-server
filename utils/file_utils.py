import os
import shutil
from uuid import uuid4
from fastapi import UploadFile

UPLOAD_DIR = "uploads"
SPLIT_DIR = "splits"
MERGE_DIR = "merges"
IMAGE_DIR = "images"
CONVERTED_DIR = "converted_images"
IMAGE_PDF_DIR = "image_pdfs"
PDF_COMPRESS_DIR = "compressed_pdfs"


def ensure_directories():
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    os.makedirs(SPLIT_DIR, exist_ok=True)
    os.makedirs(MERGE_DIR, exist_ok=True)


def save_uploaded_file(file: UploadFile) -> str:
    ensure_directories()
    unique_name = f"{uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return file_path


def generate_split_filename(start_page: int, end_page: int) -> str:
    return f"{start_page}_{end_page}.pdf"


def get_split_file_path(filename: str) -> str:
    ensure_directories()
    return os.path.join(SPLIT_DIR, filename)


def get_merge_file_path(filename: str) -> str:
    ensure_directories()
    return os.path.join(MERGE_DIR, filename)


def delete_file(path: str):
    if path and os.path.exists(path):
        os.remove(path)

def save_image_file(file: UploadFile) -> str:
    ensure_image_directories()
    unique = f"{uuid4()}_{file.filename}"
    path = os.path.join(IMAGE_DIR, unique)

    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    return path



def ensure_image_directories():
    os.makedirs(IMAGE_DIR, exist_ok=True)
    os.makedirs(CONVERTED_DIR, exist_ok=True)


def get_converted_image_path(filename: str) -> str:
    ensure_image_directories()
    return os.path.join(CONVERTED_DIR, filename)


def ensure_image_pdf_dir():
    os.makedirs(IMAGE_PDF_DIR, exist_ok=True)

def get_image_pdf_path(filename: str) -> str:
    ensure_image_pdf_dir()
    return os.path.join(IMAGE_PDF_DIR, filename)


def ensure_pdf_compress_dir():
    os.makedirs(PDF_COMPRESS_DIR, exist_ok=True)

def get_compressed_pdf_path(filename: str):
    ensure_pdf_compress_dir()
    return os.path.join(PDF_COMPRESS_DIR, filename)
