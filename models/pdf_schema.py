from pydantic import BaseModel, Field

class PdfSplitRequest(BaseModel):
    start_page: int = Field(..., ge=1)
    end_page: int = Field(..., ge=1)
