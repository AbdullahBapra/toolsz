"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Image,
  Check,
  Loader2,
  Shield,
  Zap,
  Download,
  FileText,
  RotateCcw,
  Info,
} from "lucide-react";
import { useToast } from "@/app/components/Toast";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";

interface ExtractedImage {
  url: string;
  width: number;
  height: number;
  pageNum: number;
  index: number;
}

export default function ExtractImagesPdfPage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [images, setImages] = useState<ExtractedImage[]>([]);
  const imagesRef = useRef<ExtractedImage[]>([]);

  useEffect(() => { imagesRef.current = images; }, [images]);
  useEffect(() => {
    return () => { imagesRef.current.forEach((img) => URL.revokeObjectURL(img.url)); };
  }, []);

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);

    try {
      // @ts-ignore
      const pdfjsLib: typeof import("pdfjs-dist") = await import(/* webpackIgnore: true */ "/pdfjs-viewer.min.mjs");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      const extracted: ExtractedImage[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.0 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) continue;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
        if (blob) {
          extracted.push({
            url: URL.createObjectURL(blob),
            width: viewport.width,
            height: viewport.height,
            pageNum: i,
            index: extracted.length,
          });
        }
      }

      imagesRef.current.forEach((img) => URL.revokeObjectURL(img.url));
      setImages(extracted);
      setDone(true);
    } catch (err) {
      console.error("Extract images error:", err);
      addToast("error", "Failed to extract images. Please ensure it's a valid PDF.");
    } finally {
      setProcessing(false);
    }
  }, [files, addToast]);

  const downloadAll = async () => {
    if (images.length === 1) {
      const a = document.createElement("a");
      a.href = images[0].url;
      a.download = `page_${images[0].pageNum}.png`;
      a.click();
      return;
    }
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      for (const img of images) {
        const response = await fetch(img.url);
        const blob = await response.blob();
        zip.file(`page_${img.pageNum}.png`, blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${files[0]?.name.replace(/\.pdf$/i, "")}_images.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch {
      addToast("error", "Failed to create ZIP file.");
    }
  };

  const handleReset = () => {
    imagesRef.current.forEach((img) => URL.revokeObjectURL(img.url));
    setFiles([]); setDone(false); setProcessing(false); setImages([]);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <ToolHero icon={Image} title="Extract Images from PDF" description="Pull out all embedded images from a PDF — download individually or as a ZIP. Free, instant, and completely private. No server uploads required." backHref="/pdf-tools" backLabel="Back to PDF Tools" />
      </div>
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="glass-panel rounded-[16px] p-6 sm:p-8">
          {!done ? (
            <>
              <FileUpload accept=".pdf" files={files} onFilesChange={setFiles} label="Drop your PDF here" description="or click to browse — PDF files only" />
              {files.length > 0 && (
                <div className="mt-8 flex justify-center animate-fade-in-up">
                  <button onClick={handleProcess} disabled={processing} className="btn btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                    {processing ? <><Loader2 className="w-5 h-5 animate-spin" />Extracting...</> : <><Image className="w-5 h-5" />Extract Images</>}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 animate-fade-in-up">
              <div className="w-[88px] h-[88px] rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6"><Check className="w-10 h-10 text-success" /></div>
              <h3 className="text-2xl font-bold text-foreground mb-2">{images.length} Image{images.length !== 1 ? "s" : ""} Extracted!</h3>
              <p className="text-foreground-secondary mb-6 max-w-md mx-auto">Each page has been converted to a PNG image.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6 max-h-[400px] overflow-y-auto">
                {images.map((img) => (
                  <a key={img.index} href={img.url} download={`page_${img.pageNum}.png`} className="group relative rounded-xl border border-border overflow-hidden hover:border-primary transition-all">
                    <img src={img.url} alt={`Page ${img.pageNum}`} className="w-full h-auto" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] font-semibold px-2 py-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">Page {img.pageNum} &bull; {img.width}&times;{img.height}</div>
                  </a>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button onClick={downloadAll} className="btn btn-primary inline-flex items-center gap-2 text-center"><Download className="w-5 h-5" />Download All (ZIP)</button>
                <button onClick={handleReset} className="btn btn-secondary inline-flex items-center gap-2 text-center"><RotateCcw className="w-4 h-4" />Extract Another</button>
              </div>
            </div>
          )}
        </div>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0"><Shield className="w-5 h-5 text-primary" /></div>
            <div><h4 className="font-display font-semibold text-foreground text-sm mb-1.5">Private & Secure</h4><p className="text-foreground-muted text-sm leading-relaxed">Extraction happens entirely in your browser. Your PDF is never uploaded.</p></div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0"><Zap className="w-5 h-5 text-primary" /></div>
            <div><h4 className="font-display font-semibold text-foreground text-sm mb-1.5">High Quality</h4><p className="text-foreground-muted text-sm leading-relaxed">Full-resolution PNG output preserving all detail from the original PDF pages.</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
