"""
Vercel Python Function: real layout-preserving PDF -> DOCX conversion.

Lives in the project-root /api directory (Vercel's file-based Python function
convention) — deliberately NOT app/api, which is Next.js's own Node route
convention. The two coexist: this file maps to /api/pdf-to-docx, and no
existing app/api/* route uses that path.

Uses pdf2docx (MIT-licensed, PyMuPDF-based) instead of hand-rolled text-
position heuristics — it does real paragraph/table/image/column reconstruction,
which is what actually gets close to what tools like iLovePDF produce.

Handler is a plain BaseHTTPRequestHandler (Vercel's documented file-based
function pattern) rather than Flask/FastAPI, specifically to avoid Vercel's
framework-preset auto-detection taking over routing for the whole project —
that's scoped to root-level entrypoints (app.py/main.py/etc.), but there's no
upside to risking it for one endpoint.
"""

import json
import os
import tempfile
import traceback
from email.parser import BytesParser
from email.policy import default as email_default_policy
from http.server import BaseHTTPRequestHandler

MAX_UPLOAD_BYTES = 20 * 1024 * 1024  # 20MB


def _extract_uploaded_pdf(content_type: str, body: bytes) -> bytes | None:
    """Parse a multipart/form-data body (from FormData.append("file", ...))
    and return the uploaded PDF's raw bytes, or None if not found.

    Deliberately uses the stdlib email module instead of the removed `cgi`
    module (gone in Python 3.13+) or an extra dependency: prepending a
    Content-Type header to the raw body and feeding it to BytesParser is a
    well-known technique for parsing MIME multipart bodies without adding a
    web framework dependency.
    """
    header_bytes = f"Content-Type: {content_type}\r\n\r\n".encode("utf-8")
    msg = BytesParser(policy=email_default_policy).parsebytes(header_bytes + body)
    if not msg.is_multipart():
        return None
    for part in msg.iter_parts():
        disposition = part.get("Content-Disposition", "")
        if 'name="file"' in disposition:
            return part.get_payload(decode=True)
    return None


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length <= 0:
                self._send_json(400, {"error": "No file provided"})
                return
            if content_length > MAX_UPLOAD_BYTES:
                self._send_json(413, {"error": "PDF is too large (max 20MB)."})
                return

            body = self.rfile.read(content_length)
            content_type = self.headers.get("Content-Type", "")
            pdf_bytes = _extract_uploaded_pdf(content_type, body)
            if not pdf_bytes:
                self._send_json(400, {"error": "No file provided"})
                return

            # Import here (not at module top) so a Converter/pdf2docx import
            # failure surfaces as a clean 500 with a real error message
            # instead of the function failing to even load.
            from pdf2docx import Converter

            with tempfile.TemporaryDirectory() as tmp:
                pdf_path = os.path.join(tmp, "input.pdf")
                docx_path = os.path.join(tmp, "output.docx")
                with open(pdf_path, "wb") as f:
                    f.write(pdf_bytes)

                cv = Converter(pdf_path)
                try:
                    # parse_stream_table=False: pdf2docx's default (True) tries to
                    # reconstruct "stream" tables — content aligned in columns with
                    # no visible grid lines, which is exactly what a sidebar-style
                    # resume/CV layout looks like to it. On documents like that, its
                    # column-width guessing can badly truncate text (verified: this
                    # is what produced a garbled, clipped-text result). Disabling it
                    # falls back to pdf2docx's own column/section-aware paragraph
                    # layout instead of a mis-detected table.
                    # TRADE-OFF (untested — no representative PDF to verify against):
                    # this may reduce fidelity on PDFs with real borderless data
                    # tables (e.g. invoices) where stream-table detection helps
                    # rather than hurts. Revisit if that turns out to matter more
                    # than the resume/CV case it's fixing here.
                    cv.convert(docx_path, parse_stream_table=False)
                finally:
                    cv.close()

                with open(docx_path, "rb") as f:
                    docx_bytes = f.read()

            self.send_response(200)
            self.send_header(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            )
            self.send_header("Content-Disposition", 'attachment; filename="converted.docx"')
            # Never cache/store — transient per-request computation.
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(docx_bytes)))
            self.end_headers()
            self.wfile.write(docx_bytes)
        except Exception as e:  # noqa: BLE001 — surface the real error to the client
            traceback.print_exc()
            self._send_json(500, {"error": f"Failed to convert PDF: {e}"})

    def _send_json(self, status: int, payload: dict):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
