"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  FileEdit, Type, Download, Trash2, Paintbrush, Highlighter,
  Eraser, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight,
  Loader2, Shield, Zap, Bold, Italic, Underline, AlignLeft,
  AlignCenter, AlignRight, ScanText, Plus, Minus,
} from "lucide-react";
import FileUpload from "@/app/components/FileUpload";
import ToolHero from "@/app/components/ToolHero";
import { useToast } from "@/app/components/Toast";

const FONT_OPTIONS = [
  "Arial", "Helvetica", "Georgia", "Times New Roman",
  "Courier New", "Verdana", "Trebuchet MS", "Impact",
];

type ActiveTool = "select" | "draw" | "highlight" | "erase" | "editText";

// Per-page state
interface PageEditState {
  objects: unknown[];
  bgDataUrl: string;
  pdfWidth: number;   // PDF points (unscaled)
  pdfHeight: number;
}

// A single detected text line
interface TextLine {
  id: string;
  text: string;
  // Canvas coords (scaled)
  x: number;
  y: number;
  w: number;
  h: number;
  // PDF coords (unscaled, bottom-left origin)
  pdfX: number;
  pdfBaselineY: number;  // baseline in PDF coords
  pdfFontSize: number;   // font size in PDF points
  // Canvas font size
  canvasFontSize: number;
  fontFamily: string;
  colorHex: string;
}

export default function PdfEditorPage() {
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [editorReady, setEditorReady] = useState(false);
  const [canvasInit, setCanvasInit] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fabricRef = useRef<any>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfDocRef = useRef<any>(null);
  const serverFilenameRef = useRef<string | null>(null);
  const scaleRef = useRef(1.5);

  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageEditsRef = useRef<Map<number, PageEditState>>(new Map());
  const textLinesRef = useRef<Map<number, TextLine[]>>(new Map());

  const [selectedType, setSelectedType] = useState<"text" | null>(null);
  const [textProps, setTextProps] = useState({
    fontFamily: "Arial", fontSize: 18, fill: "#000000",
    bold: false, italic: false, underline: false,
    textAlign: "left" as "left" | "center" | "right",
  });

  const [activeTool, setActiveTool] = useState<ActiveTool>("select");
  const activeToolRef = useRef<ActiveTool>("select");
  const [brushColor, setBrushColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);
  const [highlightColor, setHighlightColor] = useState("#FFFF00");
  const [zoom, setZoom] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [isExtractingText, setIsExtractingText] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeTextRef = useRef<any>(null);

  useEffect(() => { activeToolRef.current = activeTool; }, [activeTool]);

  // ─── Delete selected object ───────────────────────────────────────
  const handleDeleteSelected = useCallback(() => {
    if (!fabricRef.current) return;
    const active = fabricRef.current.getActiveObject();
    if (active) {
      fabricRef.current.remove(active);
      fabricRef.current.discardActiveObject();
      fabricRef.current.requestRenderAll();
      setSelectedType(null);
      activeTextRef.current = null;
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && editorReady) {
        const active = fabricRef.current?.getActiveObject();
        if (active?.isEditing) return;
        const tag = (e.target as HTMLElement).tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        handleDeleteSelected();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editorReady, handleDeleteSelected]);

  // ─── Sync text props from selected object ─────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const syncTextProps = (obj: any) => {
    setTextProps({
      fontFamily: obj.fontFamily || "Arial",
      fontSize: Math.round(obj.fontSize || 18),
      fill: obj.fill || "#000000",
      bold: obj.fontWeight === "bold",
      italic: obj.fontStyle === "italic",
      underline: obj.underline === true,
      textAlign: obj.textAlign || "left",
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelection = (e: any) => {
    const obj = e.selected?.[0] || e.target;
    if (obj?.type === "i-text") {
      setSelectedType("text");
      activeTextRef.current = obj;
      syncTextProps(obj);
    } else {
      setSelectedType(null);
      activeTextRef.current = null;
    }
  };

  const handleSelectionCleared = () => {
    setSelectedType(null);
    activeTextRef.current = null;
  };

  // ─── Drawing mode sync ────────────────────────────────────────────
  useEffect(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    const initDraw = async () => {
      if (activeTool === "draw" || activeTool === "highlight" || activeTool === "erase") {
        if (!canvas.freeDrawingBrush) {
          const fabric = await import("fabric");
          canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        }
        if (activeTool === "highlight") {
          const hex = highlightColor.replace("#", "");
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);
          canvas.freeDrawingBrush.color = `rgba(${r},${g},${b},0.35)`;
          canvas.freeDrawingBrush.width = brushSize * 4;
        } else if (activeTool === "erase") {
          canvas.freeDrawingBrush.color = "#ffffff";
          canvas.freeDrawingBrush.width = brushSize * 3;
        } else {
          canvas.freeDrawingBrush.color = brushColor;
          canvas.freeDrawingBrush.width = brushSize;
        }
        canvas.isDrawingMode = true;
      } else {
        canvas.isDrawingMode = false;
      }
    };
    initDraw();
  }, [activeTool, brushColor, brushSize, highlightColor]);

  // ─── Initialize Fabric canvas ─────────────────────────────────────
  useEffect(() => {
    if (!canvasElRef.current || canvasInit) return;
    let canvas: import("fabric").Canvas | null = null;
    let mounted = true;

    (async () => {
      const fabric = await import("fabric");
      if (!mounted) return;

      canvas = new fabric.Canvas(canvasElRef.current!, {
        width: 800, height: 600,
        backgroundColor: "#e0e0e0",
        selection: true,
      });
      fabricRef.current = canvas;
      setCanvasInit(true);

      canvas.on("selection:created", handleSelection);
      canvas.on("selection:updated", handleSelection);
      canvas.on("selection:cleared", handleSelectionCleared);
      canvas.on("object:modified", (e: { target: any }) => {
        if (e.target?.type === "i-text") {
          activeTextRef.current = e.target;
          syncTextProps(e.target);
        }
      });
      canvas.on("text:editing:entered", () => {
        if (activeToolRef.current !== "select") setActiveTool("select");
      });
    })();

    return () => {
      mounted = false;
      canvas?.dispose();
      fabricRef.current = null;
      setCanvasInit(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Render PDF page as background ───────────────────────────────
  const renderPageBackground = useCallback(async (pageNum: number) => {
    if (!fabricRef.current || !pdfDocRef.current) return;
    const canvas = fabricRef.current;
    const fabric = await import("fabric");

    const page = await pdfDocRef.current.getPage(pageNum);
    const viewport = page.getViewport({ scale: scaleRef.current });

    const offscreen = document.createElement("canvas");
    offscreen.width = viewport.width;
    offscreen.height = viewport.height;
    await page.render({ canvasContext: offscreen.getContext("2d")!, viewport }).promise;

    const dataUrl = offscreen.toDataURL("image/png");
    const bgImg = await fabric.FabricImage.fromURL(dataUrl);
    bgImg.set({ originX: "left", originY: "top", scaleX: 1, scaleY: 1 });

    canvas.setDimensions({ width: viewport.width, height: viewport.height });
    canvas.backgroundImage = bgImg;

    const origVp = page.getViewport({ scale: 1.0 });
    const existing = pageEditsRef.current.get(pageNum);
    if (!existing) {
      pageEditsRef.current.set(pageNum, {
        objects: [], bgDataUrl: dataUrl,
        pdfWidth: origVp.width, pdfHeight: origVp.height,
      });
    } else {
      existing.bgDataUrl = dataUrl;
      existing.pdfWidth = origVp.width;
      existing.pdfHeight = origVp.height;
    }
    canvas.requestRenderAll();
  }, []);

  // ─── Save current page edits ──────────────────────────────────────
  const saveCurrentPageEdits = useCallback(() => {
    if (!fabricRef.current || currentPage < 1) return;
    const objs = fabricRef.current.getObjects();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serialized = objs.map((o: any) => o.toJSON([
      "isPdfText", "pdfTextId", "pdfX", "pdfBaselineY", "pdfFontSize",
      "pdfWidth", "pdfHeight", "pdfFontFamily", "pdfColorHex",
      "isTextOverlay",
    ]));
    const existing = pageEditsRef.current.get(currentPage);
    if (existing) existing.objects = serialized;
  }, [currentPage]);

  // ─── Load page edits onto canvas ──────────────────────────────────
  const loadPageEdits = useCallback(async (pageNum: number) => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    const fabric = await import("fabric");

    // Remove all non-background objects
    canvas.getObjects().slice().forEach((o: any) => canvas.remove(o));
    canvas.discardActiveObject();
    setSelectedType(null);
    activeTextRef.current = null;

    const editState = pageEditsRef.current.get(pageNum);
    if (editState?.objects?.length) {
      // Filter out overlay rects — they are regenerated by handleExtractText
      const toRestore = (editState.objects as any[]).filter(
        (o: any) => !o.isTextOverlay
      );
      if (toRestore.length) {
        const enlivened = await fabric.util.enlivenObjects(toRestore);
        enlivened.forEach((o: any) => canvas.add(o));
      }
    }
    canvas.requestRenderAll();
  }, []);

  // ─── Switch page ──────────────────────────────────────────────────
  const switchToPage = useCallback(async (pageNum: number) => {
    if (!fabricRef.current || pageNum < 1 || pageNum > numPages) return;
    setIsLoadingPage(true);
    try {
      saveCurrentPageEdits();
      await renderPageBackground(pageNum);
      await loadPageEdits(pageNum);
      setCurrentPage(pageNum);
      const canvas = fabricRef.current;
      canvas.setZoom(1);
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      setZoom(1);

      // If in editText mode, re-render overlays for the new page
      if (activeToolRef.current === "editText") {
        const texts = textLinesRef.current.get(pageNum);
        if (texts) renderTextOverlays(texts);
      }
    } finally {
      setIsLoadingPage(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numPages, saveCurrentPageEdits, renderPageBackground, loadPageEdits]);

  // ─── Load PDF ─────────────────────────────────────────────────────
  const handleUpload = useCallback(async () => {
    if (!files.length || !fabricRef.current) return;
    const canvas = fabricRef.current;
    try {
      const pdfjsLib: typeof import("pdfjs-dist") = await import(
        /* webpackIgnore: true */ "/pdfjs-viewer.min.mjs"
      );
      pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

      const formData = new FormData();
      formData.append("file", files[0]);
      const uploadRes = await fetch("/api/upload/pdf", { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const { filename, url } = await uploadRes.json();
      serverFilenameRef.current = filename;

      const pdf = await pdfjsLib.getDocument({ url }).promise;
      pdfDocRef.current = pdf;
      const pages = pdf.numPages;
      setNumPages(pages);
      setCurrentPage(1);
      pageEditsRef.current.clear();
      textLinesRef.current.clear();

      // Calculate scale
      const firstPage = await pdf.getPage(1);
      const vp = firstPage.getViewport({ scale: 1.0 });
      scaleRef.current = Math.min(1.5, 900 / vp.width);

      await renderPageBackground(1);
      canvas.getObjects().slice().forEach((o: any) => canvas.remove(o));
      canvas.discardActiveObject();
      canvas.setZoom(1);
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      setZoom(1);
      setSelectedType(null);
      activeTextRef.current = null;
      canvas.requestRenderAll();
      setEditorReady(true);
      requestAnimationFrame(() => fabricRef.current?.calcOffset());
    } catch (err) {
      console.error(err);
      addToast("error", "Failed to load PDF. Please make sure it's a valid PDF file.");
    }
  }, [files, renderPageBackground, addToast]);

  useEffect(() => {
    if (files.length > 0 && canvasInit) handleUpload();
  }, [files, canvasInit, handleUpload]);

  // ─── CORE FIX: Extract text with correct coordinate mapping ───────
  // PDF.js gives us text items where transform[4] = x, transform[5] = y
  // These are in PDF point space (origin bottom-left).
  // We use viewport.convertToViewportPoint() which correctly maps them.

  const extractPageText = useCallback(async (pageNum: number): Promise<TextLine[]> => {
    if (!pdfDocRef.current) return [];

    const scale = scaleRef.current;
    const page = await pdfDocRef.current.getPage(pageNum);
    // Viewport at scale=1 for PDF coordinate conversion
    const viewport1 = page.getViewport({ scale: 1.0 });
    // Viewport at display scale for pixel positions
    const viewportS = page.getViewport({ scale });

    const textContent = await page.getTextContent();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: any[] = textContent.items.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item: any) => typeof item.str === "string" && item.str.trim().length > 0 && Array.isArray(item.transform)
    );

    if (!items.length) return [];

    // ── Group items into lines by Y proximity ──────────────────────
    // PDF transform: [scaleX, skewY, skewX, scaleY, x, y]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type ParsedItem = { str: string; x: number; y: number; w: number; fontSize: number; hasEol: boolean };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsed: ParsedItem[] = items.map((item: any) => {
      const t = item.transform;
      const fontSize = Math.abs(t[3]) || Math.hypot(t[0], t[1]) || 12;
      return {
        str: item.str,
        x: t[4],
        y: t[5],  // baseline Y in PDF coords (bottom-left origin)
        w: item.width || 0,
        fontSize,
        hasEol: !!item.hasEOL,
      };
    });

    // Sort by Y descending (top of page first in PDF coords)
    parsed.sort((a, b) => b.y - a.y || a.x - b.x);

    // Group into lines: items within fontSize*0.4 of each other are same line
    const lineGroups: ParsedItem[][] = [];
    for (const item of parsed) {
      let placed = false;
      for (const grp of lineGroups) {
        if (Math.abs(item.y - grp[0].y) < grp[0].fontSize * 0.4) {
          grp.push(item);
          placed = true;
          break;
        }
      }
      if (!placed) lineGroups.push([item]);
    }

    // Sort each line left to right, then split on large gaps
    const lines: ParsedItem[][] = [];
    for (const grp of lineGroups) {
      grp.sort((a, b) => a.x - b.x);
      let cur: ParsedItem[] = [grp[0]];
      for (let i = 1; i < grp.length; i++) {
        const prev = cur[cur.length - 1];
        const curr = grp[i];
        const gap = curr.x - (prev.x + prev.w);
        // New column or explicit EOL: gap > 2 em
        if (gap > prev.fontSize * 2.0 || prev.hasEol) {
          lines.push(cur);
          cur = [curr];
        } else {
          cur.push(curr);
        }
      }
      lines.push(cur);
    }

    // Convert each line group to TextLine with correct canvas coords
    const result: TextLine[] = [];
    for (let idx = 0; idx < lines.length; idx++) {
      const grp = lines[idx];
      if (!grp.length) continue;

      // Build the text string, inserting spaces based on gap
      let str = "";
      for (let i = 0; i < grp.length; i++) {
        if (i > 0) {
          const prev = grp[i - 1];
          const gap = grp[i].x - (prev.x + prev.w);
          if (gap > prev.fontSize * 0.25) str += " ";
        }
        str += grp[i].str;
      }
      str = str.trim();
      if (!str) continue;

      const fontSize = Math.max(...grp.map(g => g.fontSize));
      const minX = grp[0].x;
      const maxX = grp[grp.length - 1].x + grp[grp.length - 1].w;
      const baselineY = grp[0].y;  // PDF baseline (bottom-left)

      // ── Convert PDF points → canvas pixels using the viewport ──
      // PDF Y axis is flipped vs canvas. viewport.convertToViewportPoint
      // handles the flip: (pdfX, pdfY) → (canvasX, canvasY) at scale=1
      // Then we multiply by our scale.

      // Top-left of text bounding box in PDF space:
      // ascender ≈ baseline + fontSize * 0.8
      // descender ≈ baseline - fontSize * 0.2
      const pdfTop = baselineY + fontSize * 0.8;      // higher Y in PDF = higher on page
      const pdfBottom = baselineY - fontSize * 0.2;

      // Convert corners through viewport (scale=1)
      const [cvX1] = viewport1.convertToViewportPoint(minX, pdfTop);
      const [, cvY1] = viewport1.convertToViewportPoint(minX, pdfTop);
      const [cvX2] = viewport1.convertToViewportPoint(maxX, pdfBottom);
      const [, cvY2] = viewport1.convertToViewportPoint(maxX, pdfBottom);

      // Ensure top < bottom for canvas (Y increases downward in canvas)
      const canvasX = Math.min(cvX1, cvX2) * scale;
      const canvasY = Math.min(cvY1, cvY2) * scale;
      const canvasW = Math.max(Math.abs(cvX2 - cvX1) * scale, 20);
      const canvasH = Math.max(Math.abs(cvY2 - cvY1) * scale, 10);
      const canvasFontSize = Math.max(fontSize * scale, 8);

      // Also get the canvas baseline Y for accurate PDF-lib rendering later
      const [, cvBaselineY] = viewport1.convertToViewportPoint(minX, baselineY);

      result.push({
        id: `t${idx}`,
        text: str,
        x: canvasX,
        y: canvasY,
        w: canvasW,
        h: canvasH,
        pdfX: minX,
        pdfBaselineY: baselineY,
        pdfFontSize: fontSize,
        canvasFontSize,
        fontFamily: "Arial",
        colorHex: "#000000",
      });

      // Suppress unused variable warning
      void cvBaselineY;
    }

    return result;
  }, []);

  // ─── Render clickable overlays on canvas ──────────────────────────
  const renderTextOverlays = useCallback(async (lines: TextLine[]) => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    const fabric = await import("fabric");

    // Remove old overlays
    canvas.getObjects().slice()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((o: any) => o.isTextOverlay)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .forEach((o: any) => canvas.remove(o));

    for (const line of lines) {
      const rect = new fabric.Rect({
        left: line.x,
        top: line.y,
        width: line.w,
        height: line.h,
        fill: "rgba(59, 130, 246, 0.08)",
        stroke: "rgba(59, 130, 246, 0.5)",
        strokeWidth: 1.5,
        strokeUniform: true,
        selectable: true,
        evented: true,
        hoverCursor: "text",
        // Store line data directly on the object
        isTextOverlay: true,
        overlayTextId: line.id,
      } as any);
      canvas.add(rect);
    }
    canvas.requestRenderAll();
  }, []);

  const removeTextOverlays = useCallback(() => {
    if (!fabricRef.current) return;
    fabricRef.current.getObjects().slice()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((o: any) => o.isTextOverlay)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .forEach((o: any) => fabricRef.current.remove(o));
    fabricRef.current.requestRenderAll();
  }, []);

  // ─── Handle Extract Text ──────────────────────────────────────────
  const handleExtractText = useCallback(async () => {
    if (!pdfDocRef.current || !fabricRef.current) return;
    setIsExtractingText(true);
    setActiveTool("editText");

    try {
      // Extract all pages
      for (let i = 1; i <= numPages; i++) {
        if (!textLinesRef.current.has(i)) {
          const lines = await extractPageText(i);
          textLinesRef.current.set(i, lines);
        }
      }
      // Render current page overlays
      const lines = textLinesRef.current.get(currentPage) || [];
      await renderTextOverlays(lines);
    } catch (err) {
      console.error("Text extraction failed:", err);
      addToast("error", "Failed to extract text from this PDF.");
      setActiveTool("select");
    } finally {
      setIsExtractingText(false);
    }
  }, [numPages, currentPage, extractPageText, renderTextOverlays, addToast]);

  // ─── CORE FIX: Convert overlay rect → editable IText on dblclick ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOverlayClick = useCallback(async (overlayRect: any) => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    const fabric = await import("fabric");

    const textId = overlayRect.overlayTextId as string;
    const lines = textLinesRef.current.get(currentPage);
    if (!lines) return;
    const line = lines.find(l => l.id === textId);
    if (!line) return;

    // Remove the overlay rect immediately
    canvas.remove(overlayRect);

    // 1. White cover rect to hide original PDF text
    const coverRect = new fabric.Rect({
      left: line.x - 2,
      top: line.y - 2,
      width: line.w + 4,
      height: line.h + 4,
      fill: "#ffffff",
      stroke: "transparent",
      strokeWidth: 0,
      selectable: false,
      evented: false,
      // metadata for export
      isPdfTextCover: true,
      coverTextId: line.id,
      pdfX: line.pdfX,
      pdfBaselineY: line.pdfBaselineY,
      pdfFontSize: line.pdfFontSize,
    } as any);
    canvas.add(coverRect);

    // 2. Editable IText at exact position
    const itext = new fabric.IText(line.text, {
      left: line.x,
      top: line.y,
      fontSize: line.canvasFontSize,
      fill: "#000000",
      fontFamily: "Arial",
      editable: true,
      cursorColor: "#3b82f6",
      editingBorderColor: "#3b82f6",
      // metadata for export
      isPdfText: true,
      pdfTextId: line.id,
      pdfX: line.pdfX,
      pdfBaselineY: line.pdfBaselineY,
      pdfFontSize: line.pdfFontSize,
    } as any);
    canvas.add(itext);

    // Auto-enter editing mode
    canvas.setActiveObject(itext);
    canvas.requestRenderAll();
    // Small delay ensures fabric renders before entering edit
    setTimeout(() => {
      itext.enterEditing();
      itext.selectAll();
      canvas.requestRenderAll();
    }, 50);

    setSelectedType("text");
    activeTextRef.current = itext;
    syncTextProps(itext);
  }, [currentPage]);

  // ─── Double-click handler on canvas ──────────────────────────────
  useEffect(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onDblClick = (e: any) => {
      const target = e.target;
      if (target?.isTextOverlay) {
        handleOverlayClick(target);
      }
    };

    canvas.on("mouse:dblclick", onDblClick);
    return () => { canvas.off("mouse:dblclick", onDblClick); };
  }, [canvasInit, handleOverlayClick]);

  // ─── Toggle overlays when tool changes ───────────────────────────
  useEffect(() => {
    if (!fabricRef.current) return;
    if (activeTool !== "editText") {
      removeTextOverlays();
    } else {
      const lines = textLinesRef.current.get(currentPage);
      if (lines) renderTextOverlays(lines);
    }
  }, [activeTool, currentPage, removeTextOverlays, renderTextOverlays]);

  // ─── Add new text ─────────────────────────────────────────────────
  const handleAddText = useCallback(async () => {
    if (!fabricRef.current) return;
    const fabric = await import("fabric");
    const itext = new fabric.IText("Edit me", {
      left: 80, top: 80,
      fontSize: textProps.fontSize,
      fill: textProps.fill,
      fontFamily: textProps.fontFamily,
      fontWeight: textProps.bold ? "bold" : "normal",
      fontStyle: textProps.italic ? "italic" : "normal",
      underline: textProps.underline,
      textAlign: textProps.textAlign,
      editable: true,
      cursorColor: "#3b82f6",
      editingBorderColor: "#3b82f6",
    });
    fabricRef.current.add(itext);
    fabricRef.current.setActiveObject(itext);
    setTimeout(() => {
      itext.enterEditing();
      itext.selectAll();
      fabricRef.current?.requestRenderAll();
    }, 50);
  }, [textProps]);

  const applyTextProp = useCallback((prop: string, value: unknown) => {
    if (!fabricRef.current || !activeTextRef.current) return;
    activeTextRef.current.set(prop, value);
    fabricRef.current.requestRenderAll();
  }, []);

  // ─── Zoom ─────────────────────────────────────────────────────────
  const handleZoom = useCallback((dir: "in" | "out" | "reset") => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    if (dir === "reset") {
      canvas.setZoom(1);
      canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
      setZoom(1);
    } else {
      const newZoom = dir === "in" ? Math.min(zoom + 0.15, 4) : Math.max(zoom - 0.15, 0.3);
      canvas.setZoom(newZoom);
      setZoom(newZoom);
    }
    canvas.requestRenderAll();
  }, [zoom]);

  // ─── Export PDF ───────────────────────────────────────────────────
  const handleExportPdf = useCallback(async () => {
    if (!fabricRef.current || !serverFilenameRef.current) return;
    setIsExporting(true);
    try {
      saveCurrentPageEdits();
      const fabric = await import("fabric");
      const scale = scaleRef.current;

      interface TextEdit {
        pdfX: number;
        pdfBaselineY: number;
        pdfFontSize: number;
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

      const pagePayloads: PagePayload[] = [];

      for (let i = 1; i <= numPages; i++) {
        const state = pageEditsRef.current.get(i);
        if (!state || !state.objects.length) continue;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const objs = state.objects as any[];

        // Collect edited PDF text objects
        const textEdits: TextEdit[] = objs
          .filter((o: any) => o.isPdfText && o.pdfTextId)
          .map((o: any) => ({
            pdfX: o.pdfX,
            pdfBaselineY: o.pdfBaselineY,
            pdfFontSize: o.pdfFontSize,
            newText: o.text || "",
            fontFamily: o.fontFamily || "Arial",
            colorHex: typeof o.fill === "string" && o.fill.startsWith("#") ? o.fill : "#000000",
            bold: o.fontWeight === "bold",
            italic: o.fontStyle === "italic",
          }));

        // Render non-PDF-text, non-cover, non-overlay objects to PNG
        const drawingObjs = objs.filter(
          (o: any) => !o.isTextOverlay && !o.isPdfTextCover && !o.isPdfText
        );

        let drawingBase64: string | null = null;
        if (drawingObjs.length) {
          const tmpEl = document.createElement("canvas");
          tmpEl.width = state.pdfWidth * scale;
          tmpEl.height = state.pdfHeight * scale;
          const tmpCanvas = new fabric.StaticCanvas(tmpEl, {
            width: state.pdfWidth * scale,
            height: state.pdfHeight * scale,
          });
          const enlivened = await fabric.util.enlivenObjects(drawingObjs);
          enlivened.forEach((o: any) => tmpCanvas.add(o));
          tmpCanvas.backgroundColor = "transparent";
          tmpCanvas.requestRenderAll();
          const png = tmpCanvas.toDataURL({ format: "png", quality: 1, multiplier: 1 });
          drawingBase64 = png.replace(/^data:image\/png;base64,/, "");
          tmpCanvas.dispose();
        }

        pagePayloads.push({
          pageNumber: i,
          pdfWidth: state.pdfWidth,
          pdfHeight: state.pdfHeight,
          textEdits,
          drawingBase64,
        });
      }

      const fd = new FormData();
      fd.append("serverFilename", serverFilenameRef.current!);
      fd.append("edits", JSON.stringify(pagePayloads));

      const res = await fetch("/api/pdf-editor", { method: "POST", body: fd });
      if (!res.ok) throw new Error(`Server error ${res.status}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.download = `edited-${files[0]?.name?.replace(/\.[^/.]+$/, "") ?? "document"}.pdf`;
      a.href = url;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err) {
      console.error("Export error:", err);
      addToast("error", "Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }, [numPages, files, saveCurrentPageEdits, addToast]);

  // ─── Reset ────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setFiles([]);
    setEditorReady(false);
    setSelectedType(null);
    setZoom(1);
    activeTextRef.current = null;
    setActiveTool("select");
    setNumPages(0);
    setCurrentPage(1);
    pageEditsRef.current.clear();
    textLinesRef.current.clear();
    pdfDocRef.current = null;
    serverFilenameRef.current = null;
    setIsExtractingText(false);
    if (fabricRef.current) {
      fabricRef.current.clear();
      fabricRef.current.backgroundImage = undefined;
      fabricRef.current.backgroundColor = "#e0e0e0";
      fabricRef.current.isDrawingMode = false;
      fabricRef.current.setZoom(1);
      fabricRef.current.setViewportTransform([1, 0, 0, 1, 0, 0]);
      fabricRef.current.requestRenderAll();
    }
  }, []);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-10">
        <ToolHero
          icon={FileEdit}
          title="PDF Editor"
          description="Draw, highlight, add text, and erase directly on your PDF pages — free and fully private. A full-featured browser-based editor with no account and no watermarks."
          backHref="/pdf-tools"
          backLabel="Back to PDF Tools"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-6">
        {/* Upload */}
        {!editorReady && (
          <div className="glass-panel rounded-[16px] p-6 sm:p-8">
            <FileUpload
              accept=".pdf"
              files={files}
              onFilesChange={setFiles}
              label="Drop your PDF here"
              description="or click to browse — PDF files only"
            />
            {!canvasInit && (
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-foreground-secondary">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading editor…
              </div>
            )}
          </div>
        )}

        {/* Editor */}
        <div style={{ display: editorReady ? "block" : "none" }}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Canvas area */}
            <div className="flex-1 min-w-0">
              <div className="glass-panel rounded-[16px] shadow-sm overflow-hidden">
                {/* Top toolbar */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-surface-2 flex-wrap gap-2">
                  <div className="flex items-center gap-1 flex-wrap">
                    {[
                      { tool: "select" as ActiveTool, icon: FileEdit, label: "Select" },
                      { tool: "draw" as ActiveTool, icon: Paintbrush, label: "Draw" },
                      { tool: "highlight" as ActiveTool, icon: Highlighter, label: "Highlight" },
                      { tool: "erase" as ActiveTool, icon: Eraser, label: "Erase" },
                    ].map(({ tool, icon: Icon, label }) => (
                      <button
                        key={tool}
                        onClick={() => setActiveTool(tool)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          activeTool === tool
                            ? "bg-primary text-white"
                            : "bg-primary-muted text-primary hover:bg-primary/20"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" /> {label}
                      </button>
                    ))}

                    <button
                      onClick={handleExtractText}
                      disabled={isExtractingText}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                        activeTool === "editText"
                          ? "bg-primary text-white"
                          : "bg-primary-muted text-primary hover:bg-primary/20"
                      }`}
                    >
                      {isExtractingText
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <ScanText className="w-3.5 h-3.5" />}
                      Edit Text
                    </button>

                    <div className="w-px h-5 bg-border mx-1" />

                    <button
                      onClick={handleAddText}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-muted text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                    >
                      <Type className="w-3.5 h-3.5" /> Add Text
                    </button>

                    {selectedType === "text" && (
                      <button
                        onClick={handleDeleteSelected}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger-muted text-danger text-xs font-semibold hover:bg-danger/20 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    )}
                  </div>

                  {/* Zoom controls */}
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleZoom("out")} className="p-1.5 rounded-lg hover:bg-surface-2 text-foreground-secondary hover:text-primary transition-colors">
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-semibold text-foreground-secondary min-w-[2.5rem] text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button onClick={() => handleZoom("in")} className="p-1.5 rounded-lg hover:bg-surface-2 text-foreground-secondary hover:text-primary transition-colors">
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleZoom("reset")} className="p-1.5 rounded-lg hover:bg-surface-2 text-foreground-secondary hover:text-primary transition-colors">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Page navigation */}
                <div className="flex items-center justify-center gap-3 px-3 py-2 border-b border-border bg-surface-2">
                  <button
                    onClick={() => switchToPage(currentPage - 1)}
                    disabled={currentPage <= 1 || isLoadingPage}
                    className="p-1.5 rounded-lg hover:bg-surface-1 text-foreground-secondary hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-xs font-semibold text-foreground-secondary">
                    Page {currentPage} of {numPages}
                  </span>
                  <button
                    onClick={() => switchToPage(currentPage + 1)}
                    disabled={currentPage >= numPages || isLoadingPage}
                    className="p-1.5 rounded-lg hover:bg-surface-1 text-foreground-secondary hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  {isLoadingPage && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                </div>

                {/* Canvas */}
                <div className="overflow-auto bg-surface-2" style={{ maxHeight: "70vh" }}>
                  <div className="flex items-start justify-center p-4 min-h-[400px]">
                    <canvas ref={canvasElRef} />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleExportPdf}
                  disabled={isExporting}
                  className="btn btn-primary inline-flex items-center gap-2 text-xs disabled:opacity-50"
                >
                  {isExporting
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Exporting…</>
                    : <><Download className="w-4 h-4" /> Download PDF</>}
                </button>
                <button
                  onClick={handleReset}
                  className="btn btn-secondary inline-flex items-center gap-2 text-xs"
                >
                  <RotateCcw className="w-4 h-4" /> Start Over
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:w-72 flex-shrink-0 space-y-4">
              {/* Edit Text panel */}
              {activeTool === "editText" && (
                <div className="glass-panel rounded-[16px] shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-border bg-surface-2">
                    <h3 className="font-semibold text-foreground text-xs flex items-center gap-2">
                      <ScanText className="w-4 h-4 text-primary" /> Edit Existing Text
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-foreground-secondary leading-relaxed">
                      Blue boxes show detected text regions.{" "}
                      <strong>Double-click</strong> any box to edit it inline — the original text is replaced instantly.
                    </p>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 border border-blue-100">
                      <span className="inline-block w-3 h-3 rounded-sm bg-blue-100 border border-blue-400 flex-shrink-0" />
                      <span className="text-xs text-blue-700">Double-click a box to edit</span>
                    </div>
                    <button
                      onClick={handleExtractText}
                      disabled={isExtractingText}
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary-muted text-primary text-xs font-semibold hover:bg-primary/20 transition-colors disabled:opacity-50"
                    >
                      {isExtractingText
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <ScanText className="w-3.5 h-3.5" />}
                      Re-scan Page
                    </button>
                  </div>
                </div>
              )}

              {/* Drawing tools */}
              {(activeTool === "draw" || activeTool === "highlight" || activeTool === "erase") && (
                <div className="glass-panel rounded-[16px] shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-border bg-surface-2">
                    <h3 className="font-semibold text-foreground text-xs flex items-center gap-2">
                      {activeTool === "draw" ? <Paintbrush className="w-4 h-4 text-primary" />
                        : activeTool === "highlight" ? <Highlighter className="w-4 h-4 text-primary" />
                        : <Eraser className="w-4 h-4 text-primary" />}
                      {activeTool === "draw" ? "Drawing" : activeTool === "highlight" ? "Highlight" : "Eraser"} Tool
                    </h3>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-foreground-secondary">Brush Size</label>
                        <span className="text-xs font-mono text-foreground-secondary">{brushSize}px</span>
                      </div>
                      <input
                        type="range" min={1} max={30} step={1} value={brushSize}
                        onChange={e => setBrushSize(parseInt(e.target.value))}
                        className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                    {activeTool !== "erase" && (
                      <div>
                        <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={activeTool === "highlight" ? highlightColor : brushColor}
                            onChange={e => activeTool === "highlight" ? setHighlightColor(e.target.value) : setBrushColor(e.target.value)}
                            className="w-9 h-9 rounded-lg border border-border cursor-pointer p-0.5"
                          />
                          <span className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface-1 text-foreground text-xs font-mono">
                            {activeTool === "highlight" ? highlightColor : brushColor}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap mt-2">
                          {(activeTool === "highlight"
                            ? ["#FFFF00", "#00FF7F", "#00BFFF", "#FF6347", "#FF69B4", "#FFA500"]
                            : ["#000000", "#ef4444", "#3b82f6", "#22c55e", "#f97316", "#8b5cf6"]
                          ).map(c => (
                            <button
                              key={c}
                              onClick={() => activeTool === "highlight" ? setHighlightColor(c) : setBrushColor(c)}
                              className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Text Properties */}
              <div className="glass-panel rounded-[16px] shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-surface-2">
                  <h3 className="font-semibold text-foreground text-xs flex items-center gap-2">
                    <Type className="w-4 h-4 text-primary" /> Text Properties
                  </h3>
                </div>
                <div className="p-4 space-y-3">
                  {!selectedType ? (
                    <p className="text-xs text-foreground-secondary">
                      Select a text element to edit its properties. Double-click existing text boxes to edit them inline.
                    </p>
                  ) : (
                    <>
                      <div>
                        <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Font</label>
                        <select
                          value={textProps.fontFamily}
                          onChange={e => { setTextProps(p => ({ ...p, fontFamily: e.target.value })); applyTextProp("fontFamily", e.target.value); }}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:border-primary"
                        >
                          {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Size</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { const v = Math.max(8, textProps.fontSize - 2); setTextProps(p => ({ ...p, fontSize: v })); applyTextProp("fontSize", v); }}
                            className="p-1.5 rounded-lg border border-border hover:bg-surface-2 text-foreground-secondary"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number" min={8} max={200} value={textProps.fontSize}
                            onChange={e => { const v = Math.max(8, Math.min(200, parseInt(e.target.value) || 8)); setTextProps(p => ({ ...p, fontSize: v })); applyTextProp("fontSize", v); }}
                            className="w-16 text-center px-2 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:border-primary"
                          />
                          <button
                            onClick={() => { const v = Math.min(200, textProps.fontSize + 2); setTextProps(p => ({ ...p, fontSize: v })); applyTextProp("fontSize", v); }}
                            className="p-1.5 rounded-lg border border-border hover:bg-surface-2 text-foreground-secondary"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color" value={textProps.fill}
                            onChange={e => { setTextProps(p => ({ ...p, fill: e.target.value })); applyTextProp("fill", e.target.value); }}
                            className="w-9 h-9 rounded-lg border border-border cursor-pointer p-0.5"
                          />
                          <input
                            type="text" value={textProps.fill}
                            onChange={e => { setTextProps(p => ({ ...p, fill: e.target.value })); applyTextProp("fill", e.target.value); }}
                            className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface-1 text-foreground text-xs font-mono focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Style</label>
                        <div className="flex items-center gap-1">
                          {[
                            { key: "bold", icon: Bold, on: textProps.bold, click: () => { const v = !textProps.bold; setTextProps(p => ({ ...p, bold: v })); applyTextProp("fontWeight", v ? "bold" : "normal"); } },
                            { key: "italic", icon: Italic, on: textProps.italic, click: () => { const v = !textProps.italic; setTextProps(p => ({ ...p, italic: v })); applyTextProp("fontStyle", v ? "italic" : "normal"); } },
                            { key: "underline", icon: Underline, on: textProps.underline, click: () => { const v = !textProps.underline; setTextProps(p => ({ ...p, underline: v })); applyTextProp("underline", v); } },
                          ].map(({ key, icon: Icon, on, click }) => (
                            <button key={key} onClick={click}
                              className={`p-2 rounded-lg border transition-colors ${on ? "bg-primary-muted border-primary text-primary" : "border-border text-foreground-secondary hover:text-primary"}`}
                            >
                              <Icon className="w-4 h-4" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Alignment</label>
                        <div className="flex items-center gap-1">
                          {(["left", "center", "right"] as const).map((align, i) => {
                            const Icon = [AlignLeft, AlignCenter, AlignRight][i];
                            return (
                              <button key={align} onClick={() => { setTextProps(p => ({ ...p, textAlign: align })); applyTextProp("textAlign", align); }}
                                className={`p-2 rounded-lg border transition-colors ${textProps.textAlign === align ? "bg-primary-muted border-primary text-primary" : "border-border text-foreground-secondary hover:text-primary"}`}
                              >
                                <Icon className="w-4 h-4" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  <button
                    onClick={handleAddText}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed border-primary-border text-primary text-xs font-semibold hover:bg-primary-muted transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add New Text
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="type-h4 font-semibold text-foreground mb-1">Secure Processing</h4>
              <p className="type-small text-foreground-secondary leading-relaxed">
                Files are deleted immediately after processing. We never store or share your data.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="type-h4 font-semibold text-foreground mb-1">True Inline Editing</h4>
              <p className="type-small text-foreground-secondary leading-relaxed">
                Double-click any detected text to edit it instantly. No overlays, no workarounds — real inline editing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}