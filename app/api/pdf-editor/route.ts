import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, PDFFont, rgb, StandardFonts } from "pdf-lib";
import { promises as fs } from "fs";
import path from "path";

// ─── Types ────────────────────────────────────────────────────────────

interface TextEdit {
  pdfX: number;           // x in PDF points (bottom-left origin)
  pdfBaselineY: number;   // text baseline Y in PDF points
  pdfFontSize: number;    // font size in PDF points
  newText: string;
  fontFamily: string;
  colorHex: string;
  bold: boolean;
  italic: boolean;
}

interface PagePayload {
  pageNumber: number;
  pdfWidth: number;
  pdfHeight: number;
  textEdits: TextEdit[];
  drawingBase64: string | null;
}

// ─── Hex → pdf-lib rgb ────────────────────────────────────────────────

function hexToRgb(hex: string) {
  const c = hex.replace("#", "");
  return {
    r: parseInt(c.slice(0, 2), 16) / 255,
    g: parseInt(c.slice(2, 4), 16) / 255,
    b: parseInt(c.slice(4, 6), 16) / 255,
  };
}

// ─── POST /api/pdf-editor ─────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const serverFilename = formData.get("serverFilename") as string | null;
    const editsJson = formData.get("edits") as string | null;

    if (!serverFilename || !editsJson) {
      return NextResponse.json({ error: "Missing serverFilename or edits" }, { status: 400 });
    }

    const edits: PagePayload[] = JSON.parse(editsJson);

    // Read original PDF
    const filePath = path.join(
      process.cwd(), "public", "uploads", "pdf-editor", serverFilename
    );
    const pdfBytes = await fs.readFile(filePath);
    const srcPdf = await PDFDocument.load(pdfBytes);
    const outPdf = await PDFDocument.create();

    // Embed standard fonts
    const fonts: Record<string, PDFFont> = {
      regular: await outPdf.embedFont(StandardFonts.Helvetica),
      bold: await outPdf.embedFont(StandardFonts.HelveticaBold),
      italic: await outPdf.embedFont(StandardFonts.HelveticaOblique),
      boldItalic: await outPdf.embedFont(StandardFonts.HelveticaBoldOblique),
      courier: await outPdf.embedFont(StandardFonts.Courier),
      courierBold: await outPdf.embedFont(StandardFonts.CourierBold),
      times: await outPdf.embedFont(StandardFonts.TimesRoman),
      timesBold: await outPdf.embedFont(StandardFonts.TimesRomanBold),
    };

    const pickFont = (edit: TextEdit): PDFFont => {
      const fl = edit.fontFamily?.toLowerCase() || "";
      if (fl.includes("courier") || fl.includes("mono")) {
        return edit.bold ? fonts.courierBold : fonts.courier;
      }
      if (fl.includes("times") || fl.includes("georgia")) {
        return edit.bold ? fonts.timesBold : fonts.times;
      }
      // Default Helvetica family
      if (edit.bold && edit.italic) return fonts.boldItalic;
      if (edit.bold) return fonts.bold;
      if (edit.italic) return fonts.italic;
      return fonts.regular;
    };

    const totalPages = srcPdf.getPageCount();

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      const pageNum = pageIndex + 1;
      const [copied] = await outPdf.copyPages(srcPdf, [pageIndex]);
      outPdf.addPage(copied);
      const page = outPdf.getPage(outPdf.getPageCount() - 1);

      const edit = edits.find(e => e.pageNumber === pageNum);
      if (!edit) continue;

      const pageH = page.getHeight(); // PDF page height in points (used for Y flip)

      // ── Step 1: Cover original text with white rectangles ──────────
      for (const te of edit.textEdits) {
        // The cover rect needs to span the text height
        // ascender ≈ fontSize * 0.8 above baseline
        // descender ≈ fontSize * 0.2 below baseline
        const coverH = te.pdfFontSize * 1.1;
        const coverY = te.pdfBaselineY - te.pdfFontSize * 0.25; // bottom of cover

        // Measure approximate text width to size cover rect
        const font = pickFont(te);
        let textW = 0;
        try {
          textW = font.widthOfTextAtSize(te.newText, te.pdfFontSize);
        } catch {
          textW = te.pdfFontSize * te.newText.length * 0.6;
        }
        const coverW = Math.max(textW + te.pdfFontSize * 0.5, te.pdfFontSize * 2);

        page.drawRectangle({
          x: te.pdfX - 1,
          y: coverY,
          width: coverW,
          height: coverH + 2,
          color: rgb(1, 1, 1),
          opacity: 1,
        });
      }

      // ── Step 2: Draw new text at exact baseline positions ──────────
      for (const te of edit.textEdits) {
        if (!te.newText.trim()) continue;

        const { r, g, b } = hexToRgb(te.colorHex || "#000000");
        const font = pickFont(te);
        const lines = te.newText.split("\n");
        const lineHeight = te.pdfFontSize * 1.25;

        for (let li = 0; li < lines.length; li++) {
          const lineText = lines[li];
          if (!lineText.trim()) continue;

          // PDF coordinates: baseline Y decreases as we go down the page
          const y = te.pdfBaselineY - li * lineHeight;

          page.drawText(lineText, {
            x: te.pdfX,
            y,
            size: te.pdfFontSize,
            font,
            color: rgb(r, g, b),
          });
        }
      }

      // ── Step 3: Overlay drawings as transparent PNG ────────────────
      if (edit.drawingBase64) {
        try {
          const pngBytes = Buffer.from(edit.drawingBase64, "base64");
          const pngImage = await outPdf.embedPng(pngBytes);

          // The drawing canvas was rendered at (pdfWidth * scale) x (pdfHeight * scale)
          // We embed it scaled back to PDF page dimensions
          page.drawImage(pngImage, {
            x: 0,
            y: 0,
            width: edit.pdfWidth,
            height: edit.pdfHeight,
          });
        } catch (err) {
          console.error(`Failed to embed drawing for page ${pageNum}:`, err);
        }
      }

      // Suppress unused variable
      void pageH;
    }

    const modifiedBytes = await outPdf.save();

    return new NextResponse(Buffer.from(modifiedBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="edited.pdf"',
      },
    });
  } catch (err) {
    console.error("PDF editor API error:", err);
    return NextResponse.json({ error: "Failed to process PDF" }, { status: 500 });
  }
}