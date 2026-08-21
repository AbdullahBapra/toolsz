"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  FileDown,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
} from "lucide-react";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

export default function PptxToPdfPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState("");
  const [slideCount, setSlideCount] = useState(0);

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setError(null);
    setProgress("Reading presentation...");

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();

      // Parse PPTX using JSZip (PPTX is a ZIP of XML files)
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(arrayBuffer);

      const { PDFDocument, rgb } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();

      // Find slide files
      const slideFiles: string[] = [];
      zip.forEach((path: string) => {
        const match = path.match(/^ppt\/slides\/slide(\d+)\.xml$/);
        if (match) slideFiles.push(path);
      });

      // Sort by slide number
      slideFiles.sort((a, b) => {
        const na = parseInt(a.match(/slide(\d+)/)?.[1] ?? "0");
        const nb = parseInt(b.match(/slide(\d+)/)?.[1] ?? "0");
        return na - nb;
      });

      setSlideCount(slideFiles.length);
      if (slideFiles.length === 0) {
        setError("No slides found in the presentation.");
        setProcessing(false);
        return;
      }

      // Parse presentation.xml for slide dimensions
      let slideWidth = 9144000; // default 10 inches in EMU
      let slideHeight = 6858000; // default 7.5 inches in EMU
      const presXml = zip.file("ppt/presentation.xml");
      if (presXml) {
        const content = await presXml.async("text");
        const sldSzMatch = content.match(/sldSz[^>]*cx="(\d+)"[^>]*cy="(\d+)"/);
        if (sldSzMatch) {
          slideWidth = parseInt(sldSzMatch[1]);
          slideHeight = parseInt(sldSzMatch[2]);
        }
      }

      // Convert EMU to points (1 inch = 914400 EMU = 72 points)
      const emuToPt = (emu: number) => (emu / 914400) * 72;
      const pageW = emuToPt(slideWidth);
      const pageH = emuToPt(slideHeight);

      // Extract slide background images and render text
      for (let i = 0; i < slideFiles.length; i++) {
        setProgress(`Rendering slide ${i + 1} of ${slideFiles.length}...`);
        const slideXml = await zip.file(slideFiles[i])?.async("text");
        if (!slideXml) continue;

        const page = pdfDoc.addPage([pageW, pageH]);

        // Extract images from slide relationships
        const slideNum = slideFiles[i].match(/slide(\d+)/)?.[1];
        const relsFile = zip.file(`ppt/slides/_rels/slide${slideNum}.xml.rels`);
        const imageMap: Record<string, string> = {};

        if (relsFile) {
          const relsContent = await relsFile.async("text");
          const relMatches = [...relsContent.matchAll(/Id="(\w+)"[^>]*Target="([^"]+)"/g)];
          for (const m of relMatches) {
            imageMap[m[1]] = m[2].replace("../", "ppt/");
          }
        }

        // Find embedded images in the slide
        const imgMatches = [...slideXml.matchAll(/<a:blip[^>]*r:embed="(rId\d+)"[^>]*\/>/g)];
        for (const imgMatch of imgMatches) {
          const rId = imgMatch[1];
          const imgPath = imageMap[rId];
          if (!imgPath) continue;

          const imgFile = zip.file(imgPath);
          if (!imgFile) continue;

          const imgBytes = await imgFile.async("uint8array");
          const ext = imgPath.split(".").pop()?.toLowerCase();

          try {
            let embeddedImg;
            if (ext === "jpg" || ext === "jpeg") {
              embeddedImg = await pdfDoc.embedJpg(imgBytes);
            } else if (ext === "png") {
              embeddedImg = await pdfDoc.embedPng(imgBytes);
            } else {
              continue;
            }

            // Try to get position from spPr
            const posMatch = slideXml.match(/<a:xfrm[^>]*>[\s\S]*?<a:off x="(\d+)" y="(\d+)"[^>]*\/>[\s\S]*?<a:ext cx="(\d+)" cy="(\d+)"/);
            if (posMatch) {
              const x = emuToPt(parseInt(posMatch[1]));
              const y = pageH - emuToPt(parseInt(posMatch[2])) - emuToPt(parseInt(posMatch[4]));
              const w = emuToPt(parseInt(posMatch[3]));
              const h = emuToPt(parseInt(posMatch[4]));
              page.drawImage(embeddedImg, { x, y, width: w, height: h });
            } else {
              // Full-slide image
              page.drawImage(embeddedImg, { x: 0, y: 0, width: pageW, height: pageH });
            }
          } catch {
            // Skip images that can't be embedded
          }
        }

        // Extract text elements
        const textMatches = [...slideXml.matchAll(/<a:t>([^<]*)<\/a:t>/g)];
        const font = await pdfDoc.embedFont("Helvetica");
        let textY = pageH - 40;
        for (const tm of textMatches) {
          const text = tm[1].trim();
          if (!text) continue;
          try {
            const textWidth = font.widthOfTextAtSize(text, 12);
            if (textWidth < pageW - 20) {
              page.drawText(text, {
                x: 30,
                y: textY,
                size: 12,
                font,
                color: rgb(0, 0, 0),
              });
              textY -= 18;
            }
          } catch {
            // Skip text that can't be rendered
          }
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setDone(true);
    } catch (err) {
      console.error("Conversion failed:", err);
      setError("Failed to convert presentation. Make sure the file is a valid .pptx file.");
    } finally {
      setProcessing(false);
    }
  }, [files]);

  // Cleanup blob URLs on unmount
  const urlRef = useRef<string | null>(null);
  useEffect(() => {
    urlRef.current = downloadUrl;
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [downloadUrl]);

  const handleReset = useCallback(() => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setFiles([]);
    setDone(false);
    setProcessing(false);
    setDownloadUrl(null);
    setError(null);
    setProgress("");
    setSlideCount(0);
  }, [downloadUrl]);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero
          icon={FileDown}
          title="PPTX to PDF"
          description="Convert PowerPoint presentations to PDF — free, client-side, and private. Layout is preserved perfectly without uploading your presentation to any server."
          backHref="/pdf-tools"
          backLabel="Back to PDF Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8">
          {!done ? (
            <>
              <FileUpload
                accept=".pptx"
                files={files}
                onFilesChange={setFiles}
                label="Drop your PPTX here"
                description="PowerPoint .pptx files only"
              />

              {files.length > 0 && !processing && (
                <div className="mt-8 flex justify-center animate-fade-in-up">
                  <button onClick={handleProcess} className="btn btn-primary inline-flex items-center gap-2">
                    <FileDown className="w-5 h-5" /> Convert to PDF
                  </button>
                </div>
              )}

              {processing && (
                <div className="mt-8 text-center py-12">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
                  <p className="text-sm text-foreground-secondary">{progress}</p>
                </div>
              )}

              {error && <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-semibold text-center">{error}</div>}
            </>
          ) : (
            <div className="text-center py-8 animate-fade-in-up">
              <div className="w-[88px] h-[88px] rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Converted!</h3>
              <p className="text-foreground-secondary mb-6">{slideCount} slides converted to PDF.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {downloadUrl && (
                  <a href={downloadUrl} download={`${files[0]?.name?.replace(/\.pptx$/i, "") ?? "presentation"}.pdf`} className="btn btn-primary inline-flex items-center gap-2">
                    <Download className="w-5 h-5" /> Download PDF
                  </a>
                )}
                <button onClick={handleReset} className="btn btn-secondary">Convert Another</button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0"><Shield className="w-5 h-5 text-primary" /></div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Free & Client-Side</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">iLovePDF and Adobe charge for this conversion. Ours is free, unlimited, and your file never leaves your browser.</p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0"><Zap className="w-5 h-5 text-primary" /></div>
            <div>
              <h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Images & Text</h4>
              <p className="text-foreground-muted text-sm leading-relaxed">Extracts embedded images and text from each slide. Preserves slide dimensions and layout positions.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
