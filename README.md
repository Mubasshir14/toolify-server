# 🛠 Toolify API

Toolify API is a lightweight REST API for common **Image** and **PDF** processing tasks such as conversion, compression, resizing, background removal, and more.

---

## 📍 Base URL

```
http://localhost:5000/api
```

---

## ✅ Health Check

Check if the API server is running.

```
GET /
```

**Sample Response**
```json
{
  "status": "ok"
}
```

---

## 🖼 Image Endpoints

Endpoints related to image processing.

| Method | Endpoint | Description |
|------|---------|------------|
| POST | `/image/convert` | Convert image formats |
| POST | `/image/compress` | Compress image size |
| POST | `/image/to-pdf` | Convert image(s) to PDF |
| POST | `/image/resize` | Resize image dimensions |
| POST | `/image/bgremove` | Remove image background |
| GET  | `/image/download/:filename` | Download processed image |

---

## 📄 PDF Endpoints

Endpoints related to PDF processing.

| Method | Endpoint | Description |
|------|---------|------------|
| POST | `/pdf/metadata` | Extract PDF metadata |
| POST | `/pdf/split` | Split PDF into multiple files |
| POST | `/pdf/merge` | Merge multiple PDFs |
| POST | `/pdf/compress` | Compress PDF size |
| POST | `/pdf/to-image` | Convert PDF pages to images |
| GET  | `/pdf/preview/:imageName` | Preview generated images |
| GET  | `/pdf/download/:zipName` | Download ZIP of results |

---

## 📂 Static File Serving

Processed files are available via static routes.

| Method | Path | Description |
|------|------|------------|
| GET | `/static/bgremove/preview/*` | Preview background-removed images |
| GET | `/static/bgremove/final/*` | Final background-removed images |
| GET | `/static/image_resize/*` | Resized images |
| GET | `/static/pdf_to_image/*` | Images generated from PDFs |

---

## 📦 Request Format

Most `POST` endpoints accept:

```
Content-Type: multipart/form-data
```

Upload one or more files depending on the endpoint.

---

## 🧪 Example cURL Request

```bash
curl -X POST \
  http://localhost:5000/api/image/compress \
  -F "image=@example.jpg"
```

---

## 🚀 Getting Started

1. Start the API server
2. Make sure it runs on `localhost:5000`
3. Use Postman, cURL, or your frontend app to call the endpoints

---

## 📌 Notes

- Use returned filenames for download endpoints
- Processing time depends on file size
- Ensure sufficient storage for generated files

---
