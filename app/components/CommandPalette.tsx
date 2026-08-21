"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FileDown,
  Image,
  Merge,
  FileText,
  Table2,
  Highlighter,
  FileEdit,
  BookOpen,
  Scissors,
  RotateCw,
  Droplets,
  EyeOff,
  GitCompare,
  Receipt,
  PenTool,
  Unlock,
  Lock,
  LayoutList,
  ListOrdered,
  Crop,
  Layers,
  ScanSearch,
  Eraser,
  Camera,
  Smartphone,
  ShieldCheck,
  Maximize,
  Type,
  ArrowRightLeft,
  Pencil,
  Film,
  Grid3x3,
  LayoutGrid,
  MessageSquare,
  Maximize2,
  Sparkles,
  Palette,
  Braces,
  Server,
  Settings,
  Database,
  Mail,
  QrCode,
  Barcode,
  Binary,
  Regex,
  BookOpen as BookOpenIcon,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
  Paintbrush,
  Eye,
  Bug,
  PenLine,
  FolderTree,
  Ruler,
  Code,
} from "lucide-react";
import { createPortal } from "react-dom";

// ─── Tool Data ────────────────────────────────────────────
interface Tool {
  name: string;
  description: string;
  href: string;
  category: "PDF" | "Image" | "Dev";
  icon: React.ComponentType<{ className?: string }>;
  keywords: string[];
}

const tools: Tool[] = [
  // PDF
  { name: "Compress PDF", description: "Reduce PDF file size without losing quality", href: "/compress-pdf", category: "PDF", icon: FileDown, keywords: ["shrink", "optimize", "reduce", "smaller"] },
  { name: "PDF to JPG", description: "Convert PDF pages to high-quality JPG images", href: "/pdf-to-jpg", category: "PDF", icon: Image, keywords: ["image", "picture", "extract", "pages"] },
  { name: "Merge PDF", description: "Combine multiple PDFs into one document", href: "/merge-pdf", category: "PDF", icon: Merge, keywords: ["combine", "join", "unite", "append"] },
  { name: "PDF to Text", description: "Extract text from PDF files", href: "/pdf-to-text", category: "PDF", icon: FileText, keywords: ["copy", "plaintext", "extract text"] },
  { name: "PDF to Data", description: "Convert PDF to JSON or CSV structured data", href: "/pdf-to-data", category: "PDF", icon: Table2, keywords: ["json", "csv", "structured", "parse"] },
  { name: "Highlight Extractor", description: "Pull annotated text from PDFs", href: "/highlight-extractor", category: "PDF", icon: Highlighter, keywords: ["annotation", "markup", "notes"] },
  { name: "PDF Editor", description: "Draw, highlight, add text on PDF pages", href: "/pdf-editor", category: "PDF", icon: FileEdit, keywords: ["annotate", "markup", "draw", "write"] },
  { name: "PDF Flipbook", description: "Read PDFs as interactive 3D flipbooks", href: "/flipbook-pdf", category: "PDF", icon: BookOpen, keywords: ["page turn", "animation", "reader", "3d"] },
  { name: "Split PDF", description: "Divide PDF by page ranges or extract pages", href: "/split-pdf", category: "PDF", icon: Scissors, keywords: ["separate", "divide", "extract pages"] },
  { name: "Rotate PDF", description: "Rotate individual or all PDF pages", href: "/rotate-pdf", category: "PDF", icon: RotateCw, keywords: ["orientation", "turn", "flip"] },
  { name: "Watermark PDF", description: "Add custom text watermarks to PDF", href: "/watermark-pdf", category: "PDF", icon: Droplets, keywords: ["stamp", "brand", "overlay"] },
  { name: "Redact PDF", description: "Permanently black out sensitive information", href: "/redact-pdf", category: "PDF", icon: EyeOff, keywords: ["censor", "hide", "black out", "sensitive"] },
  { name: "PDF Diff", description: "Compare two PDFs side by side", href: "/pdf-diff", category: "PDF", icon: GitCompare, keywords: ["compare", "difference", "changes"] },
  { name: "PDF Form Filler", description: "Fill PDF form fields without Adobe", href: "/pdf-form-filler", category: "PDF", icon: FileEdit, keywords: ["form", "fields", "checkboxes", "fillable"] },
  { name: "HTML to PDF", description: "Convert HTML markup to a clean PDF", href: "/html-to-pdf", category: "PDF", icon: FileDown, keywords: ["webpage", "html", "convert"] },
  { name: "Invoice Generator", description: "Create professional PDF invoices", href: "/invoice-generator", category: "PDF", icon: Receipt, keywords: ["bill", "receipt", "template", "payment"] },
  { name: "Sign PDF", description: "Add your signature to any PDF document", href: "/sign-pdf", category: "PDF", icon: PenTool, keywords: ["esignature", "digital signature", "draw sign"] },
  { name: "PPTX to PDF", description: "Convert PowerPoint presentations to PDF", href: "/pptx-to-pdf", category: "PDF", icon: FileDown, keywords: ["powerpoint", "presentation", "slides"] },
  { name: "Unlock PDF", description: "Remove PDF password protection", href: "/unlock-pdf", category: "PDF", icon: Unlock, keywords: ["decrypt", "remove password", "unprotect"] },
  { name: "Protect PDF", description: "Add password encryption to PDF", href: "/protect-pdf", category: "PDF", icon: Lock, keywords: ["encrypt", "secure", "password", "lock"] },
  { name: "Organize PDF", description: "Reorder, delete & duplicate PDF pages", href: "/organize-pdf", category: "PDF", icon: LayoutList, keywords: ["reorder", "rearrange", "manage pages"] },
  { name: "Add Page Numbers", description: "Insert page numbers in any position", href: "/page-numbers", category: "PDF", icon: ListOrdered, keywords: ["paginate", "number pages", "footer"] },
  { name: "Crop PDF", description: "Trim PDF page margins & white space", href: "/crop-pdf", category: "PDF", icon: Crop, keywords: ["trim", "margins", "cut"] },
  { name: "Flatten PDF", description: "Merge form fields into static content", href: "/flatten-pdf", category: "PDF", icon: Layers, keywords: ["static", "non-editable", "form fields"] },
  { name: "Extract Images from PDF", description: "Pull embedded images from PDFs", href: "/extract-images-pdf", category: "PDF", icon: Image, keywords: ["pictures", "photos", "download images"] },
  { name: "PDF OCR", description: "Make scanned PDFs searchable with Tesseract", href: "/pdf-ocr", category: "PDF", icon: ScanSearch, keywords: ["scan", "searchable", "text layer", "tesseract"] },
  { name: "PDF to Word", description: "Convert PDF to editable DOCX", href: "/pdf-to-word", category: "PDF", icon: FileDown, keywords: ["docx", "word", "edit", "convert"] },
  { name: "PDF to Excel", description: "Convert PDF tables to XLSX", href: "/pdf-to-excel", category: "PDF", icon: Table2, keywords: ["xlsx", "spreadsheet", "tables", "convert"] },
  // Image
  { name: "Compress Image", description: "Reduce image file size while keeping quality", href: "/compress-image", category: "Image", icon: FileDown, keywords: ["shrink", "optimize", "reduce photo"] },
  { name: "Image to PDF", description: "Convert images into one PDF document", href: "/image-to-pdf", category: "Image", icon: Image, keywords: ["jpg to pdf", "png to pdf", "photos"] },
  { name: "Resize Image", description: "Scale image dimensions to any target size", href: "/resize-image", category: "Image", icon: Maximize, keywords: ["scale", "dimensions", "pixels"] },
  { name: "Image to Text", description: "Extract text from images using OCR", href: "/image-to-text", category: "Image", icon: Type, keywords: ["ocr", "copy text", "screenshot"] },
  { name: "Convert Image", description: "Switch formats — PNG, JPG, WebP, SVG", href: "/convert-image", category: "Image", icon: ArrowRightLeft, keywords: ["png to jpg", "jpg to png", "webp", "heic"] },
  { name: "Edit Image", description: "Adjust, crop, filter & enhance photos", href: "/edit-image", category: "Image", icon: Pencil, keywords: ["adjust", "filter", "brightness", "contrast"] },
  { name: "Blur Background", description: "Professional bokeh effect for photos", href: "/blur-background", category: "Image", icon: Droplets, keywords: ["bokeh", "isolation", "portrait"] },
  { name: "HEIC to JPG", description: "Convert iPhone HEIC/HEIF photos", href: "/heic-to-jpg", category: "Image", icon: Smartphone, keywords: ["iphone", "heif", "apple", "batch"] },
  { name: "EXIF Remover", description: "Strip GPS & metadata from photos", href: "/exif-remover", category: "Image", icon: ShieldCheck, keywords: ["privacy", "gps", "camera info", "metadata"] },
  { name: "Batch Image Resizer", description: "Resize 50+ images at once", href: "/batch-resize", category: "Image", icon: Maximize, keywords: ["bulk", "mass", "multiple", "zip"] },
  { name: "Background Remover", description: "Remove image backgrounds with AI", href: "/remove-bg", category: "Image", icon: Eraser, keywords: ["transparent", "cutout", "no background", "ai"] },
  { name: "ID Photo Maker", description: "Create passport & visa photos", href: "/id-photo", category: "Image", icon: Camera, keywords: ["passport", "visa", "id", "300dpi"] },
  { name: "Social Media Image Resizer", description: "Presets for Instagram, Twitter, LinkedIn", href: "/social-image", category: "Image", icon: Smartphone, keywords: ["instagram", "twitter", "linkedin", "youtube", "tiktok"] },
  { name: "Color Blindness Simulator", description: "Test design accessibility", href: "/color-blind-simulator", category: "Image", icon: Eye, keywords: ["accessibility", "protanopia", "deuteranopia", "a11y"] },
  { name: "Watermark Remover", description: "Inpaint & remove watermarks from images", href: "/watermark-remover", category: "Image", icon: Paintbrush, keywords: ["remove watermark", "inpaint", "clean"] },
  { name: "Video to GIF", description: "Convert video clips to GIFs", href: "/video-to-gif", category: "Image", icon: Film, keywords: ["gif", "ffmpeg", "clip", "animation"] },
  { name: "Image Cropper", description: "Crop images with precision presets", href: "/crop-image", category: "Image", icon: Crop, keywords: ["1:1", "4:3", "16:9", "aspect"] },
  { name: "Rotate & Flip Image", description: "Rotate 90°/180°/270° and flip", href: "/rotate-image", category: "Image", icon: RotateCw, keywords: ["flip", "horizontal", "vertical"] },
  { name: "Image Splitter", description: "Split images into Instagram grids", href: "/split-image", category: "Image", icon: Grid3x3, keywords: ["grid", "carousel", "instagram", "1x3", "3x3"] },
  { name: "GIF Maker", description: "Create animated GIFs from images", href: "/gif-maker", category: "Image", icon: Film, keywords: ["animate", "frames", "loop", "delay"] },
  { name: "Collage Maker", description: "Create photo collages with layouts", href: "/collage-maker", category: "Image", icon: LayoutGrid, keywords: ["2x2", "3x3", "photos", "grid"] },
  { name: "Meme Generator", description: "Add text to images & create memes", href: "/meme-generator", category: "Image", icon: MessageSquare, keywords: ["impact", "text overlay", "funny"] },
  { name: "Image Annotator", description: "Add arrows, text & markup to images", href: "/annotate-image", category: "Image", icon: PenTool, keywords: ["arrows", "rectangles", "feedback", "markup"] },
  { name: "Image Upscaler", description: "Upscale images up to 4× without quality loss", href: "/upscale-image", category: "Image", icon: Maximize2, keywords: ["enlarge", "super resolution", "4x", "sharpen"] },
  { name: "Photo Enhancer", description: "Auto-fix & fine-tune image quality", href: "/photo-enhancer", category: "Image", icon: Sparkles, keywords: ["auto fix", "brightness", "saturation", "enhance"] },
  { name: "Colorize Image", description: "Add color to black & white photos", href: "/colorize-image", category: "Image", icon: Palette, keywords: ["black and white", "sepia", "color", "bw"] },
  // Dev
  { name: "JSON Preview", description: "Visualize JSON as interactive tree", href: "/json-preview", category: "Dev", icon: Braces, keywords: ["viewer", "inspect", "tree", "collapse"] },
  { name: "API Formatter", description: "Beautify & inspect API responses", href: "/api-formatter", category: "Dev", icon: Server, keywords: ["status", "headers", "response", "format"] },
  { name: "Code Screenshot", description: "Beautiful code snippet images", href: "/code-screenshot", category: "Dev", icon: Camera, keywords: ["carbon", "snippet", "image", "theme"] },
  { name: "Markdown Studio", description: "Render Markdown as styled docs", href: "/markdown-docs", category: "Dev", icon: Settings, keywords: ["preview", "md", "documentation", "render"] },
  { name: "Fake Data Generator", description: "Realistic mock & dummy data", href: "/fake-data", category: "Dev", icon: Database, keywords: ["mock", "dummy", "test", "faker", "csv"] },
  { name: "Email Signature Generator", description: "Professional HTML signatures", href: "/email-signature", category: "Dev", icon: Mail, keywords: ["signature", "html", "professional", "copy"] },
  { name: "SVG Optimizer", description: "Clean & reduce SVG file size", href: "/svg-optimizer", category: "Dev", icon: Sparkles, keywords: ["svgo", "clean", "figma", "illustrator"] },
  { name: "QR Code Generator", description: "QR codes for URLs, WiFi, vCards", href: "/qr-code", category: "Dev", icon: QrCode, keywords: ["qr", "url", "wifi", "vcard", "barcode"] },
  { name: "Barcode Generator", description: "Code128, EAN-13, UPC-A & more", href: "/barcode", category: "Dev", icon: Barcode, keywords: ["ean", "upc", "code128", "itf"] },
  { name: "Password Generator", description: "Crypto-secure & bulk passwords", href: "/password-generator", category: "Dev", icon: Lock, keywords: ["secure", "random", "strong", "bulk"] },
  { name: "JSON ↔ CSV Converter", description: "Bidirectional JSON/CSV conversion", href: "/json-csv", category: "Dev", icon: ArrowRightLeft, keywords: ["convert", "delimiter", "table"] },
  { name: "Favicon Generator", description: "ICO, PNG & manifest.json creator", href: "/favicon-generator", category: "Dev", icon: Image, keywords: ["ico", "app icon", "manifest", "apple"] },
  { name: "Color Picker & Palette", description: "Hex, RGB, HSL & WCAG contrast", href: "/color-picker", category: "Dev", icon: Palette, keywords: ["hex", "rgb", "hsl", "wcag", "contrast"] },
  { name: "Word Counter", description: "Words, characters, sentences & SEO", href: "/word-counter", category: "Dev", icon: FileText, keywords: ["count", "reading time", "density", "seo"] },
  { name: "Base64 Encode / Decode", description: "Base64, URL encoding & HTML entities", href: "/base64", category: "Dev", icon: Binary, keywords: ["encode", "decode", "url", "entities"] },
  { name: "Regex Tester", description: "Real-time matching, groups & cheat sheet", href: "/regex-tester", category: "Dev", icon: Regex, keywords: ["regular expression", "pattern", "match", "test"] },
  { name: "CSS Gradient Generator", description: "Linear, radial & conic gradients", href: "/gradient-generator", category: "Dev", icon: Palette, keywords: ["css", "linear", "radial", "conic"] },
  { name: "Lorem Ipsum Generator", description: "Paragraphs, sentences & words", href: "/lorem-ipsum", category: "Dev", icon: BookOpenIcon, keywords: ["placeholder", "dummy text", "lipsum"] },
  { name: "Diff Checker", description: "Compare text, JSON & images side by side", href: "/diff-checker", category: "Dev", icon: GitCompare, keywords: ["compare", "difference", "changes"] },
  { name: "Multi-Format Converter", description: "Convert files to Text, Table, JSON & Images at once", href: "/multi-converter", category: "Dev", icon: ArrowRightLeft, keywords: ["convert", "multi format", "text", "json", "csv", "images", "one click"] },
  { name: "CSV Visual Debugger", description: "Find duplicates, empty values & column issues in CSV", href: "/csv-debugger", category: "Dev", icon: Bug, keywords: ["csv", "debugger", "duplicates", "empty", "data problems", "validator"] },
  { name: "Bulk File Renamer", description: "Rename files with date, numbering & pattern rules", href: "/bulk-renamer", category: "Dev", icon: PenLine, keywords: ["rename", "bulk", "batch", "numbering", "date", "pattern"] },
  { name: "Folder Structure Visualizer", description: "Interactive tree view with unused file detection", href: "/folder-visualizer", category: "Dev", icon: FolderTree, keywords: ["folder", "tree", "structure", "visualizer", "project", "directory"] },
  { name: "Smart PDF Cleaner", description: "Auto remove margins, center content & normalize fonts", href: "/pdf-cleaner", category: "PDF", icon: Sparkles, keywords: ["clean pdf", "margins", "readability", "normalize", "center"] },
  { name: "Real Pixel Size Comparator", description: "Actual vs display size, zoom & margin overlays", href: "/pixel-comparator", category: "Image", icon: Ruler, keywords: ["pixel size", "actual size", "display size", "zoom", "margin", "padding"] },
  { name: "Watermark Image", description: "Add custom text or image watermarks to photos", href: "/watermark-image", category: "Image", icon: Droplets, keywords: ["add watermark", "stamp", "brand", "overlay", "logo watermark"] },
  { name: "Blur Face", description: "Blur faces and sensitive areas in photos", href: "/blur-face", category: "Image", icon: EyeOff, keywords: ["anonymize", "face blur", "privacy", "censor", "sensitive area"] },
  { name: "HTML to Image", description: "Render HTML code as a PNG or JPEG image", href: "/html-to-image", category: "Image", icon: Code, keywords: ["html screenshot", "code to image", "render html", "webpage capture"] },
  // PDF — Conversion tools
  { name: "JPG to PDF", description: "Convert JPG or JPEG images to PDF", href: "/jpg-to-pdf", category: "PDF", icon: ArrowRightLeft, keywords: ["jpg to pdf", "jpeg to pdf", "photo to pdf", "image to pdf", "photos pdf"] },
  { name: "JPEG to PDF", description: "Convert JPEG files to PDF document", href: "/jpeg-to-pdf", category: "PDF", icon: ArrowRightLeft, keywords: ["jpeg to pdf", "jpg to pdf", "jpeg pdf"] },
  { name: "PNG to PDF", description: "Convert PNG images to PDF", href: "/png-to-pdf", category: "PDF", icon: ArrowRightLeft, keywords: ["png to pdf", "image to pdf", "png pdf"] },
  { name: "WebP to PDF", description: "Convert WebP images to PDF", href: "/webp-to-pdf", category: "PDF", icon: ArrowRightLeft, keywords: ["webp to pdf", "webp pdf"] },
  { name: "GIF to PDF", description: "Convert GIF images to PDF", href: "/gif-to-pdf", category: "PDF", icon: ArrowRightLeft, keywords: ["gif to pdf"] },
  { name: "BMP to PDF", description: "Convert BMP bitmap to PDF", href: "/bmp-to-pdf", category: "PDF", icon: ArrowRightLeft, keywords: ["bmp to pdf", "bitmap pdf"] },
  { name: "TIFF to PDF", description: "Convert TIFF scanned documents to PDF", href: "/tiff-to-pdf", category: "PDF", icon: ArrowRightLeft, keywords: ["tiff to pdf", "tif pdf", "scanned document"] },
  { name: "AVIF to PDF", description: "Convert AVIF images to PDF", href: "/avif-to-pdf", category: "PDF", icon: ArrowRightLeft, keywords: ["avif to pdf"] },
  { name: "HEIC to PDF", description: "Convert iPhone HEIC photos to PDF", href: "/heic-to-pdf", category: "PDF", icon: ArrowRightLeft, keywords: ["heic to pdf", "iphone photo pdf", "heif pdf"] },
  { name: "SVG to PDF", description: "Convert SVG vector graphics to PDF", href: "/svg-to-pdf", category: "PDF", icon: ArrowRightLeft, keywords: ["svg to pdf", "vector to pdf"] },
  { name: "PDF to PNG", description: "Convert PDF pages to PNG images", href: "/pdf-to-png", category: "PDF", icon: ArrowRightLeft, keywords: ["pdf to png", "pdf to image", "pdf png"] },
  { name: "PDF to WebP", description: "Convert PDF to web-optimized WebP", href: "/pdf-to-webp", category: "PDF", icon: ArrowRightLeft, keywords: ["pdf to webp"] },
  { name: "PDF to GIF", description: "Convert PDF to animated GIF", href: "/pdf-to-gif", category: "PDF", icon: ArrowRightLeft, keywords: ["pdf to gif", "pdf slideshow"] },
  { name: "PDF to AVIF", description: "Convert PDF to AVIF image format", href: "/pdf-to-avif", category: "PDF", icon: ArrowRightLeft, keywords: ["pdf to avif"] },
  { name: "PDF to BMP", description: "Convert PDF pages to BMP format", href: "/pdf-to-bmp", category: "PDF", icon: ArrowRightLeft, keywords: ["pdf to bmp", "pdf bitmap"] },
  { name: "PDF to TIFF", description: "Convert PDF to TIFF for printing", href: "/pdf-to-tiff", category: "PDF", icon: ArrowRightLeft, keywords: ["pdf to tiff", "pdf to tif"] },
  { name: "PDF to SVG", description: "Convert PDF to SVG vector", href: "/pdf-to-svg", category: "PDF", icon: ArrowRightLeft, keywords: ["pdf to svg", "pdf vector"] },
  { name: "PDF to HEIC", description: "PDF to HEIC format guide", href: "/pdf-to-heic", category: "PDF", icon: ArrowRightLeft, keywords: ["pdf to heic", "pdf iphone"] },
  { name: "PDF to CSV", description: "Extract PDF content as CSV", href: "/pdf-to-csv", category: "PDF", icon: ArrowRightLeft, keywords: ["pdf to csv", "pdf to spreadsheet"] },
  { name: "PDF to HTML", description: "Convert PDF to HTML page", href: "/pdf-to-html", category: "PDF", icon: ArrowRightLeft, keywords: ["pdf to html", "pdf to web"] },
  { name: "PDF to JSON", description: "Extract PDF as JSON data", href: "/pdf-to-json", category: "PDF", icon: ArrowRightLeft, keywords: ["pdf to json", "pdf data"] },
  { name: "PDF to Markdown", description: "Convert PDF text to Markdown", href: "/pdf-to-markdown", category: "PDF", icon: ArrowRightLeft, keywords: ["pdf to markdown", "pdf to md"] },
  { name: "PDF to XML", description: "Convert PDF to XML structure", href: "/pdf-to-xml", category: "PDF", icon: ArrowRightLeft, keywords: ["pdf to xml"] },
  { name: "CSV to PDF", description: "Convert CSV data to PDF table", href: "/csv-to-pdf", category: "PDF", icon: ArrowRightLeft, keywords: ["csv to pdf", "spreadsheet to pdf"] },
  { name: "TXT to PDF", description: "Convert plain text to PDF", href: "/txt-to-pdf", category: "PDF", icon: ArrowRightLeft, keywords: ["txt to pdf", "text to pdf", "notepad to pdf"] },
  { name: "Markdown to PDF", description: "Convert Markdown to styled PDF", href: "/markdown-to-pdf", category: "PDF", icon: ArrowRightLeft, keywords: ["markdown to pdf", "md to pdf", "readme pdf"] },
  { name: "JSON to PDF", description: "Convert JSON to PDF document", href: "/json-to-pdf", category: "PDF", icon: ArrowRightLeft, keywords: ["json to pdf"] },
  { name: "XML to PDF", description: "Convert XML file to PDF", href: "/xml-to-pdf", category: "PDF", icon: ArrowRightLeft, keywords: ["xml to pdf"] },
  { name: "Excel to PDF", description: "Convert Excel XLSX to PDF", href: "/excel-to-pdf", category: "PDF", icon: ArrowRightLeft, keywords: ["excel to pdf", "xlsx to pdf", "spreadsheet pdf"] },
  { name: "XLS to PDF", description: "Convert legacy XLS to PDF", href: "/xls-to-pdf", category: "PDF", icon: ArrowRightLeft, keywords: ["xls to pdf", "old excel pdf"] },
  { name: "DOC to PDF", description: "Convert Word DOC to PDF", href: "/doc-to-pdf", category: "PDF", icon: ArrowRightLeft, keywords: ["doc to pdf", "word to pdf", "docx to pdf"] },
  { name: "RTF to PDF", description: "Convert RTF Rich Text to PDF", href: "/rtf-to-pdf", category: "PDF", icon: ArrowRightLeft, keywords: ["rtf to pdf", "rich text pdf"] },
  { name: "EPUB to PDF", description: "Convert EPUB eBook to PDF", href: "/epub-to-pdf", category: "PDF", icon: ArrowRightLeft, keywords: ["epub to pdf", "ebook to pdf"] },
  { name: "ODT to PDF", description: "Convert LibreOffice ODT to PDF", href: "/odt-to-pdf", category: "PDF", icon: ArrowRightLeft, keywords: ["odt to pdf", "libreoffice pdf"] },
  { name: "MOBI to PDF", description: "Convert Kindle MOBI to PDF", href: "/mobi-to-pdf", category: "PDF", icon: ArrowRightLeft, keywords: ["mobi to pdf", "kindle to pdf"] },
  { name: "AZW3 to PDF", description: "Convert AZW3 Kindle format to PDF", href: "/azw3-to-pdf", category: "PDF", icon: ArrowRightLeft, keywords: ["azw3 to pdf", "kindle fire pdf"] },
  { name: "PPT to PDF", description: "Convert PPT to PDF (uses PPTX converter)", href: "/ppt-to-pdf", category: "PDF", icon: ArrowRightLeft, keywords: ["ppt to pdf", "powerpoint to pdf", "slides to pdf"] },
  { name: "PDF to RTF", description: "PDF to RTF format guide", href: "/pdf-to-rtf", category: "PDF", icon: ArrowRightLeft, keywords: ["pdf to rtf", "pdf rich text"] },
  { name: "PDF to ODT", description: "PDF to LibreOffice ODT guide", href: "/pdf-to-odt", category: "PDF", icon: ArrowRightLeft, keywords: ["pdf to odt", "pdf to libreoffice"] },
  { name: "PDF to DOC", description: "PDF to DOC — use PDF to Word", href: "/pdf-to-doc", category: "PDF", icon: ArrowRightLeft, keywords: ["pdf to doc", "pdf word doc"] },
  { name: "PDF to XLS", description: "PDF to XLS — use PDF to Excel", href: "/pdf-to-xls", category: "PDF", icon: ArrowRightLeft, keywords: ["pdf to xls", "pdf to excel xls"] },
  { name: "PDF to PPT", description: "PDF to PowerPoint guide", href: "/pdf-to-ppt", category: "PDF", icon: ArrowRightLeft, keywords: ["pdf to ppt", "pdf to powerpoint"] },
  { name: "PDF to EPUB", description: "PDF to EPUB eBook guide", href: "/pdf-to-epub", category: "PDF", icon: ArrowRightLeft, keywords: ["pdf to epub", "pdf ebook"] },
  { name: "PDF to MOBI", description: "PDF to Kindle MOBI guide", href: "/pdf-to-mobi", category: "PDF", icon: ArrowRightLeft, keywords: ["pdf to mobi", "pdf to kindle"] },
  { name: "PDF to AZW3", description: "PDF to AZW3 Kindle format guide", href: "/pdf-to-azw3", category: "PDF", icon: ArrowRightLeft, keywords: ["pdf to azw3", "pdf kindle fire"] },
  { name: "Business Document Pack", description: "Generate invoices, quotes, receipts, purchase orders", href: "/business-docs", category: "PDF", icon: FileText, keywords: ["invoice", "quote", "receipt", "purchase order", "delivery note", "business document"] },
  { name: "PDF Roast & Quality Score", description: "Get a quality score for your PDF", href: "/pdf-roast", category: "PDF", icon: ScanSearch, keywords: ["pdf quality", "pdf score", "pdf audit", "grade pdf"] },
  { name: "Why Is My PDF So Big?", description: "Diagnose what is making your PDF large", href: "/size-analyzer", category: "PDF", icon: ScanSearch, keywords: ["pdf too big", "pdf size", "bloated pdf", "large pdf", "analyze pdf", "pdf mb"] },
  // Image — Converters
  { name: "PNG to JPG", description: "Convert PNG to JPG with quality control", href: "/png-to-jpg", category: "Image", icon: ArrowRightLeft, keywords: ["png to jpg", "png to jpeg", "convert png", "png jpg"] },
  { name: "PNG to WebP", description: "Convert PNG to WebP — 25-35% smaller", href: "/png-to-webp", category: "Image", icon: ArrowRightLeft, keywords: ["png to webp", "png webp", "convert png webp"] },
  { name: "PNG to GIF", description: "Convert PNG to GIF format", href: "/png-to-gif", category: "Image", icon: ArrowRightLeft, keywords: ["png to gif"] },
  { name: "PNG to ICO", description: "Create ICO favicon from PNG", href: "/png-to-ico", category: "Image", icon: ArrowRightLeft, keywords: ["png to ico", "png favicon", "create favicon", "png to favicon"] },
  { name: "PNG to BMP", description: "Convert PNG to BMP bitmap", href: "/png-to-bmp", category: "Image", icon: ArrowRightLeft, keywords: ["png to bmp", "png bitmap"] },
  { name: "PNG to AVIF", description: "Convert PNG to AVIF next-gen format", href: "/png-to-avif", category: "Image", icon: ArrowRightLeft, keywords: ["png to avif", "png avif"] },
  { name: "PNG to TIFF", description: "Convert PNG to TIFF for print", href: "/png-to-tiff", category: "Image", icon: ArrowRightLeft, keywords: ["png to tiff", "png tiff"] },
  { name: "PNG to HEIC", description: "PNG to HEIC format guide", href: "/png-to-heic", category: "Image", icon: ArrowRightLeft, keywords: ["png to heic"] },
  { name: "JPG to PNG", description: "Convert JPG to lossless PNG", href: "/jpg-to-png", category: "Image", icon: ArrowRightLeft, keywords: ["jpg to png", "jpeg to png", "convert jpg", "jpg png"] },
  { name: "JPG to WebP", description: "Convert JPG to WebP — 25-34% smaller", href: "/jpg-to-webp", category: "Image", icon: ArrowRightLeft, keywords: ["jpg to webp", "jpeg to webp", "jpg webp"] },
  { name: "JPG to GIF", description: "Convert JPG to GIF format", href: "/jpg-to-gif", category: "Image", icon: ArrowRightLeft, keywords: ["jpg to gif", "jpeg gif"] },
  { name: "JPG to SVG", description: "Trace JPG to SVG vector", href: "/jpg-to-svg", category: "Image", icon: ArrowRightLeft, keywords: ["jpg to svg", "jpeg to svg", "jpg vector", "trace jpg"] },
  { name: "JPG to ICO", description: "Create ICO favicon from JPG", href: "/jpg-to-ico", category: "Image", icon: ArrowRightLeft, keywords: ["jpg to ico", "jpg favicon", "jpeg favicon"] },
  { name: "JPG to BMP", description: "Convert JPG to BMP format", href: "/jpg-to-bmp", category: "Image", icon: ArrowRightLeft, keywords: ["jpg to bmp", "jpeg bmp"] },
  { name: "JPG to AVIF", description: "Convert JPG to AVIF format", href: "/jpg-to-avif", category: "Image", icon: ArrowRightLeft, keywords: ["jpg to avif", "jpeg avif"] },
  { name: "JPG to TIFF", description: "Convert JPG to TIFF for print", href: "/jpg-to-tiff", category: "Image", icon: ArrowRightLeft, keywords: ["jpg to tiff", "jpeg tiff"] },
  { name: "JPG to HEIC", description: "JPG to HEIC format guide", href: "/jpg-to-heic", category: "Image", icon: ArrowRightLeft, keywords: ["jpg to heic", "jpeg heic"] },
  { name: "WebP to PNG", description: "Convert WebP to PNG for compatibility", href: "/webp-to-png", category: "Image", icon: ArrowRightLeft, keywords: ["webp to png", "convert webp", "webp png"] },
  { name: "WebP to JPG", description: "Convert WebP to JPG", href: "/webp-to-jpg", category: "Image", icon: ArrowRightLeft, keywords: ["webp to jpg", "webp to jpeg", "webp jpg"] },
  { name: "WebP to GIF", description: "Convert WebP to GIF", href: "/webp-to-gif", category: "Image", icon: ArrowRightLeft, keywords: ["webp to gif", "webp gif"] },
  { name: "WebP to SVG", description: "Trace WebP to SVG vector", href: "/webp-to-svg", category: "Image", icon: ArrowRightLeft, keywords: ["webp to svg", "webp vector"] },
  { name: "WebP to ICO", description: "Create ICO favicon from WebP", href: "/webp-to-ico", category: "Image", icon: ArrowRightLeft, keywords: ["webp to ico", "webp favicon"] },
  { name: "WebP to BMP", description: "Convert WebP to BMP format", href: "/webp-to-bmp", category: "Image", icon: ArrowRightLeft, keywords: ["webp to bmp"] },
  { name: "WebP to TIFF", description: "Convert WebP to TIFF", href: "/webp-to-tiff", category: "Image", icon: ArrowRightLeft, keywords: ["webp to tiff"] },
  { name: "GIF to PNG", description: "Extract GIF frame as PNG", href: "/gif-to-png", category: "Image", icon: ArrowRightLeft, keywords: ["gif to png", "gif png", "extract gif frame"] },
  { name: "GIF to JPG", description: "Convert GIF to JPG", href: "/gif-to-jpg", category: "Image", icon: ArrowRightLeft, keywords: ["gif to jpg", "gif jpeg"] },
  { name: "GIF to WebP", description: "Convert GIF to WebP", href: "/gif-to-webp", category: "Image", icon: ArrowRightLeft, keywords: ["gif to webp"] },
  { name: "BMP to PNG", description: "Convert BMP to PNG — smaller size", href: "/bmp-to-png", category: "Image", icon: ArrowRightLeft, keywords: ["bmp to png", "bitmap to png", "bmp png"] },
  { name: "BMP to JPG", description: "Convert BMP to JPG", href: "/bmp-to-jpg", category: "Image", icon: ArrowRightLeft, keywords: ["bmp to jpg", "bitmap to jpg", "bmp jpg"] },
  { name: "BMP to WebP", description: "Convert BMP to WebP", href: "/bmp-to-webp", category: "Image", icon: ArrowRightLeft, keywords: ["bmp to webp"] },
  { name: "AVIF to PNG", description: "Convert AVIF to PNG", href: "/avif-to-png", category: "Image", icon: ArrowRightLeft, keywords: ["avif to png", "avif png"] },
  { name: "AVIF to JPG", description: "Convert AVIF to JPG", href: "/avif-to-jpg", category: "Image", icon: ArrowRightLeft, keywords: ["avif to jpg", "avif jpeg"] },
  { name: "ICO to PNG", description: "Extract PNG from ICO favicon", href: "/ico-to-png", category: "Image", icon: ArrowRightLeft, keywords: ["ico to png", "favicon to png", "extract favicon"] },
  { name: "ICO to JPG", description: "Convert ICO to JPG", href: "/ico-to-jpg", category: "Image", icon: ArrowRightLeft, keywords: ["ico to jpg", "favicon to jpg"] },
  { name: "ICO to WebP", description: "Convert ICO to WebP", href: "/ico-to-webp", category: "Image", icon: ArrowRightLeft, keywords: ["ico to webp"] },
  { name: "ICO to SVG", description: "Convert ICO to SVG (two-step guide)", href: "/ico-to-svg", category: "Image", icon: ArrowRightLeft, keywords: ["ico to svg", "favicon to svg", "ico vector"] },
  { name: "SVG to ICO", description: "Create ICO favicon from SVG", href: "/svg-to-ico", category: "Image", icon: ArrowRightLeft, keywords: ["svg to ico", "svg favicon", "create favicon svg"] },
  { name: "SVG to PNG", description: "Rasterize SVG to PNG", href: "/svg-to-png", category: "Image", icon: ArrowRightLeft, keywords: ["svg to png", "svg png", "rasterize svg", "export svg"] },
  { name: "SVG to JPG", description: "Convert SVG to JPG", href: "/svg-to-jpg", category: "Image", icon: ArrowRightLeft, keywords: ["svg to jpg", "svg jpeg"] },
  { name: "SVG to WebP", description: "Convert SVG to WebP", href: "/svg-to-webp", category: "Image", icon: ArrowRightLeft, keywords: ["svg to webp"] },
  { name: "PNG to SVG", description: "Trace PNG to SVG vector", href: "/png-to-svg", category: "Image", icon: ArrowRightLeft, keywords: ["png to svg", "png vector", "trace png", "vectorize"] },
  { name: "TIFF to JPG", description: "TIFF to JPG conversion guide", href: "/tiff-to-jpg", category: "Image", icon: ArrowRightLeft, keywords: ["tiff to jpg", "tif to jpg", "tiff jpg"] },
  { name: "TIFF to PNG", description: "TIFF to PNG conversion guide", href: "/tiff-to-png", category: "Image", icon: ArrowRightLeft, keywords: ["tiff to png", "tif png"] },
  { name: "TIFF to WebP", description: "TIFF to WebP conversion guide", href: "/tiff-to-webp", category: "Image", icon: ArrowRightLeft, keywords: ["tiff to webp"] },
  { name: "HEIC to PNG", description: "Convert HEIC to PNG", href: "/heic-to-png", category: "Image", icon: ArrowRightLeft, keywords: ["heic to png", "iphone photo png", "heif png"] },
  { name: "HEIC to WebP", description: "Convert HEIC to WebP", href: "/heic-to-webp", category: "Image", icon: ArrowRightLeft, keywords: ["heic to webp", "heif webp"] },
  { name: "Passport & Visa Photo", description: "Passport and visa photos for 60+ countries", href: "/passport-photo", category: "Image", icon: Camera, keywords: ["passport photo", "visa photo", "id photo", "passport size", "passport requirements", "us passport", "uk passport", "300dpi", "biometric photo"] },
  { name: "Compress to Exact Size", description: "Compress image to exact KB or MB target", href: "/compress-to-size", category: "Image", icon: FileDown, keywords: ["exact size", "compress to kb", "target size", "passport photo size", "specific file size"] },
  { name: "Screenshot to Table", description: "Extract tables from screenshots into CSV", href: "/screenshot-to-table", category: "Image", icon: Table2, keywords: ["screenshot table", "image to table", "table from screenshot", "ocr table"] },
  { name: "Image Size Analyzer", description: "Diagnose what's making images large", href: "/size-analyzer", category: "Image", icon: ScanSearch, keywords: ["image too big", "image size", "analyze image", "file size breakdown", "image bloat"] },
  { name: "Image Roast & Quality Score", description: "Get a quality score for any image", href: "/image-roast", category: "Image", icon: ScanSearch, keywords: ["image quality", "image score", "roast image", "quality check", "image audit"] },
  { name: "AI Image Detector", description: "Detect if an image is AI-generated", href: "/ai-detector", category: "Image", icon: Eye, keywords: ["ai generated", "detect ai", "fake image", "real or ai", "ai photo detector", "artificial image"] },
  { name: "Print & Frame Calculator", description: "Check if photo will print at any size", href: "/print-calculator", category: "Image", icon: Ruler, keywords: ["print size", "dpi", "print quality", "photo print", "8x10", "a4 print", "frame size"] },
  // Image — Bulk tools
  { name: "Bulk Image Compressor", description: "Compress many images at once and download as ZIP", href: "/bulk-image-compressor", category: "Image", icon: Layers, keywords: ["bulk compress", "batch compress", "compress multiple images", "mass compress", "zip images", "compress photos bulk"] },
  { name: "Bulk Image Resizer", description: "Resize multiple images in batch — ZIP download", href: "/bulk-image-resizer", category: "Image", icon: Layers, keywords: ["bulk resize", "batch resize", "resize multiple", "mass resize", "bulk image resize", "multiple photos resize"] },
  { name: "Bulk Image Converter", description: "Convert multiple images to WebP in batch", href: "/bulk-image-converter", category: "Image", icon: Layers, keywords: ["bulk convert", "batch convert", "convert multiple images", "mass convert", "bulk webp"] },
  { name: "Bulk Background Remover", description: "Remove backgrounds from multiple images", href: "/bulk-background-remover", category: "Image", icon: Layers, keywords: ["bulk remove bg", "batch background remove", "multiple bg remove", "mass cutout"] },
  { name: "Bulk Watermark Adder", description: "Add watermarks to multiple images at once", href: "/bulk-watermark-adder", category: "Image", icon: Layers, keywords: ["bulk watermark", "batch watermark", "add watermark multiple", "mass watermark"] },
  { name: "Bulk PNG to JPG", description: "Batch convert PNG files to JPG", href: "/bulk-png-to-jpg", category: "Image", icon: Layers, keywords: ["bulk png to jpg", "batch png jpg", "multiple png to jpg", "mass convert png"] },
  { name: "Bulk PNG to WebP", description: "Batch convert PNG to WebP", href: "/bulk-png-to-webp", category: "Image", icon: Layers, keywords: ["bulk png to webp", "batch png webp"] },
  { name: "Bulk PNG to GIF", description: "Batch convert PNG to GIF", href: "/bulk-png-to-gif", category: "Image", icon: Layers, keywords: ["bulk png to gif", "batch png gif"] },
  { name: "Bulk JPG to PNG", description: "Batch convert JPG to PNG", href: "/bulk-jpg-to-png", category: "Image", icon: Layers, keywords: ["bulk jpg to png", "batch jpg png"] },
  { name: "Bulk JPG to WebP", description: "Batch convert JPG to WebP", href: "/bulk-jpg-to-webp", category: "Image", icon: Layers, keywords: ["bulk jpg to webp", "batch jpg webp"] },
  { name: "Bulk WebP to PNG", description: "Batch convert WebP to PNG", href: "/bulk-webp-to-png", category: "Image", icon: Layers, keywords: ["bulk webp to png", "batch webp png"] },
  // Image — Product tools
  { name: "Amazon Image Resizer", description: "Resize product photos to Amazon 1000×1000", href: "/amazon-image-resizer", category: "Image", icon: ArrowRightLeft, keywords: ["amazon product photo", "amazon image", "1000x1000", "amazon seller", "product listing image", "amazon resize"] },
  { name: "Shopify Image Optimizer", description: "Optimize images for Shopify — 2048×2048", href: "/shopify-image-optimizer", category: "Image", icon: ArrowRightLeft, keywords: ["shopify image", "shopify product photo", "shopify store", "2048", "shopify optimize", "shopify seller"] },
  { name: "Etsy Image Resizer", description: "Resize product photos for Etsy listings", href: "/etsy-image-resizer", category: "Image", icon: ArrowRightLeft, keywords: ["etsy image", "etsy product photo", "etsy listing", "etsy seller", "etsy resize"] },
  { name: "Product Image Resizer", description: "Resize product photos with Amazon/Shopify/Etsy presets", href: "/product-image-resizer", category: "Image", icon: ArrowRightLeft, keywords: ["product photo", "ecommerce image", "product resize", "product photo size", "marketplace image"] },
  { name: "Product Photo Optimizer", description: "Batch optimize product photos — JPG output", href: "/product-photo-optimizer", category: "Image", icon: ArrowRightLeft, keywords: ["product photo optimize", "compress product photo", "ecommerce photo", "batch product optimize"] },
  { name: "Product Background Remover", description: "Remove backgrounds from product photos", href: "/product-background-remover", category: "Image", icon: Eraser, keywords: ["product background", "white background product", "product cutout", "ecommerce white bg", "product remove background"] },
  // Image — OCR / text tools
  { name: "Screenshot to Text", description: "Extract text from screenshots using OCR", href: "/screenshot-to-text", category: "Image", icon: FileText, keywords: ["screenshot to text", "copy text from screenshot", "screenshot ocr", "screen text", "screen grab text", "copy text image"] },
  { name: "Handwriting to Text", description: "Convert handwritten notes to digital text", href: "/handwriting-to-text", category: "Image", icon: FileText, keywords: ["handwriting", "handwritten", "notes to text", "handwriting ocr", "convert handwriting", "digitize notes"] },
  { name: "Receipt Scanner", description: "Scan receipts and extract totals and items", href: "/receipt-scanner", category: "Image", icon: Receipt, keywords: ["receipt", "scan receipt", "receipt ocr", "expense", "total amount", "itemized receipt", "scan bill"] },
  { name: "Business Card Scanner", description: "Scan business cards and extract contacts", href: "/business-card-scanner", category: "Image", icon: FileText, keywords: ["business card", "scan card", "contact extraction", "vcard", "name email phone", "card scanner"] },
  { name: "Table Extraction from Image", description: "Extract tables from images into CSV", href: "/table-extraction-from-image", category: "Image", icon: Table2, keywords: ["table from image", "image to table", "extract table", "photo table", "picture to csv", "tabular data image"] },
  // Dev — Missing tools
  { name: "Resume Builder", description: "Build ATS-optimized resumes with 20+ templates", href: "/resume-builder", category: "Dev", icon: FileText, keywords: ["resume", "cv", "job application", "ats", "resume template", "curriculum vitae", "work history", "professional resume"] },
  { name: "JSON to PPTX", description: "Convert JSON to PowerPoint presentation", href: "/json-to-pptx", category: "Dev", icon: ArrowRightLeft, keywords: ["json to pptx", "json to powerpoint", "create presentation", "pptx from json", "slides from json"] },
  { name: "JS to PPTX", description: "Write JavaScript to generate PPTX files", href: "/js-to-pptx", category: "Dev", icon: ArrowRightLeft, keywords: ["js to pptx", "javascript pptx", "pptxgenjs", "code powerpoint", "generate presentation code"] },
  { name: "Word to PDF", description: "Convert Word DOCX to PDF in browser", href: "/word-to-pdf", category: "Dev", icon: ArrowRightLeft, keywords: ["word to pdf", "docx to pdf", "convert word", "microsoft word pdf", "word document pdf"] },
  { name: "Website Trust Checker", description: "Check SSL, security headers & generate trust score for any URL", href: "/website-trust-checker", category: "Dev", icon: ShieldCheck, keywords: ["website trust", "ssl checker", "security headers", "is site safe", "trust score", "website legitimacy", "website safety", "https checker", "check website"] },
  { name: "Website Content Extractor", description: "Extract clean article text from any URL — export as Markdown", href: "/website-content-extractor", category: "Dev", icon: BookOpen, keywords: ["content extractor", "article extractor", "url to text", "url to markdown", "clean article", "extract text url", "webpage text", "reader mode", "mercury reader"] },
];

const categoryColors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  PDF: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200", icon: "bg-red-100 text-red-600" },
  Image: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", icon: "bg-amber-100 text-amber-600" },
  Dev: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", icon: "bg-blue-100 text-blue-600" },
};

// ─── Fuzzy search ─────────────────────────────────────────
function fuzzyMatch(query: string, tool: Tool): number {
  const q = query.toLowerCase().trim();
  if (!q) return 1;

  const nameLower = tool.name.toLowerCase();
  const descLower = tool.description.toLowerCase();
  const kwLower = tool.keywords.join(" ").toLowerCase();
  const haystack = `${nameLower} ${descLower} ${kwLower}`;

  // Exact prefix match on name — highest score
  if (nameLower.startsWith(q)) return 100;
  if (nameLower.includes(q)) return 90;
  if (haystack.includes(q)) return 80;

  // Fuzzy: each char must appear in order
  let qi = 0;
  let score = 0;
  let lastMatchIdx = -1;
  for (let hi = 0; hi < haystack.length && qi < q.length; hi++) {
    if (haystack[hi] === q[qi]) {
      score += qi === 0 ? 15 : 10;
      // Bonus for consecutive chars
      if (lastMatchIdx === hi - 1) score += 5;
      lastMatchIdx = hi;
      qi++;
    }
  }

  return qi === q.length ? score : 0;
}

// ─── Component ────────────────────────────────────────────
interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter & sort tools by relevance
  const filtered = useMemo(() => {
    if (!query.trim()) return tools;
    return tools
      .map((tool) => ({ tool, score: fuzzyMatch(query, tool) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.tool);
  }, [query]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: { category: string; tools: Tool[] }[] = [];
    const order = ["PDF", "Image", "Dev"];
    for (const cat of order) {
      const catTools = filtered.filter((t) => t.category === cat);
      if (catTools.length > 0) groups.push({ category: cat, tools: catTools });
    }
    return groups;
  }, [filtered]);

  // Flat list for keyboard navigation (memoized to avoid recreating handleKeyDown)
  const flatList = useMemo(() => grouped.flatMap((g) => g.tools), [grouped]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      // Small delay for animation to start
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [open]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.querySelector('[data-selected="true"]');
      selected?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  // Navigate to tool
  const navigate = useCallback(
    (tool: Tool) => {
      onClose();
      router.push(tool.href);
    },
    [router, onClose]
  );

  // Keyboard navigation (with focus trap)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, flatList.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (flatList[selectedIndex]) {
          navigate(flatList[selectedIndex]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Tab") {
        // Focus trap: keep focus inside the dialog
        e.preventDefault();
        inputRef.current?.focus();
      }
    },
    [flatList, selectedIndex, navigate, onClose]
  );

  // Global click to close
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="search-overlay" onClick={handleOverlayClick}>
      <div
        className="search-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Search tools"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="search-input-row">
          <Search className="w-5 h-5 text-foreground-muted flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools... (e.g. compress pdf, remove background)"
            className="search-input"
            role="combobox"
            aria-expanded={flatList.length > 0}
            aria-label="Search tools"
            aria-controls="search-results-list"
            aria-activedescendant={flatList[selectedIndex] ? `search-item-${selectedIndex}` : undefined}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="search-kbd">esc</kbd>
        </div>

        {/* Divider */}
        <div className="search-divider" />

        {/* Results */}
        <div className="search-results" ref={listRef} role="listbox" id="search-results-list">
          {flatList.length === 0 ? (
            <div className="search-empty">
              <Search className="w-8 h-8 text-foreground-muted mb-2" />
              <p className="text-foreground-secondary font-medium">No tools found</p>
              <p className="text-foreground-muted text-sm">Try a different search term</p>
            </div>
          ) : (
            grouped.map((group) => {
              const colors = categoryColors[group.category];
              return (
                <div key={group.category}>
                  <div className="search-group-header">
                    <span className={`search-category-badge ${colors.bg} ${colors.text} ${colors.border}`}>
                      {group.category}
                    </span>
                    <span className="text-foreground-muted text-xs">{group.tools.length}</span>
                  </div>
                  {group.tools.map((tool) => {
                    const flatIndex = flatList.indexOf(tool);
                    const isSelected = flatIndex === selectedIndex;
                    const Icon = tool.icon;
                    return (
                      <button
                        key={tool.href}
                        id={`search-item-${flatIndex}`}
                        data-selected={isSelected}
                        role="option"
                        aria-selected={isSelected}
                        className={`search-item ${isSelected ? "search-item-active" : ""}`}
                        onClick={() => navigate(tool)}
                        onMouseEnter={() => setSelectedIndex(flatIndex)}
                      >
                        <div className={`search-item-icon ${colors.icon}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="search-item-content">
                          <span className="search-item-name">{tool.name}</span>
                          <span className="search-item-desc">{tool.description}</span>
                        </div>
                        {isSelected && (
                          <div className="search-item-enter">
                            <CornerDownLeft className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="search-footer">
          <div className="search-footer-item">
            <kbd className="search-footer-kbd"><ArrowUp className="w-3 h-3" /></kbd>
            <kbd className="search-footer-kbd"><ArrowDown className="w-3 h-3" /></kbd>
            <span>Navigate</span>
          </div>
          <div className="search-footer-item">
            <kbd className="search-footer-kbd">↵</kbd>
            <span>Open</span>
          </div>
          <div className="search-footer-item">
            <kbd className="search-footer-kbd">esc</kbd>
            <span>Close</span>
          </div>
          <div className="search-footer-item">
            <kbd className="search-footer-kbd">⌘K</kbd>
            <span>Toggle</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Hook: Global keyboard shortcut ──────────────────────
export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  const openPalette = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      // "/" to open (if not typing in an input)
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return { open, openPalette, close };
}
