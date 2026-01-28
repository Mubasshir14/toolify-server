from PyPDF2 import PdfReader, PdfWriter, PdfMerger
from fastapi import UploadFile
import os
import tempfile
import subprocess

from utils.file_utils import (
    save_uploaded_file,
    generate_split_filename,
    get_split_file_path,
    delete_file, get_merge_file_path
)
GS_PATH = r"C:\Program Files\gs\gs10.06.0\bin\gswin64c.exe"

QUALITY_MAP = {
    "high": "/prepress",
    "medium": "/printer",
    "low": "/ebook",
}

async def split_pdf_service(
    pdf: UploadFile,
    start_page: int,
    end_page: int
):
    input_path = save_uploaded_file(pdf)

    try:
        reader = PdfReader(input_path)
        total_pages = len(reader.pages)

        if start_page < 1 or end_page > total_pages or start_page > end_page:
            raise ValueError(
                f"Invalid page range! Total pages: {total_pages}"
            )

        writer = PdfWriter()
        for i in range(start_page - 1, end_page):
            writer.add_page(reader.pages[i])

        filename = generate_split_filename(start_page, end_page)
        output_path = get_split_file_path(filename)

        with open(output_path, "wb") as out:
            writer.write(out)

        return output_path, filename

    finally:
        # only delete uploaded temp file
        delete_file(input_path)

async def merge_pdf_service(pdf1: UploadFile, pdf2: UploadFile):
    path1 = save_uploaded_file(pdf1)
    path2 = save_uploaded_file(pdf2)

    merger = PdfMerger()

    try:
        reader1 = PdfReader(path1)
        reader2 = PdfReader(path2)

        if reader1.is_encrypted or reader2.is_encrypted:
            raise ValueError("One or both PDFs are password protected")

        merger.append(path1)
        merger.append(path2)

        filename = "merged.pdf"
        output_path = get_merge_file_path(filename)

        with open(output_path, "wb") as f:
            merger.write(f)

        return output_path, filename

    finally:
        merger.close()
        delete_file(path1)
        delete_file(path2)


async def compress_pdf_service(
    pdf: UploadFile,
    mode: str,
    value: int,
    quality: str,
):
    input_path = save_uploaded_file(pdf)

    try:
        output_name = f"compressed_{pdf.filename}"
        output_path = get_merge_file_path(output_name)

        gs_quality = QUALITY_MAP.get(quality, "/printer")

        cmd = [
            GS_PATH,
            "-sDEVICE=pdfwrite",
            "-dCompatibilityLevel=1.4",
            f"-dPDFSETTINGS={gs_quality}",
            "-dNOPAUSE",
            "-dQUIET",
            "-dBATCH",
            f"-sOutputFile={output_path}",
            input_path,
        ]

        subprocess.run(cmd, check=True)

        return output_path, output_name

    finally:
        delete_file(input_path)
