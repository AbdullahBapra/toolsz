import type { Metadata } from "next";
import { getToolSeoContent } from "./seo-content";

export const SITE_URL = "https://www.toolsz.co";
export const SITE_NAME = "Toolsz";

interface ToolMeta {
  title: string;
  description: string;
  keywords: string[];
  category: "pdf" | "image" | "dev";
  /** Rich hero description for the tool page — keyword-dense, USP-focused */
  heroDescription: string;
  /** Short description for card/link previews on category pages */
  cardDescription: string;
}

const toolMetadataMap: Record<string, ToolMeta> = {
  // ─── PDF Tools ─────────────────────────────────────────
  "compress-pdf": {
    title: "Compress PDF Free | Reduce File Size Without Quality Loss",
    description:
      "Reduce PDF file size online for free. Same quality, smaller file. No watermarks, no signup. Your files never leave your browser.",
    keywords: ["compress pdf", "reduce pdf size", "pdf compression online", "shrink pdf", "optimize pdf", "make pdf smaller", "compress pdf free", "pdf file size reducer", "compress pdf without losing quality", "pdf compressor online", "web optimize pdf", "smallpdf alternative", "ilovepdf alternative", "pdf24 alternative"],
    category: "pdf",
    heroDescription: "Reduce PDF file size without losing visual quality. Runs entirely in your browser so there are no slow uploads, no watermarks, and complete privacy for sensitive documents.",
    cardDescription: "Reduce PDF file size while keeping text crisp and images sharp.",
  },
  "pdf-to-jpg": {
    title: "PDF to JPG Converter Free | Extract PDF Pages as Images",
    description:
      "Convert PDF pages to high-quality JPG images online for free. Download individually or as a ZIP. No watermarks, no signup, 100% private.",
    keywords: ["pdf to jpg", "convert pdf to jpg", "pdf pages to images", "extract images from pdf", "pdf to image converter", "pdf to jpeg", "pdf to jpg free", "convert pdf pages to jpg", "export pdf as jpg", "pdf to jpg ilovepdf", "pdf to images online free"],
    category: "pdf",
    heroDescription: "Convert every page of your PDF into a high-quality JPG image — free, instant, and completely private. No server uploads, no watermarks, no account required.",
    cardDescription: "Extract crisp JPG images from each page of your PDF document.",
  },
  "merge-pdf": {
    title: "Merge PDF Free | Combine Multiple PDFs Into One",
    description:
      "Merge multiple PDF files into one document online for free. Drag and drop to reorder. No file limits, no watermarks, no signup.",
    keywords: ["merge pdf", "combine pdf", "join pdf files", "pdf merger", "merge pdf online free", "combine pdf files", "pdf combiner free", "merge pdfs without watermark", "merge pdf documents", "pdf merger online", "ilovepdf merge", "smallpdf merge pdf", "combine pdfs in order"],
    category: "pdf",
    heroDescription: "Combine multiple PDF documents into one unified file — free, fast, and private. Drag and drop to reorder pages before merging. No account, no watermarks, no server uploads.",
    cardDescription: "Combine multiple PDFs into a single, unified document.",
  },
  "pdf-to-text": {
    title: "PDF to Text Extractor Free | Copy Text from PDF",
    description:
      "Extract text from PDF files online for free. Copy or save raw plaintext from any PDF instantly. No signup, no watermarks, 100% private.",
    keywords: ["pdf to text", "extract text from pdf", "pdf text extractor", "copy text from pdf", "convert pdf to text", "pdf to plain text", "extract text from pdf online", "pdf text copy online", "pdf to txt free"],
    category: "pdf",
    heroDescription: "Extract raw text from any PDF for copying or saving — free, instant, and fully private. Works with scanned and native PDFs right in your browser.",
    cardDescription: "Extract raw plaintext from any PDF for copying or saving.",
  },
  "pdf-to-data": {
    title: "PDF to JSON and CSV Free | Extract Structured Data",
    description:
      "Convert PDF content into structured JSON or CSV data online for free. Smart parsing preserves tables and structure. No signup, 100% private.",
    keywords: ["pdf to json", "pdf to csv", "pdf data extraction", "convert pdf to data", "extract data from pdf", "pdf table to csv"],
    category: "pdf",
    heroDescription: "Transform PDF content into structured JSON or CSV data — free, instant, and private. Smart parsing preserves tables and document structure without uploading anything to a server.",
    cardDescription: "Transform PDF content into structured JSON or CSV output.",
  },
  "highlight-extractor": {
    title: "PDF Highlight Extractor Free | Pull Annotated Text",
    description:
      "Extract highlighted, underlined, and strikethrough text from PDFs online for free. Export as text, Markdown, or JSON. No signup — 100% client-side and private.",
    keywords: ["pdf highlight extractor", "extract highlights pdf", "pdf annotations", "pdf markup extraction", "pull highlighted text pdf"],
    category: "pdf",
    heroDescription: "Pull out all highlighted, underlined, and strikethrough text from your PDF — free, instant, and private. Export as plain text, Markdown, or JSON.",
    cardDescription: "Pull out all annotated, highlighted text seamlessly.",
  },
  "pdf-editor": {
    title: "Free PDF Editor Online | Draw, Highlight and Add Text",
    description:
      "Edit PDF files online for free. Draw, highlight, add text, erase, and annotate directly on PDF pages. No signup, no watermarks, 100% private.",
    keywords: ["pdf editor", "edit pdf online free", "annotate pdf", "draw on pdf", "pdf markup", "free pdf editor", "add text to pdf", "pdf editor no watermark", "edit pdf without software", "pdf annotator online", "ilovepdf edit", "online pdf editor no signup"],
    category: "pdf",
    heroDescription: "Draw, highlight, add text, and erase directly on your PDF pages — free and fully private. A full-featured browser-based editor with no account and no watermarks.",
    cardDescription: "Draw, highlight, add text, and erase directly on PDF pages.",
  },
  "flipbook-pdf": {
    title: "PDF Flipbook Viewer Free | 3D Page Turn Reader",
    description:
      "Read any PDF as an interactive 3D flipbook with realistic page-turn animations. Free, no signup. A reading experience no other PDF tool offers.",
    keywords: ["pdf flipbook", "flipbook viewer", "3d pdf reader", "page turn animation pdf", "pdf flipbook maker"],
    category: "pdf",
    heroDescription: "Read any PDF as an interactive 3D flipbook with realistic page-turn animations — free, instant, and private. A reading experience no other PDF tool offers.",
    cardDescription: "Read any PDF as an interactive 3D flipbook with page-turn animations.",
  },
  "split-pdf": {
    title: "Split PDF Free | Divide by Page Ranges or Extract Pages",
    description:
      "Split a PDF by page ranges, every N pages, or extract specific pages. Free, instant, private. No signup, no watermarks, 100% client-side.",
    keywords: ["split pdf", "divide pdf", "extract pdf pages", "separate pdf pages", "split pdf online free", "pdf page extractor", "pdf splitter free", "extract pages from pdf", "pdf splitter online", "ilovepdf split pdf", "smallpdf split", "separate one page from pdf", "split pdf by page range"],
    category: "pdf",
    heroDescription: "Split a PDF into multiple smaller files by page ranges, every N pages, or extract specific pages — free, instant, and private. No account required.",
    cardDescription: "Split a PDF into multiple files by ranges, every N pages, or extract pages.",
  },
  "rotate-pdf": {
    title: "Rotate PDF Pages Free | Individual or All Pages",
    description:
      "Rotate PDF pages online for free. Clockwise, counterclockwise, or 180 degrees. No signup, no watermarks, 100% private.",
    keywords: ["rotate pdf", "rotate pdf pages", "change pdf orientation", "pdf page rotation", "rotate pdf online free", "rotate pdf clockwise", "rotate pdf counterclockwise", "ilovepdf rotate", "flip pdf pages online", "turn pdf pages"],
    category: "pdf",
    heroDescription: "Rotate individual or all PDF pages clockwise, counter-clockwise, or 180° — free, instant, and private. Works on any page without changing the rest.",
    cardDescription: "Rotate individual or all pages clockwise, counter-clockwise, or 180°.",
  },
  "watermark-pdf": {
    title: "Watermark PDF Free | Add Custom Text Watermarks",
    description:
      "Add custom text watermarks to your PDF online for free. Adjust size, color, opacity, and rotation. No signup, no output watermarks.",
    keywords: ["watermark pdf", "add watermark pdf", "pdf watermark tool", "stamp pdf", "add text watermark pdf", "watermark pdf free", "pdf watermark online", "add logo to pdf free", "ilovepdf watermark", "stamp text on pdf"],
    category: "pdf",
    heroDescription: "Add custom text watermarks to your PDF with adjustable size, color, opacity, and rotation — free and private. Your original content stays intact with no added watermarks from us.",
    cardDescription: "Add custom text watermarks with adjustable size, color, opacity, and rotation.",
  },
  "redact-pdf": {
    title: "Redact PDF Free | Permanently Remove Sensitive Content",
    description:
      "Permanently redact sensitive information from PDFs by drawing black rectangles. True permanent redaction, not just an overlay. Free, private, no signup.",
    keywords: ["redact pdf", "pdf redaction", "black out pdf text", "censor pdf", "hide pdf text", "redact pdf free", "redact sensitive information pdf", "pdf24 redact", "remove text from pdf permanently", "pdf blackout tool"],
    category: "pdf",
    heroDescription: "Permanently black out sensitive information from your PDF — true redaction, not just a visual overlay. Free, instant, and completely private. No other free tool does this properly.",
    cardDescription: "Black out sensitive info by drawing rectangles — true permanent redaction.",
  },
  "pdf-diff": {
    title: "PDF Diff Free | Compare Two PDFs Side by Side",
    description:
      "Compare two PDFs side by side with visual and line-by-line text diff highlighting. Spot every change instantly. Free, private, no signup.",
    keywords: ["pdf diff", "compare pdf", "pdf comparison", "pdf difference checker", "compare two pdf files", "compare pdf documents online", "pdf compare tool free", "spot pdf changes", "pdf version comparison", "ilovepdf compare pdf"],
    category: "pdf",
    heroDescription: "Compare two PDFs side by side with visual and line-by-line text diff highlighting — free and private. Spot every change instantly without uploading files to any server.",
    cardDescription: "Compare two PDFs side by side with visual and text diff highlighting.",
  },
  "pdf-form-filler": {
    title: "PDF Form Filler Free | Fill PDF Forms Without Adobe",
    description:
      "Fill PDF form fields online for free — text boxes, checkboxes, dropdowns. No Adobe account needed. No signup, no watermarks — 100% client-side and private.",
    keywords: ["pdf form filler", "fill pdf forms", "complete pdf forms online", "pdf form fields", "fill pdf without adobe"],
    category: "pdf",
    heroDescription: "Fill PDF form fields — text, checkboxes, dropdowns — no Adobe account needed. Free, instant, and completely private. Works with any fillable PDF form.",
    cardDescription: "Fill PDF form fields — text, checkboxes, dropdowns — no Adobe needed.",
  },
  "html-to-pdf": {
    title: "HTML to PDF Converter Free | Convert HTML Instantly",
    description:
      "Convert HTML markup to a clean PDF online for free. Customize page size, margins, and quality. No watermarks on output — 100% client-side, no signup.",
    keywords: ["html to pdf", "convert html to pdf", "html pdf converter", "webpage to pdf", "html to pdf free", "url to pdf converter", "webpage to pdf online", "html to pdf no signup", "ilovepdf html to pdf", "web page to pdf"],
    category: "pdf",
    heroDescription: "Convert HTML markup to a clean PDF — free, instant, and private. Customize page size, margins, and quality with no watermarks on your output.",
    cardDescription: "Convert HTML markup to a clean PDF with customizable page settings.",
  },
  "invoice-generator": {
    title: "Free Invoice Generator | Professional PDF Invoices",
    description:
      "Create professional PDF invoices online for free. No watermark, no signup. Add line items, tax, notes, and your logo. Instant download, 100% client-side.",
    keywords: ["invoice generator", "create invoice pdf", "free invoice maker", "pdf invoice template", "invoice generator free", "free invoice template", "invoice maker online", "create invoice online free", "small business invoice free", "professional invoice template", "unlimited invoices free", "credit note template free", "quote template free", "invoice generator trusted", "generate invoices no signup"],
    category: "pdf",
    heroDescription: "Create professional PDF invoices — free, no watermark, no signup. Add line items, tax, notes, and your logo. Everything runs in your browser with instant download.",
    cardDescription: "Create professional PDF invoices — no watermark, no signup required.",
  },
  "sign-pdf": {
    title: "Sign PDF Free | Add Your Signature to Any Document",
    description:
      "Sign PDF documents online for free. Draw, type, or upload your signature and place it on any page. Unlimited, no account, no watermarks — 100% private.",
    keywords: ["sign pdf", "add signature pdf", "pdf signature", "esign pdf", "digital signature pdf", "sign pdf free", "electronic signature pdf", "sign document online free", "pdf signer no signup", "ilovepdf sign pdf", "draw signature on pdf", "type signature pdf"],
    category: "pdf",
    heroDescription: "Draw, type, or upload your signature and place it on any PDF page — free, unlimited, and no account needed. Completely private with no watermarks on your signed document.",
    cardDescription: "Draw, type, or upload your signature and place it on any PDF page.",
  },
  "pptx-to-pdf": {
    title: "PPTX to PDF Converter Free | Convert PowerPoint to PDF",
    description:
      "Convert PowerPoint presentations to PDF online for free. Client-side processing preserves layout perfectly — no uploads, no signup, no watermarks.",
    keywords: ["pptx to pdf", "powerpoint to pdf", "convert pptx pdf", "presentation to pdf", "pptx to pdf free"],
    category: "pdf",
    heroDescription: "Convert PowerPoint presentations to PDF — free, client-side, and private. Layout is preserved perfectly without uploading your presentation to any server.",
    cardDescription: "Convert PowerPoint presentations to PDF — client-side, preserves layout.",
  },
  "unlock-pdf": {
    title: "Unlock PDF Free | Remove Password Protection Instantly",
    description:
      "Remove PDF password protection online for free. Instant, no signup, works on encrypted PDFs. All processing stays in your browser — 100% private.",
    keywords: ["unlock pdf", "remove pdf password", "decrypt pdf", "pdf password remover", "unlock pdf free", "remove pdf password free", "decrypt pdf online", "ilovepdf unlock pdf", "open locked pdf free", "pdf password recovery"],
    category: "pdf",
    heroDescription: "Remove PDF password protection — free, instant, and no signup. Works on encrypted PDFs right in your browser. Your files never leave your device.",
    cardDescription: "Remove PDF password protection — free, instant, no signup required.",
  },
  "protect-pdf": {
    title: "Protect PDF Free | Add Password Encryption Online",
    description:
      "Add password encryption to any PDF online for free. Set user and owner passwords for access control. No signup — 100% client-side and private.",
    keywords: ["protect pdf", "encrypt pdf", "add pdf password", "secure pdf", "pdf encryption", "password protect pdf free", "lock pdf file", "set pdf password free", "pdf security online", "ilovepdf protect pdf", "secure pdf without adobe"],
    category: "pdf",
    heroDescription: "Add password encryption to any PDF — set user and owner passwords for access control. Free, private, and everything runs locally in your browser.",
    cardDescription: "Add password encryption to any PDF — set user & owner passwords.",
  },
  "organize-pdf": {
    title: "Organize PDF Pages Free | Reorder, Delete and Duplicate",
    description:
      "Reorder, delete, and duplicate PDF pages with a drag-and-drop interface — free, instant, and private. Easy page management, no signup, 100% client-side.",
    keywords: ["organize pdf", "reorder pdf pages", "delete pdf pages", "pdf page manager", "rearrange pdf pages"],
    category: "pdf",
    heroDescription: "Reorder, delete, and duplicate PDF pages with a drag-and-drop interface — free, instant, and private. Manage your document structure without uploading to any server.",
    cardDescription: "Reorder, delete, and duplicate pages with drag & drop ease.",
  },
  "page-numbers": {
    title: "Add Page Numbers to PDF Free | Custom Placement",
    description:
      "Insert page numbers in any position and format — bottom-center, top-right, custom start page. Free, instant, and private. No signup, 100% client-side.",
    keywords: ["add page numbers pdf", "pdf page numbers", "number pdf pages", "paginate pdf", "add page numbers pdf free"],
    category: "pdf",
    heroDescription: "Insert page numbers in any position and format — bottom-center, top-right, or custom start page. Free, instant, and completely private.",
    cardDescription: "Insert page numbers in any position & format — customizable placement.",
  },
  "crop-pdf": {
    title: "Crop PDF Free | Trim Page Margins and White Space",
    description:
      "Trim PDF page margins — crop top, bottom, left, right in pt, mm, or inches. Free, instant, and private. No signup, 100% client-side processing.",
    keywords: ["crop pdf", "trim pdf margins", "pdf page crop", "reduce pdf margins", "remove white space pdf"],
    category: "pdf",
    heroDescription: "Trim PDF page margins and white space — crop top, bottom, left, right in pt, mm, or inches. Free, instant, and completely private.",
    cardDescription: "Trim PDF page margins — crop top, bottom, left, right precisely.",
  },
  "flatten-pdf": {
    title: "Flatten PDF Free | Merge Form Fields and Annotations",
    description:
      "Flatten form fields, annotations, and layers into a static, non-editable PDF — free, instant, and private. No signup, 100% client-side.",
    keywords: ["flatten pdf", "pdf flattening", "remove form fields pdf", "static pdf", "flatten pdf free"],
    category: "pdf",
    heroDescription: "Flatten form fields, annotations, and layers into a static PDF — permanent and non-editable. Free, instant, and completely private.",
    cardDescription: "Flatten form fields and annotations into a static, non-editable PDF.",
  },
  "extract-images-pdf": {
    title: "Extract Images from PDF Free | Download Embedded Images",
    description:
      "Pull out all embedded images from a PDF — download individually or as ZIP. Free, client-side, no signup. No watermarks, 100% private processing.",
    keywords: ["extract images pdf", "pdf image extractor", "get images from pdf", "pull images pdf", "extract images from pdf free"],
    category: "pdf",
    heroDescription: "Pull out all embedded images from a PDF — download individually or as a ZIP. Free, instant, and completely private. No server uploads required.",
    cardDescription: "Pull out all embedded images — download individually or as ZIP.",
  },
  "pdf-ocr": {
    title: "PDF OCR Free | Make Scanned PDFs Searchable Online",
    description:
      "Make scanned PDFs searchable by adding an invisible text layer using Tesseract OCR. Premium elsewhere, completely free here. No signup — 100% client-side.",
    keywords: ["pdf ocr", "ocr pdf", "make pdf searchable", "tesseract ocr pdf", "scan to text", "ocr pdf free", "searchable pdf online free", "ocr scanned pdf", "scan to searchable pdf", "pdf text recognition", "ilovepdf ocr pdf"],
    category: "pdf",
    heroDescription: "Make scanned PDFs searchable by adding an invisible text layer using Tesseract OCR. A premium feature elsewhere — completely free here. No signup, 100% client-side.",
    cardDescription: "Make scanned PDFs searchable — Tesseract OCR, free here.",
  },
  "pdf-to-word": {
    title: "PDF to Word Converter Free | Convert PDF to Editable DOCX",
    description:
      "Convert PDF to editable DOCX online for free. Extract text and structure — premium elsewhere, free here. Client-side, no signup, no watermarks.",
    keywords: ["pdf to word", "convert pdf to docx", "pdf to docx", "pdf word converter", "pdf to word free", "convert pdf to editable word", "ilovepdf pdf to word", "smallpdf pdf to word", "pdf to doc online free", "extract text from pdf to word"],
    category: "pdf",
    heroDescription: "Convert PDF to editable DOCX — extract text and structure without uploading to a server. A premium feature elsewhere — completely free here.",
    cardDescription: "Convert PDF to editable DOCX — free & client-side. Premium elsewhere.",
  },
  "pdf-to-excel": {
    title: "PDF to Excel Converter Free | Convert PDF Tables to XLSX",
    description:
      "Convert PDF tables to XLSX with smart row grouping online for free. Premium elsewhere, free here. Client-side, no signup, no watermarks.",
    keywords: ["pdf to excel", "convert pdf to xlsx", "pdf table extraction", "pdf to spreadsheet", "pdf to excel free", "pdf to xls online free", "extract tables from pdf", "ilovepdf pdf to excel", "smallpdf pdf to excel", "convert pdf tables to excel"],
    category: "pdf",
    heroDescription: "Convert PDF tables to XLSX with smart row grouping — free, client-side, and private. A premium feature elsewhere — completely free here.",
    cardDescription: "Convert PDF tables to XLSX — smart row grouping, free & client-side.",
  },

  // ─── Image Tools ───────────────────────────────────────
  "compress-image": {
    title: "Compress Image Free | Reduce Photo Size Without Quality Loss",
    description:
      "Compress images online for free. Reduce JPG, PNG, WebP file size while keeping visual quality sharp. No watermarks, no signup, 100% client-side.",
    keywords: ["compress image", "reduce image size", "image compression online", "shrink image", "optimize image", "compress image free", "reduce photo size", "compress jpeg free", "compress png free", "image size reducer online", "photo compressor online", "iloveimg compress", "batch image compression", "iloveimg alternative"],
    category: "image",
    heroDescription: "Reduce image file size online without losing visual quality — intelligent compression keeps pixels sharp. Free, no signup, and your photos never leave your browser.",
    cardDescription: "Reduce image file size while keeping pixels sharp and clear.",
  },
  "image-to-pdf": {
    title: "Image to PDF Converter Free | JPG, PNG to PDF",
    description:
      "Convert images to PDF online for free. Combine JPG, PNG, WebP photos into one professional PDF document. No watermarks, no signup — 100% client-side.",
    keywords: ["image to pdf", "convert images to pdf", "jpg to pdf", "png to pdf", "photos to pdf", "image to pdf free"],
    category: "image",
    heroDescription: "Compile your images into one professional PDF document — free, instant, and private. Supports JPG, PNG, WebP, and more with no watermarks on output.",
    cardDescription: "Compile images into one professional PDF document.",
  },
  "resize-image": {
    title: "Resize Image Free | Change Image Dimensions Instantly",
    description:
      "Resize images online for free. Scale to any dimension — pixels, percentages, or presets. Supports JPG, PNG, WebP. No signup, no watermarks — 100% client-side.",
    keywords: ["resize image", "scale image", "change image dimensions", "image resizer", "resize image online free", "resize photo", "image resizer online", "resize photo free", "iloveimg resize", "change photo size online", "resize jpg png free", "adjust image size"],
    category: "image",
    heroDescription: "Scale image dimensions to any target size — free, instant, and private. Supports all major formats with precise pixel or percentage control.",
    cardDescription: "Scale image dimensions to any target size precisely.",
  },
  "image-to-text": {
    title: "Image to Text OCR Free | Extract Text from Images",
    description:
      "Extract text from images online for free using OCR. Copy text from screenshots, photos, and scanned documents instantly. No signup — 100% client-side.",
    keywords: ["image to text", "ocr online", "extract text from image", "image ocr", "photo to text", "screenshot to text", "ocr free"],
    category: "image",
    heroDescription: "Extract text from any image using OCR technology — free, instant, and private. Works with screenshots, photos, and scanned documents right in your browser.",
    cardDescription: "Extract text from images using precise OCR technology.",
  },
  "convert-image": {
    title: "Convert Image Free | PNG, JPG, WebP Format Converter",
    description:
      "Convert images between formats online for free. PNG to JPG, JPG to PNG, WebP, SVG, and more. Batch conversion supported, no signup, no watermarks.",
    keywords: ["convert image", "png to jpg", "jpg to png", "webp converter", "image format converter", "convert image free", "heic to png", "convert any image format", "image converter online free", "batch image converter", "iloveimg convert", "svg converter online", "gif to jpg free", "cloudconvert alternative", "freeconvert alternative"],
    category: "image",
    heroDescription: "Switch image formats freely — PNG, JPG, WebP, SVG, and more. Batch conversion supported with no watermarks, no signup, and 100% client-side privacy.",
    cardDescription: "Switch formats freely — PNG, JPG, WebP, SVG and more.",
  },
  "edit-image": {
    title: "Free Image Editor Online | Adjust, Crop, Filter and Enhance",
    description:
      "Edit images online for free. Adjust brightness, contrast, crop, apply filters, and fine-tune photos. Full-featured browser editor — no signup, no watermarks.",
    keywords: ["edit image online", "image editor free", "photo editor free", "apply filters image", "free photo editor", "adjust image online"],
    category: "image",
    heroDescription: "Apply adjustments, crops, and stylistic filters to your images — free and fully private. A full-featured browser-based editor with no account required.",
    cardDescription: "Apply adjustments, crops, and stylistic filters to images.",
  },
  "blur-background": {
    title: "Blur Background Free | Professional Bokeh Effect Online",
    description:
      "Blur photo backgrounds online for free. Create professional bokeh isolation effects automatically. No signup, no watermarks — 100% client-side.",
    keywords: ["blur background", "bokeh effect", "blur image background", "background blur tool", "blur background free", "portrait blur"],
    category: "image",
    heroDescription: "Automatically blur the background of your photos for a professional bokeh isolation effect — free, instant, and private.",
    cardDescription: "Professional bokeh background isolation effect.",
  },
  "heic-to-jpg": {
    title: "HEIC to JPG Converter Free | Convert iPhone Photos",
    description:
      "Convert iPhone HEIC/HEIF photos to JPG, PNG, or WebP online for free. Batch conversion supported. No upload — 100% client-side and private.",
    keywords: ["heic to jpg", "convert heic", "iphone photo converter", "heif to jpg", "heic to jpg free", "heic converter"],
    category: "image",
    heroDescription: "Convert iPhone HEIC/HEIF photos to JPG, PNG, or WebP — batch supported, free, and completely private. No server uploads required.",
    cardDescription: "Convert iPhone HEIC/HEIF photos to JPG, PNG, or WebP — batch supported.",
  },
  "exif-remover": {
    title: "EXIF Remover Free | Strip Photo GPS and Metadata",
    description:
      "Remove EXIF metadata from photos online for free. Strip GPS location, camera info, and timestamps for privacy. No signup — 100% client-side.",
    keywords: ["remove exif", "strip metadata photo", "exif remover", "photo privacy", "remove gps from photo", "exif remover free"],
    category: "image",
    heroDescription: "View and strip GPS location, camera info, and timestamp metadata from your photos for privacy — free, instant, and completely private.",
    cardDescription: "View and strip GPS, camera, and timestamp metadata from photos.",
  },
  "batch-resize": {
    title: "Batch Image Resizer Free | Resize 50+ Images at Once",
    description:
      "Resize 50+ images at once online for free. Presets or custom dimensions. Download all as ZIP. No signup, no watermarks — 100% client-side.",
    keywords: ["batch resize images", "bulk image resizer", "resize multiple images", "mass image resize", "batch resize free"],
    category: "image",
    heroDescription: "Resize 50+ images at once with presets or custom dimensions — download all as a ZIP. Free, instant, and completely private.",
    cardDescription: "Resize 50+ images at once — presets or custom dimensions, ZIP download.",
  },
  "remove-bg": {
    title: "Remove Background Free | AI Background Remover Online",
    description:
      "Remove image backgrounds with AI online for free. Full resolution output, no watermarks, no signup. Add custom background colors. 100% client-side and private.",
    keywords: ["remove background", "background remover", "remove bg", "transparent background", "ai background removal", "remove bg free", "background eraser", "remove image background free", "background remover online", "iloveimg remove background", "transparent png maker", "cut out background free"],
    category: "image",
    heroDescription: "Remove image backgrounds with AI — full resolution, no watermark, no signup. Add custom background colors, all processed privately in your browser.",
    cardDescription: "Remove backgrounds with AI — full resolution, no watermark, no signup.",
  },
  "id-photo": {
    title: "ID Photo Maker Free | Passport and Visa Photo Creator",
    description:
      "Create passport and visa photos online for free. Correct dimensions for 30+ countries. Print-ready 300 DPI output — no signup, no watermarks.",
    keywords: ["id photo maker", "passport photo", "visa photo", "id photo online", "passport photo maker", "passport photo free"],
    category: "image",
    heroDescription: "Create passport and visa photos with correct dimensions for 30+ countries — print-ready 300 DPI output, free, and completely private.",
    cardDescription: "Create passport & visa photos with correct dimensions for 30+ countries.",
  },
  "social-image": {
    title: "Social Media Image Resizer Free | Instagram, LinkedIn",
    description:
      "Resize images for social media online for free. One-click presets for Instagram, Twitter, LinkedIn, YouTube, TikTok — smart crop and fit. No signup.",
    keywords: ["social media image resizer", "instagram image size", "twitter image dimensions", "social media photo size", "instagram profile picture size"],
    category: "image",
    heroDescription: "One-click presets for Instagram, Twitter, LinkedIn, YouTube, TikTok — smart crop and fit your images instantly. Free and private.",
    cardDescription: "One-click presets for Instagram, Twitter, LinkedIn, YouTube, TikTok.",
  },
  "color-blind-simulator": {
    title: "Color Blindness Simulator Free | Test Design Accessibility",
    description:
      "Simulate color blindness online for free. See how designs look with Protanopia, Deuteranopia, Tritanopia, and more. Free accessibility testing tool.",
    keywords: ["color blind simulator", "color blindness test", "accessibility checker", "design accessibility", "color vision deficiency simulator"],
    category: "image",
    heroDescription: "See how your designs look to people with Protanopia, Deuteranopia, Tritanopia, and more color vision deficiencies — free accessibility testing tool.",
    cardDescription: "See how designs look to people with color vision deficiencies.",
  },
  "watermark-remover": {
    title: "Watermark Remover Free | Remove Watermarks from Images",
    description:
      "Remove watermarks from images online for free. Paint over watermarks and AI inpaints them away — client-side, no upload, completely private.",
    keywords: ["remove watermark", "watermark remover", "inpaint watermark", "delete watermark image", "watermark remover free"],
    category: "image",
    heroDescription: "Paint over watermarks and AI inpaints them away — client-side, no upload, completely private. Free and instant watermark removal.",
    cardDescription: "Paint over watermarks and inpaint them away — client-side, private.",
  },
  "video-to-gif": {
    title: "Video to GIF Converter Free | Convert Video Clips to GIF",
    description:
      "Convert video clips to GIFs online for free. Trim, resize, adjust FPS. Client-side with FFmpeg — no upload needed, no watermarks.",
    keywords: ["video to gif", "convert video to gif", "make gif from video", "gif maker from video", "video to gif free"],
    category: "image",
    heroDescription: "Convert video clips to GIFs — trim, resize, adjust FPS. Client-side with FFmpeg, no upload needed. Free, instant, and completely private.",
    cardDescription: "Convert video clips to GIFs — trim, resize, adjust FPS. No upload.",
  },
  "crop-image": {
    title: "Image Cropper Free | Crop Images with Precision Presets",
    description:
      "Crop images online for free. Free aspect ratio or lock 1:1, 4:3, 16:9 presets. Instant preview, any format — no signup, no watermarks.",
    keywords: ["crop image", "image cropper", "crop photo online", "trim image", "crop image free", "image crop tool", "crop jpg png online", "iloveimg crop", "crop image to aspect ratio", "crop photo to square"],
    category: "image",
    heroDescription: "Crop images with precision — free aspect ratio or lock 1:1, 4:3, 16:9, and more presets. Instant preview, any format, free and private.",
    cardDescription: "Crop images with precision — free ratio or lock 1:1, 4:3, 16:9.",
  },
  "rotate-image": {
    title: "Rotate and Flip Image Free | Rotate 90, 180, 270 Degrees",
    description:
      "Rotate and flip images online for free. Rotate 90°, 180°, 270° and flip horizontally or vertically. Instant preview, any format — no signup.",
    keywords: ["rotate image", "flip image", "rotate photo", "image rotation tool", "rotate image free", "flip image online", "rotate photo online free", "iloveimg rotate", "turn image 90 degrees", "flip image horizontally free"],
    category: "image",
    heroDescription: "Rotate 90°, 180°, 270° and flip horizontally or vertically — instant preview, any format. Free, instant, and completely private.",
    cardDescription: "Rotate 90°/180°/270° and flip horizontally or vertically.",
  },
  "split-image": {
    title: "Image Splitter Free | Split Photos into Instagram Grids",
    description:
      "Split images into grids online for free. 1×3, 2×2, 3×3 for Instagram carousels. Download all or individually. No signup, no watermarks.",
    keywords: ["split image", "image splitter", "instagram grid splitter", "divide image into grid", "instagram carousel splitter"],
    category: "image",
    heroDescription: "Split images into grids — 1×3, 2×2, 3×3 for Instagram carousels. Download all or individually. Free, instant, and private.",
    cardDescription: "Split images into grids — 1×3, 2×2, 3×3 for Instagram carousels.",
  },
  "gif-maker": {
    title: "GIF Maker Free | Create Animated GIFs from Images",
    description:
      "Create animated GIFs from multiple images online for free. Set frame delay, reorder frames, and loop. Client-side, no signup, no watermarks.",
    keywords: ["gif maker", "create gif", "animated gif creator", "make gif from images", "gif maker free"],
    category: "image",
    heroDescription: "Create animated GIFs from multiple images — set frame delay, reorder frames, and loop. Free, client-side, no signup, and completely private.",
    cardDescription: "Create animated GIFs from multiple images — set delay, reorder, loop.",
  },
  "collage-maker": {
    title: "Collage Maker Free | Create Photo Collages with Layouts",
    description:
      "Create photo collages online for free. 8 layouts including 2×2, 3×3, and feature layouts. Custom gap and background. No signup, no watermarks.",
    keywords: ["collage maker", "photo collage", "create collage online", "image collage tool", "collage maker free"],
    category: "image",
    heroDescription: "Create photo collages with 8 layouts — 2×2, 3×3, feature layouts with custom gap and background. Free, instant, and private.",
    cardDescription: "Create photo collages with 8 layouts — custom gap & background.",
  },
  "meme-generator": {
    title: "Meme Generator Free | Add Text to Images and Create Memes",
    description:
      "Create memes online for free. Add bold Impact text to any image — top, bottom, or center with custom colors and font size. No signup, no watermarks.",
    keywords: ["meme generator", "create meme", "meme maker", "add text to image", "impact font meme", "meme generator free", "meme maker online free", "meme creator online", "iloveimg meme", "caption image online free", "make meme from photo"],
    category: "image",
    heroDescription: "Add bold Impact text to any image — top, bottom, or center placement with custom colors and font size. Free, instant, and private.",
    cardDescription: "Add bold Impact text to any image — custom colors & font size.",
  },
  "annotate-image": {
    title: "Image Annotator Free | Add Arrows, Text and Markup",
    description:
      "Annotate images online for free. Add arrows, rectangles, circles, lines, text, and freehand drawings. Perfect for visual feedback — no signup.",
    keywords: ["annotate image", "image annotation", "mark up image", "add arrows to image", "image markup tool", "annotate image free"],
    category: "image",
    heroDescription: "Add arrows, rectangles, circles, lines, text, and freehand drawings to images — perfect for visual feedback. Free, instant, and private.",
    cardDescription: "Add arrows, rectangles, circles, lines, text, and drawings to images.",
  },
  "upscale-image": {
    title: "Image Upscaler Free | Upscale Photos Up to 4x Online",
    description:
      "Upscale images up to 4× online for free. Multi-step interpolation with unsharp mask sharpening. Browser-based, no signup, no watermarks.",
    keywords: ["upscale image", "image upscaler", "enlarge image", "increase image resolution", "super resolution", "upscale image free", "ai image upscaler", "enhance photo quality online", "iloveimg upscale", "upscale photo to 4k", "enlarge photo without blur"],
    category: "image",
    heroDescription: "Upscale images up to 4× with multi-step interpolation and unsharp mask sharpening — free, browser-based, and completely private.",
    cardDescription: "Upscale images up to 4× with interpolation & sharpening.",
  },
  "photo-enhancer": {
    title: "Photo Enhancer Free | Auto Fix and Fine Tune Image Quality",
    description:
      "Enhance photos online for free. One-click auto-fix or fine-tune brightness, contrast, saturation, hue, blur, and sepia with live preview. No signup.",
    keywords: ["photo enhancer", "enhance photo", "auto fix image", "image enhancement", "improve photo quality", "photo enhancer free"],
    category: "image",
    heroDescription: "One-click auto-fix or fine-tune brightness, contrast, saturation, hue, blur, and sepia with live preview — free, instant, and private.",
    cardDescription: "One-click auto-fix or fine-tune brightness, contrast, saturation & more.",
  },
  "colorize-image": {
    title: "Colorize Image Free | Add Color to Black and White Photos",
    description:
      "Add color to black and white photos online for free. Sepia toning plus hue rotation with luminance-aware blending. No signup, no watermarks.",
    keywords: ["colorize image", "colorize photo", "add color to black and white", "photo colorization", "colorize image free"],
    category: "image",
    heroDescription: "Add color to black and white photos — sepia toning plus hue rotation with luminance-aware blending. Free, instant, and private.",
    cardDescription: "Add color to B&W photos — sepia toning + hue rotation blending.",
  },

  // ─── Dev Tools ─────────────────────────────────────────
  "json-preview": {
    title: "JSON Viewer and Formatter Free | Visualize JSON Tree",
    description:
      "Visualize JSON payloads as an interactive collapsible tree with type badges and search. Free, client-side, no signup, 100% private.",
    keywords: ["json preview", "json viewer", "visualize json", "json tree", "json inspector", "json viewer free", "json formatter online", "format json online", "json beautifier", "json parser online", "online json viewer formatter", "json validator free", "json viewer stack alternative", "trusted json viewer", "json import from file", "json code formatter"],
    category: "dev",
    heroDescription: "Visualize JSON payloads as an interactive collapsible tree with type badges and search — free, instant, and completely private. No data leaves your browser.",
    cardDescription: "Visualize JSON payloads with structured, interactive nodes.",
  },
  "api-formatter": {
    title: "API Response Formatter Free | Beautify and Inspect API Data",
    description:
      "Format raw API responses with status badges, header inspection, and structured error details. Free, instant, and client-side.",
    keywords: ["api formatter", "format api response", "beautify api", "api response viewer", "api formatter free"],
    category: "dev",
    heroDescription: "Format raw API responses with status badges, header inspection, and structured error details — free, instant, and completely private.",
    cardDescription: "Beautify unstructured API response data accurately.",
  },
  "code-screenshot": {
    title: "Code Screenshot Generator Free | Beautiful Code Images",
    description:
      "Capture elegant code snippets as beautiful images with 8 themes and PNG export. Perfect for docs and social media. Free, no signup.",
    keywords: ["code screenshot", "code image", "beautiful code", "carbon alternative", "code snippet image", "code screenshot free"],
    category: "dev",
    heroDescription: "Capture elegant code snippets in high fidelity with 8 themes and PNG export — perfect for docs and social media. Free, instant, and private.",
    cardDescription: "Capture elegant code snippets in high fidelity.",
  },
  "markdown-docs": {
    title: "Markdown Editor and Renderer Free | Preview Docs Live",
    description:
      "Render Markdown as styled documentation with syntax highlighting in real time. Free, client-side, no signup — 100% private.",
    keywords: ["markdown editor", "markdown renderer", "markdown preview", "markdown to html", "markdown docs", "markdown editor free"],
    category: "dev",
    heroDescription: "Real-time rendering for complex Markdown syntax with syntax highlighting — free, client-side, and completely private.",
    cardDescription: "Realtime rendering for complex markup syntax.",
  },
  "fake-data": {
    title: "Fake Data Generator Free | Realistic Mock and Dummy Data",
    description:
      "Generate realistic dummy data — users, emails, addresses — export as CSV, JSON, or SQL. Free, instant, and 100% client-side.",
    keywords: ["fake data generator", "mock data", "dummy data", "test data generator", "faker data", "mock data generator"],
    category: "dev",
    heroDescription: "Generate realistic dummy data — users, emails, addresses — and export as CSV, JSON, or SQL. Free, instant, and completely private.",
    cardDescription: "Generate realistic dummy data — export as CSV, JSON, or SQL.",
  },
  "email-signature": {
    title: "Email Signature Generator Free | HTML Signatures",
    description:
      "Create professional email signatures with custom colors and copy-paste HTML output. Free, instant, no signup — 100% client-side.",
    keywords: ["email signature generator", "create email signature", "html email signature", "professional signature", "email signature free"],
    category: "dev",
    heroDescription: "Create professional email signatures with custom colors and copy-paste HTML output — free, instant, and completely private.",
    cardDescription: "Create professional email signatures with custom colors.",
  },
  "svg-optimizer": {
    title: "SVG Optimizer Free | Clean & Reduce SVG File Size",
    description:
      "Clean and optimize SVG files — remove bloat from Figma and Illustrator exports with 30+ plugins. Free, instant, and client-side.",
    keywords: ["svg optimizer", "optimize svg", "svg cleaner", "reduce svg size", "svgo online", "svg optimizer free"],
    category: "dev",
    heroDescription: "Clean and optimize SVG files — remove bloat from Figma/Illustrator exports with 30+ optimization plugins. Free, instant, and private.",
    cardDescription: "Clean and optimize SVG files — 30+ plugins for Figma/Illustrator.",
  },
  "qr-code": {
    title: "QR Code Generator Free | URLs, WiFi, vCards and Colors",
    description:
      "Generate QR codes for URLs, text, WiFi, vCards, and emails with custom colors and SVG export. Free, instant, and client-side.",
    keywords: ["qr code generator", "create qr code", "qr code maker", "wifi qr code", "vcard qr code", "qr code free"],
    category: "dev",
    heroDescription: "Generate QR codes for URLs, text, WiFi, vCards, and emails — custom colors and SVG export. Free, instant, and completely private.",
    cardDescription: "Generate QR codes for URLs, text, WiFi, vCards — custom colors, SVG.",
  },
  "barcode": {
    title: "Barcode Generator Free | Code128, EAN-13, UPC-A & More",
    description:
      "Generate barcodes in 7 formats — Code128, EAN-13, UPC-A, ITF-14, MSI, Codabar. PNG and SVG export. Free, no signup.",
    keywords: ["barcode generator", "create barcode", "ean-13 barcode", "code128 barcode", "upc barcode", "barcode generator free"],
    category: "dev",
    heroDescription: "Generate barcodes in 7 formats — Code128, EAN-13, UPC-A, ITF-14, MSI, Codabar — with PNG and SVG export. Free and instant.",
    cardDescription: "Generate barcodes in 7 formats — PNG & SVG export.",
  },
  "password-generator": {
    title: "Secure Password Generator Free | Crypto-Secure & Bulk Export",
    description:
      "Generate strong, crypto-secure passwords with bulk export. Customizable length and character sets. Free, private, no signup.",
    keywords: ["password generator", "secure password", "random password", "strong password generator", "crypto password", "password generator free"],
    category: "dev",
    heroDescription: "Generate strong, crypto-secure passwords with bulk export — customizable length and character sets. Free, private, and no signup.",
    cardDescription: "Generate crypto-secure passwords with bulk export.",
  },
  "json-csv": {
    title: "JSON to CSV Converter Free | Bidirectional Convert",
    description:
      "Convert between JSON and CSV formats with custom delimiters. Bidirectional and instant. Free, client-side, no signup.",
    keywords: ["json to csv", "csv to json", "json csv converter", "convert json csv", "bidirectional converter", "json to csv free"],
    category: "dev",
    heroDescription: "Convert between JSON and CSV formats with custom delimiters — bidirectional and instant. Free, client-side, and completely private.",
    cardDescription: "Convert between JSON and CSV — bidirectional, instant.",
  },
  "favicon-generator": {
    title: "Favicon Generator Free | ICO, PNG, SVG and manifest.json",
    description:
      "Generate .ico, multi-size PNGs, apple-touch-icon, and manifest.json from any image. Free, instant, and 100% client-side.",
    keywords: ["favicon generator", "create favicon", "ico generator", "app icon generator", "favicon maker", "favicon generator free", "svg favicon generator", "favicon for all browsers", "favicon checker", "website favicon creator", "multi-size favicon", "apple touch icon generator", "web app manifest generator", "favicon for google", "favicon react nextjs", "favicon ico dimensions", "realfavicongenerator alternative"],
    category: "dev",
    heroDescription: "Generate .ico, multi-size PNGs, apple-touch-icon, and manifest.json from any image — free, instant, and completely private.",
    cardDescription: "Generate .ico, PNGs, apple-touch-icon & manifest.json from any image.",
  },
  "color-picker": {
    title: "Color Picker Free | Hex, RGB, HSL and WCAG Contrast",
    description:
      "Pick colors with hex, RGB, HSL conversion, WCAG contrast checker, and image palette extraction. Free and instant.",
    keywords: ["color picker", "hex color picker", "color palette", "wcag contrast checker", "color converter", "color picker free"],
    category: "dev",
    heroDescription: "Pick colors with hex, RGB, HSL conversion, WCAG contrast checker, and image palette extraction — free, instant, and completely private.",
    cardDescription: "Pick colors with hex/RGB/HSL conversion & WCAG contrast checker.",
  },
  "word-counter": {
    title: "Word Counter Free | Words, Characters and SEO Metrics",
    description:
      "Count words, characters, and sentences. Check reading time, keyword density, and SEO metrics. Free and instant.",
    keywords: ["word counter", "character count", "reading time calculator", "keyword density checker", "text analysis", "word counter free"],
    category: "dev",
    heroDescription: "Count words, characters, and sentences — check reading time, keyword density, and SEO metrics. Free, instant, and completely private.",
    cardDescription: "Count words, characters, sentences — check reading time & SEO metrics.",
  },
  "base64": {
    title: "Base64 Encode and Decode Free | URL and HTML Entities",
    description:
      "Encode and decode Base64, URL encoding, and HTML entities — 6 tools in one. Free, client-side, no signup — 100% private.",
    keywords: ["base64 encode", "base64 decode", "url encode", "html entities", "base64 converter", "base64 free"],
    category: "dev",
    heroDescription: "Encode and decode Base64, URL encoding, and HTML entities — 6 tools in one. Free, client-side, and completely private.",
    cardDescription: "Encode/decode Base64, URL encoding & HTML entities — 6 tools.",
  },
  "regex-tester": {
    title: "Regex Tester Free | Real-Time Matching, Groups and Cheats",
    description:
      "Test regular expressions with real-time matching, group highlighting, and a built-in cheat sheet. Free, instant, and 100% client-side.",
    keywords: ["regex tester", "regular expression tester", "regex checker", "regex online", "pattern matcher", "regex tester free", "test regex online", "regex builder", "build and test regex", "regex debugger", "javascript regex tester", "python regex tester", "pcre regex tester", "regex unit tests online", "regex code generator", "regex quick reference", "regex101 alternative"],
    category: "dev",
    heroDescription: "Test regular expressions with real-time matching, group highlighting, and cheat sheet — free, instant, and completely private.",
    cardDescription: "Test regex with real-time matching, groups & cheat sheet.",
  },
  "gradient-generator": {
    title: "CSS Gradient Generator Free | Linear, Radial, Conic",
    description:
      "Build CSS gradients visually — linear, radial, conic with 10 presets and copy-paste CSS output. Free and instant.",
    keywords: ["css gradient generator", "gradient maker", "linear gradient", "radial gradient", "conic gradient", "gradient generator free"],
    category: "dev",
    heroDescription: "Build CSS gradients visually — linear, radial, conic with 10 presets and copy-paste CSS output. Free, instant, and private.",
    cardDescription: "Build CSS gradients visually — linear, radial, conic presets.",
  },
  "lorem-ipsum": {
    title: "Lorem Ipsum Generator Free | Dummy Placeholder Text",
    description:
      "Generate placeholder text as paragraphs, sentences, or words. Start with Lorem option. Free, instant, and client-side.",
    keywords: ["lorem ipsum generator", "placeholder text", "dummy text", "lipsum generator", "lorem ipsum free", "lorem ipsum text online", "dummy text generator free", "placeholder text generator", "lorem ipsum paragraphs", "standard dummy text", "lorem ipsum online", "latin placeholder text", "lorem ipsum for design", "lorem ipsum history", "lorem ipsum 45bc", "lipsum alternative"],
    category: "dev",
    heroDescription: "Generate placeholder text as paragraphs, sentences, or words — start with Lorem option. Free, instant, and completely private.",
    cardDescription: "Generate placeholder text — paragraphs, sentences, or words.",
  },
  "diff-checker": {
    title: "Diff Checker Free | Compare Text, JSON and Images",
    description:
      "Compare text, JSON, or images side by side with highlighted differences. No size limit. Free, client-side, no signup.",
    keywords: ["diff checker", "compare text", "text diff", "json diff", "image diff", "diff checker free"],
    category: "dev",
    heroDescription: "Compare text, JSON, or images side by side with highlighted differences — no size limit. Free, instant, and completely private.",
    cardDescription: "Compare text, JSON, or images side by side with diff highlighting.",
  },
  "multi-converter": {
    title: "Multi-Format PDF Converter Free | All Outputs at Once",
    description:
      "Convert PDF to multiple formats at once — text, table, JSON, or images. One upload, four outputs. Free, client-side, no signup.",
    keywords: ["multi format converter", "pdf converter", "pdf to json", "pdf to csv", "pdf to text", "convert pdf to json", "multi output converter", "one click converter"],
    category: "dev",
    heroDescription: "Upload a PDF and convert to Text, Table, JSON, or Images — all in one interface. Other tools do one conversion at a time, you get everything at once. Free, instant, and completely private.",
    cardDescription: "Convert PDF to Text, Table, JSON & Images — all at once in one interface.",
  },
  "pdf-cleaner": {
    title: "Smart PDF Cleaner Free | Auto Remove Margins and Fix Spacing",
    description:
      "Automatically clean messy PDFs — remove extra margins and fix spacing for perfect readability. Free, client-side, no signup.",
    keywords: ["pdf cleaner", "clean pdf", "remove pdf margins", "pdf readability", "fix pdf formatting", "pdf cleaner free", "crop pdf margins"],
    category: "pdf",
    heroDescription: "Automatically improve PDF readability — remove extra margins and fix spacing. Not editing, but improving. Free, instant, and completely private.",
    cardDescription: "Auto-clean messy PDFs — remove margins and fix spacing.",
  },
  "csv-debugger": {
    title: "CSV Visual Debugger Free | Spot Data Problems Fast",
    description:
      "Upload CSV and spot data problems fast. Highlights duplicates, empty values, and column issues. Not just a viewer, a data problem finder. Free, no signup.",
    keywords: ["csv debugger", "csv data problems", "find csv duplicates", "csv empty values", "csv column issues", "csv validator", "csv checker", "csv quality"],
    category: "dev",
    heroDescription: "Upload CSV and instantly spot data problems — highlight duplicates, detect empty values, show column issues. Not just a CSV viewer, a data problem finder. Free, instant, and private.",
    cardDescription: "Spot CSV data problems — duplicates, empty values, column issues at a glance.",
  },
  "bulk-renamer": {
    title: "Bulk File Renamer Free | Rename Files with Custom Rules",
    description:
      "Rename multiple files at once using logic rules — date stamps, sequential numbering, custom patterns, find & replace. Free, client-side, no signup.",
    keywords: ["bulk file renamer", "rename files online", "batch rename", "file renaming rules", "rename files with pattern", "sequential numbering files", "bulk rename free"],
    category: "dev",
    heroDescription: "Rename multiple files at once using logic-based rules — date stamps, sequential numbering, custom patterns, and find & replace. Free, instant, and completely private.",
    cardDescription: "Rename files with logic rules — date, numbering, patterns & find-replace.",
  },
  "folder-visualizer": {
    title: "Folder Structure Visualizer Free | Interactive Tree View",
    description:
      "Upload a folder and see an interactive tree view — collapsible structure, file type highlights, and unused file detection. Free, client-side, no signup.",
    keywords: ["folder structure visualizer", "project tree view", "directory visualizer", "folder map", "project structure viewer", "file tree online", "folder visualizer free"],
    category: "dev",
    heroDescription: "Upload a folder and see an interactive tree view — collapsible structure, file type highlights, and unused file detection. Simple web tool for understanding project structure. Free and private.",
    cardDescription: "Interactive tree view of folder structure — collapsible, highlights unused files.",
  },
  "pixel-comparator": {
    title: "Pixel Size Comparator Free | Actual vs Display Size",
    description:
      "Compare actual pixel size vs display size for any image. Zoom comparison, real dimensions with padding and margin overlays. Free, no signup.",
    keywords: ["pixel size comparator", "image actual size", "real pixel size", "image zoom comparison", "display vs actual size", "image dimensions checker", "pixel comparator free"],
    category: "image",
    heroDescription: "Upload images and see actual pixel size vs display size with zoom comparison — understand visual scale with padding and margin overlays. Free, instant, and completely private.",
    cardDescription: "Compare actual pixel size vs display size — zoom, padding & margin overlays.",
  },
  "watermark-image": {
    title: "Watermark Image Free | Add Text and Logo Watermarks",
    description:
      "Add custom text or image watermarks to photos online for free. Adjust position, opacity, size, rotation, and color. No signup, no output watermarks.",
    keywords: ["watermark image", "add watermark photo", "image watermark tool", "stamp photo", "add text watermark image", "watermark image free", "photo watermark", "add watermark to photo free", "iloveimg watermark", "logo watermark photo online", "batch photo watermark"],
    category: "image",
    heroDescription: "Add custom text or image watermarks to your photos — adjust position, opacity, size, rotation, and color. Free, instant, and completely private.",
    cardDescription: "Add custom text or image watermarks — adjust position, opacity, size & color.",
  },
  "blur-face": {
    title: "Blur Face Free | Anonymize Faces and Sensitive Areas",
    description:
      "Blur faces and sensitive areas in photos online for free. Draw rectangles or paint over areas to blur. Adjustable blur intensity. No signup, 100% private.",
    keywords: ["blur face", "anonymize face photo", "face blur tool", "blur sensitive area image", "privacy blur photo", "blur face free", "blur face in photo online", "iloveimg blur face", "censor face in image", "obscure license plate photo", "privacy photo editor"],
    category: "image",
    heroDescription: "Blur faces and sensitive areas in your photos — draw rectangles or paint over areas with adjustable blur intensity. Free, instant, and completely private.",
    cardDescription: "Blur faces & sensitive areas — draw rectangles or paint to anonymize photos.",
  },
  "html-to-image": {
    title: "HTML to Image Converter Free | Render HTML as PNG or JPG",
    description:
      "Convert HTML and CSS code to high-quality images online for free. Live preview, custom viewport, and PNG/JPG export. No signup, 100% private.",
    keywords: ["html to image", "html to png", "html screenshot", "css to image", "render html image", "html to image free", "convert html to jpg online", "webpage screenshot tool", "iloveimg html to image", "html to png converter free", "html css renderer"],
    category: "image",
    heroDescription: "Convert HTML and CSS code to high-quality images — live preview, custom viewport size, and PNG/JPG export. Free, instant, and completely private.",
    cardDescription: "Convert HTML/CSS code to images — live preview, PNG/JPG export.",
  },

  // ─── PDF Conversion Tools ──────────────────────────────
  "jpg-to-pdf": {
    title: "JPG to PDF Converter Free | Convert JPG Images to PDF",
    description:
      "Convert JPG images to PDF online for free. Combine multiple JPGs into one PDF or each as a page. No watermarks, no signup — 100% client-side.",
    keywords: ["jpg to pdf", "convert jpg to pdf", "jpeg to pdf online", "jpg to pdf free", "images to pdf", "jpg pdf converter", "convert jpg to pdf online free"],
    category: "pdf",
    heroDescription: "Convert JPG images to a PDF document instantly — combine multiple photos into one file or keep each as a separate page. Free, private, and nothing leaves your browser.",
    cardDescription: "Convert JPG images into a PDF — combine multiple photos instantly.",
  },
  "jpeg-to-pdf": {
    title: "JPEG to PDF Converter Free | Convert JPEG Images to PDF",
    description:
      "Convert JPEG images to PDF online for free. Combine multiple JPEGs into one PDF document instantly. No watermarks, no signup — 100% client-side.",
    keywords: ["jpeg to pdf", "convert jpeg to pdf", "jpeg to pdf online", "jpeg to pdf free", "jpeg pdf converter", "convert jpeg to pdf online free", "jpg jpeg to pdf"],
    category: "pdf",
    heroDescription: "Convert JPEG images to a PDF document instantly — free, private, and no server uploads. Combine multiple photos into one professional PDF without any watermarks.",
    cardDescription: "Convert JPEG images into a PDF — combine multiple photos instantly.",
  },
  "png-to-pdf": {
    title: "PNG to PDF Converter Free | Convert PNG Images to PDF",
    description:
      "Convert PNG images to PDF online for free. Combine multiple PNGs into one PDF document instantly. No watermarks, no signup — 100% client-side.",
    keywords: ["png to pdf", "convert png to pdf", "png to pdf online", "png to pdf free", "png pdf converter", "convert png to pdf online free", "images to pdf"],
    category: "pdf",
    heroDescription: "Convert PNG images to a PDF document — free, private, and instant. Combine multiple PNGs into one professional PDF without uploading to any server.",
    cardDescription: "Convert PNG images into a PDF — combine multiple files instantly.",
  },
  "webp-to-pdf": {
    title: "WebP to PDF Converter Free | Convert WebP Images to PDF",
    description:
      "Convert WebP images to PDF online for free. Combine multiple WebP files into one PDF document. No watermarks, no signup — 100% client-side.",
    keywords: ["webp to pdf", "convert webp to pdf", "webp to pdf online", "webp to pdf free", "webp pdf converter", "convert webp to pdf online free"],
    category: "pdf",
    heroDescription: "Convert WebP images to a PDF document — free, instant, and completely private. Combine multiple WebP files into one PDF without any watermarks.",
    cardDescription: "Convert WebP images into a PDF — combine multiple files instantly.",
  },
  "gif-to-pdf": {
    title: "GIF to PDF Converter Free | Convert GIF Images to PDF",
    description:
      "Convert GIF images to PDF online for free. Combine multiple GIF frames into one PDF document. No watermarks, no signup — 100% client-side.",
    keywords: ["gif to pdf", "convert gif to pdf", "gif to pdf online", "gif to pdf free", "gif pdf converter", "convert gif to pdf online free"],
    category: "pdf",
    heroDescription: "Convert GIF images to a PDF document — free, instant, and completely private. Combine multiple GIF files into one PDF without any watermarks.",
    cardDescription: "Convert GIF images into a PDF — combine multiple files instantly.",
  },
  "bmp-to-pdf": {
    title: "BMP to PDF Converter Free | Convert BMP Bitmap to PDF",
    description:
      "Convert BMP bitmap images to PDF online for free. Combine multiple BMP files into one PDF document. No watermarks, no signup — 100% client-side.",
    keywords: ["bmp to pdf", "convert bmp to pdf", "bmp to pdf online", "bmp to pdf free", "bitmap to pdf", "convert bmp to pdf online free"],
    category: "pdf",
    heroDescription: "Convert BMP bitmap images to a PDF document — free, instant, and completely private. Combine multiple BMP files into one PDF without any watermarks.",
    cardDescription: "Convert BMP bitmap images into a PDF — combine files instantly.",
  },
  "tiff-to-pdf": {
    title: "TIFF to PDF Converter Free | Convert Scanned TIFF to PDF",
    description:
      "Convert TIFF scanned documents to PDF online for free. Combine multi-page TIFFs into one PDF. No watermarks, no signup — 100% client-side.",
    keywords: ["tiff to pdf", "convert tiff to pdf", "tiff to pdf online", "tiff to pdf free", "tif to pdf", "scanned tiff to pdf", "convert tiff to pdf online free"],
    category: "pdf",
    heroDescription: "Convert TIFF scanned documents to a PDF — free, instant, and completely private. Combine multi-page TIFFs into one professional PDF without any watermarks.",
    cardDescription: "Convert TIFF scanned documents into a PDF — combine pages instantly.",
  },
  "avif-to-pdf": {
    title: "AVIF to PDF Converter Free | Convert AVIF Images to PDF",
    description:
      "Convert AVIF images to PDF online for free. Combine multiple AVIF files into one PDF document. No watermarks, no signup — 100% client-side.",
    keywords: ["avif to pdf", "convert avif to pdf", "avif to pdf online", "avif to pdf free", "avif pdf converter", "convert avif to pdf online free"],
    category: "pdf",
    heroDescription: "Convert AVIF images to a PDF document — free, instant, and completely private. Combine multiple AVIF files into one PDF without any watermarks.",
    cardDescription: "Convert AVIF images into a PDF — combine multiple files instantly.",
  },
  "heic-to-pdf": {
    title: "HEIC to PDF Converter Free | Convert iPhone Photos to PDF",
    description:
      "Convert iPhone HEIC photos to PDF online for free. Combine multiple HEIC images into one PDF. No watermarks, no signup — 100% client-side.",
    keywords: ["heic to pdf", "convert heic to pdf", "iphone photo to pdf", "heic to pdf free", "heif to pdf", "convert heic to pdf online free"],
    category: "pdf",
    heroDescription: "Convert iPhone HEIC photos to a PDF document — free, instant, and completely private. Combine multiple HEIC files into one PDF without any watermarks.",
    cardDescription: "Convert iPhone HEIC photos into a PDF — combine files instantly.",
  },
  "svg-to-pdf": {
    title: "SVG to PDF Converter Free | Convert SVG Vector Graphics",
    description:
      "Convert SVG vector graphics to PDF online for free. Preserve vector quality in the output PDF. No watermarks, no signup — 100% client-side.",
    keywords: ["svg to pdf", "convert svg to pdf", "svg to pdf online", "svg to pdf free", "vector to pdf", "convert svg to pdf online free"],
    category: "pdf",
    heroDescription: "Convert SVG vector graphics to a PDF document preserving vector quality — free, instant, and completely private. No watermarks, no server uploads.",
    cardDescription: "Convert SVG vector graphics into a PDF — preserves vector quality.",
  },
  "pdf-to-png": {
    title: "PDF to PNG Converter Free | Extract PDF Pages as PNG",
    description:
      "Convert PDF pages to high-quality PNG images online for free. Download individually or as ZIP. No watermarks, no signup — 100% client-side.",
    keywords: ["pdf to png", "convert pdf to png", "pdf pages to png", "extract png from pdf", "pdf to image png", "pdf to png free", "convert pdf to png online free"],
    category: "pdf",
    heroDescription: "Convert every PDF page into a high-quality PNG image — free, instant, and completely private. Download pages individually or as a ZIP without any watermarks.",
    cardDescription: "Extract crisp PNG images from each page of your PDF document.",
  },
  "pdf-to-webp": {
    title: "PDF to WebP Converter Free | Convert PDF Pages to WebP",
    description:
      "Convert PDF pages to WebP images online for free. Download individually or as ZIP. No watermarks, no signup — 100% client-side.",
    keywords: ["pdf to webp", "convert pdf to webp", "pdf pages to webp", "pdf to webp free", "pdf to image webp", "convert pdf to webp online free"],
    category: "pdf",
    heroDescription: "Convert every PDF page into a WebP image — free, instant, and completely private. Download pages individually or as a ZIP without any watermarks.",
    cardDescription: "Convert PDF pages to WebP images — download individually or as ZIP.",
  },
  "pdf-to-gif": {
    title: "PDF to GIF Free | Convert PDF Pages to Animated GIF",
    description:
      "Convert PDF pages to GIF or animated GIF online for free. Download frames individually or combined. No watermarks, no signup — 100% client-side.",
    keywords: ["pdf to gif", "convert pdf to gif", "pdf to animated gif", "pdf pages to gif", "pdf to gif free", "convert pdf to gif online free"],
    category: "pdf",
    heroDescription: "Convert PDF pages to GIF or an animated GIF — free, instant, and completely private. Download frames individually or combined without any watermarks.",
    cardDescription: "Convert PDF pages to GIF or animated GIF — free and private.",
  },
  "pdf-to-avif": {
    title: "PDF to AVIF Free | Convert PDF to Next-Gen AVIF Format",
    description:
      "Convert PDF pages to AVIF images online for free. Next-gen format with smaller file sizes. No watermarks, no signup — 100% client-side.",
    keywords: ["pdf to avif", "convert pdf to avif", "pdf to avif free", "pdf pages to avif", "pdf to image avif", "convert pdf to avif online free"],
    category: "pdf",
    heroDescription: "Convert PDF pages to AVIF — the next-gen image format with 50% smaller files. Free, instant, and completely private with no server uploads.",
    cardDescription: "Convert PDF pages to AVIF — next-gen format, 50% smaller files.",
  },
  "pdf-to-bmp": {
    title: "PDF to BMP Free | Convert PDF Pages to BMP Format",
    description:
      "Convert PDF pages to BMP bitmap images online for free. Download individually or as ZIP. No watermarks, no signup — 100% client-side.",
    keywords: ["pdf to bmp", "convert pdf to bmp", "pdf to bitmap", "pdf pages to bmp", "pdf to bmp free", "convert pdf to bmp online free"],
    category: "pdf",
    heroDescription: "Convert PDF pages to BMP bitmap images — free, instant, and completely private. Download pages individually or as a ZIP without any watermarks.",
    cardDescription: "Convert PDF pages to BMP bitmap images — download individually or as ZIP.",
  },
  "pdf-to-tiff": {
    title: "PDF to TIFF Converter Free | Export PDF Pages as TIFF",
    description:
      "Export PDF pages as TIFF images online for free. High-quality output for print workflows. No watermarks, no signup — 100% client-side.",
    keywords: ["pdf to tiff", "convert pdf to tiff", "pdf to tif", "pdf pages to tiff", "pdf to tiff free", "convert pdf to tiff online free"],
    category: "pdf",
    heroDescription: "Export PDF pages as TIFF images for print workflows — free, instant, and completely private. High-quality output without any watermarks.",
    cardDescription: "Export PDF pages as TIFF images — high-quality print workflow output.",
  },
  "pdf-to-svg": {
    title: "PDF to SVG Converter Free | Export PDF as Scalable Vector",
    description:
      "Export PDF pages as scalable SVG vector graphics online for free. Editable in Illustrator and Inkscape. No watermarks, no signup — 100% client-side.",
    keywords: ["pdf to svg", "convert pdf to svg", "pdf to vector", "pdf pages to svg", "pdf to svg free", "convert pdf to svg online free"],
    category: "pdf",
    heroDescription: "Export PDF pages as SVG vector graphics — editable in Illustrator and Inkscape. Free, instant, and completely private with no server uploads.",
    cardDescription: "Export PDF pages as SVG vector graphics — editable in design tools.",
  },
  "pdf-to-heic": {
    title: "PDF to HEIC | Browser Limitation Guide and Alternatives",
    description:
      "HEIC encoding requires native OS support unavailable in browsers. This guide covers the best desktop and online alternatives for converting PDF to HEIC format.",
    keywords: ["pdf to heic", "convert pdf to heic", "pdf to heic alternative", "pdf to heic free", "heic encoder", "pdf heic conversion"],
    category: "pdf",
    heroDescription: "HEIC encoding is not natively supported in browsers. This guide explains the limitation and recommends the best free desktop alternatives including HEIC-compatible tools for PDF conversion.",
    cardDescription: "Browser limitation guide & best alternatives for PDF to HEIC conversion.",
  },
  "pdf-to-csv": {
    title: "PDF to CSV Converter Free | Extract PDF Tables as CSV",
    description:
      "Extract PDF table data as CSV online for free. Smart parsing preserves rows and columns. No watermarks, no signup — 100% client-side.",
    keywords: ["pdf to csv", "convert pdf to csv", "extract pdf table csv", "pdf table to csv", "pdf to csv free", "convert pdf to csv online free"],
    category: "pdf",
    heroDescription: "Extract PDF table data as CSV with smart row and column parsing — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Extract PDF table data as CSV — smart row and column parsing.",
  },
  "pdf-to-html": {
    title: "PDF to HTML Converter Free | Convert PDF to Web Page",
    description:
      "Convert PDF documents to HTML web pages online for free. Preserves text structure and layout. No watermarks, no signup — 100% client-side.",
    keywords: ["pdf to html", "convert pdf to html", "pdf to webpage", "pdf html converter", "pdf to html free", "convert pdf to html online free"],
    category: "pdf",
    heroDescription: "Convert PDF documents to HTML web pages — preserving text structure and layout. Free, instant, and completely private with no server uploads.",
    cardDescription: "Convert PDF documents to HTML web pages — preserves text structure.",
  },
  "pdf-to-json": {
    title: "PDF to JSON Converter Free | Extract PDF as Structured JSON",
    description:
      "Extract PDF content as structured JSON data online for free. Preserves document hierarchy and tables. No watermarks, no signup — 100% client-side.",
    keywords: ["pdf to json", "convert pdf to json", "extract pdf json", "pdf json extractor", "pdf to json free", "convert pdf to json online free"],
    category: "pdf",
    heroDescription: "Extract PDF content as structured JSON data preserving document hierarchy and tables — free, instant, and completely private with no server uploads.",
    cardDescription: "Extract PDF content as structured JSON — preserves hierarchy and tables.",
  },
  "pdf-to-markdown": {
    title: "PDF to Markdown Converter Free | Convert PDF Text to MD",
    description:
      "Convert PDF text to Markdown format online for free. Preserves headings, lists, and text structure. No watermarks, no signup — 100% client-side.",
    keywords: ["pdf to markdown", "convert pdf to markdown", "pdf to md", "pdf markdown converter", "pdf to markdown free", "convert pdf to md online free"],
    category: "pdf",
    heroDescription: "Convert PDF text to Markdown preserving headings, lists, and text structure — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert PDF text to Markdown — preserves headings and lists.",
  },
  "pdf-to-xml": {
    title: "PDF to XML Converter Free | Extract PDF Content as XML",
    description:
      "Extract PDF content as structured XML data online for free. Preserves document structure and metadata. No watermarks, no signup — 100% client-side.",
    keywords: ["pdf to xml", "convert pdf to xml", "extract pdf xml", "pdf xml extractor", "pdf to xml free", "convert pdf to xml online free"],
    category: "pdf",
    heroDescription: "Extract PDF content as structured XML data preserving document structure and metadata — free, instant, and completely private with no server uploads.",
    cardDescription: "Extract PDF content as structured XML — preserves document structure.",
  },
  "csv-to-pdf": {
    title: "CSV to PDF Converter Free | Convert Spreadsheet Data to PDF",
    description:
      "Convert CSV spreadsheet data to a formatted PDF table online for free. Clean, professional output. No watermarks, no signup — 100% client-side.",
    keywords: ["csv to pdf", "convert csv to pdf", "spreadsheet to pdf", "csv pdf converter", "csv to pdf free", "convert csv to pdf online free"],
    category: "pdf",
    heroDescription: "Convert CSV spreadsheet data to a clean, formatted PDF table — free, instant, and completely private. Professional output with no watermarks.",
    cardDescription: "Convert CSV spreadsheet data to a formatted PDF table — clean output.",
  },
  "txt-to-pdf": {
    title: "TXT to PDF Converter Free | Convert Plain Text Files to PDF",
    description:
      "Convert plain text TXT files to PDF online for free. Preserve line breaks and formatting. No watermarks, no signup — 100% client-side.",
    keywords: ["txt to pdf", "convert txt to pdf", "text to pdf", "plain text to pdf", "txt to pdf free", "convert text file to pdf online free"],
    category: "pdf",
    heroDescription: "Convert plain text TXT files to PDF preserving line breaks and formatting — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert plain text TXT files to PDF — preserves line breaks.",
  },
  "markdown-to-pdf": {
    title: "Markdown to PDF Converter Free | Convert MD to Styled PDF",
    description:
      "Convert Markdown files to a styled PDF with rendered headings, lists, and code blocks. No watermarks, no signup — 100% client-side.",
    keywords: ["markdown to pdf", "convert markdown to pdf", "md to pdf", "markdown pdf converter", "markdown to pdf free", "convert md to pdf online free"],
    category: "pdf",
    heroDescription: "Convert Markdown to a styled PDF with rendered headings, lists, and code blocks — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert Markdown to a styled PDF — renders headings, lists & code.",
  },
  "json-to-pdf": {
    title: "JSON to PDF Converter Free | Convert JSON Data to PDF",
    description:
      "Convert JSON data to a formatted PDF document online for free. Renders nested structure clearly. No watermarks, no signup — 100% client-side.",
    keywords: ["json to pdf", "convert json to pdf", "json pdf converter", "export json to pdf", "json to pdf free", "convert json to pdf online free"],
    category: "pdf",
    heroDescription: "Convert JSON data to a formatted PDF document rendering nested structure clearly — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert JSON data to a formatted PDF — renders nested structure clearly.",
  },
  "xml-to-pdf": {
    title: "XML to PDF Converter Free | Convert XML Files to PDF",
    description:
      "Convert XML files to a formatted PDF document online for free. Preserves document structure. No watermarks, no signup — 100% client-side.",
    keywords: ["xml to pdf", "convert xml to pdf", "xml pdf converter", "export xml to pdf", "xml to pdf free", "convert xml to pdf online free"],
    category: "pdf",
    heroDescription: "Convert XML files to a formatted PDF document preserving document structure — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert XML files to a formatted PDF — preserves document structure.",
  },
  "excel-to-pdf": {
    title: "Excel to PDF Converter Free | Convert XLSX to PDF",
    description:
      "Convert Excel XLSX spreadsheets to PDF online for free. Tables, formatting, and cell data preserved. No watermarks, no signup — 100% client-side.",
    keywords: ["excel to pdf", "convert excel to pdf", "xlsx to pdf", "spreadsheet to pdf", "excel to pdf free", "convert xlsx to pdf online free"],
    category: "pdf",
    heroDescription: "Convert Excel XLSX spreadsheets to PDF preserving tables, formatting, and cell data — free, instant, and completely private. No server uploads.",
    cardDescription: "Convert XLSX spreadsheets to PDF — tables and formatting preserved.",
  },
  "xls-to-pdf": {
    title: "XLS to PDF Converter Free | Convert Legacy Excel to PDF",
    description:
      "Convert legacy XLS Excel files to PDF online for free. Supports old Excel format. No watermarks, no signup — 100% client-side.",
    keywords: ["xls to pdf", "convert xls to pdf", "excel xls to pdf", "legacy excel to pdf", "xls to pdf free", "convert xls to pdf online free"],
    category: "pdf",
    heroDescription: "Convert legacy XLS Excel files to PDF — supporting old Excel format. Free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert legacy XLS Excel files to PDF — supports old Excel format.",
  },
  "doc-to-pdf": {
    title: "DOC to PDF Converter Free | Convert Word Document to PDF",
    description:
      "Convert Word DOC documents to PDF online for free. Preserves text, headings, and formatting. No watermarks, no signup — 100% client-side.",
    keywords: ["doc to pdf", "convert doc to pdf", "word to pdf", "word doc to pdf", "doc to pdf free", "convert word document to pdf online free"],
    category: "pdf",
    heroDescription: "Convert Word DOC documents to PDF preserving text, headings, and formatting — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert Word DOC documents to PDF — text and formatting preserved.",
  },
  "rtf-to-pdf": {
    title: "RTF to PDF Converter Free | Convert Rich Text File to PDF",
    description:
      "Convert RTF rich text files to PDF online for free. Preserves text formatting and structure. No watermarks, no signup — 100% client-side.",
    keywords: ["rtf to pdf", "convert rtf to pdf", "rich text to pdf", "rtf pdf converter", "rtf to pdf free", "convert rtf to pdf online free"],
    category: "pdf",
    heroDescription: "Convert RTF rich text files to PDF preserving text formatting and structure — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert RTF rich text files to PDF — text formatting preserved.",
  },
  "epub-to-pdf": {
    title: "EPUB to PDF Converter Free | Convert eBook to PDF",
    description:
      "Convert EPUB eBooks to PDF online for free. Preserves chapters and text formatting. No watermarks, no signup — 100% client-side.",
    keywords: ["epub to pdf", "convert epub to pdf", "ebook to pdf", "epub pdf converter", "epub to pdf free", "convert epub to pdf online free"],
    category: "pdf",
    heroDescription: "Convert EPUB eBooks to PDF preserving chapters and text formatting — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert EPUB eBooks to PDF — preserves chapters and formatting.",
  },
  "odt-to-pdf": {
    title: "ODT to PDF Converter Free | Convert LibreOffice Docs",
    description:
      "Convert LibreOffice ODT documents to PDF online for free. Preserves text and formatting. No watermarks, no signup — 100% client-side.",
    keywords: ["odt to pdf", "convert odt to pdf", "libreoffice to pdf", "odt pdf converter", "odt to pdf free", "convert odt to pdf online free"],
    category: "pdf",
    heroDescription: "Convert LibreOffice ODT documents to PDF preserving text and formatting — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert LibreOffice ODT documents to PDF — text and formatting preserved.",
  },
  "mobi-to-pdf": {
    title: "MOBI to PDF Converter Free | Convert Kindle MOBI to PDF",
    description:
      "Convert Kindle MOBI eBooks to PDF online for free. Preserves text and chapter structure. No watermarks, no signup — 100% client-side.",
    keywords: ["mobi to pdf", "convert mobi to pdf", "kindle to pdf", "mobi pdf converter", "mobi to pdf free", "convert kindle mobi to pdf online free"],
    category: "pdf",
    heroDescription: "Convert Kindle MOBI eBooks to PDF preserving text and chapter structure — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert Kindle MOBI eBooks to PDF — chapter structure preserved.",
  },
  "azw3-to-pdf": {
    title: "AZW3 to PDF Converter Free | Convert Kindle AZW3 to PDF",
    description:
      "Convert Kindle AZW3 eBooks to PDF online for free. Preserves text and formatting. No watermarks, no signup — 100% client-side.",
    keywords: ["azw3 to pdf", "convert azw3 to pdf", "kindle azw3 to pdf", "azw3 pdf converter", "azw3 to pdf free", "convert azw3 to pdf online free"],
    category: "pdf",
    heroDescription: "Convert Kindle AZW3 eBooks to PDF preserving text and formatting — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert Kindle AZW3 eBooks to PDF — text and formatting preserved.",
  },
  "ppt-to-pdf": {
    title: "PPT to PDF Converter Free | Convert PowerPoint PPT to PDF",
    description:
      "Convert PowerPoint PPT files to PDF online for free. Preserves slides, layout, and formatting. No watermarks, no signup — 100% client-side.",
    keywords: ["ppt to pdf", "convert ppt to pdf", "powerpoint to pdf", "ppt pdf converter", "ppt to pdf free", "convert ppt to pdf online free"],
    category: "pdf",
    heroDescription: "Convert PowerPoint PPT files to PDF preserving slides, layout, and formatting — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert PowerPoint PPT files to PDF — slides and layout preserved.",
  },
  "pdf-to-rtf": {
    title: "PDF to RTF Converter Free | Convert PDF to Rich Text Format",
    description:
      "Convert PDF documents to RTF rich text format online for free. Editable in Word and LibreOffice. No watermarks, no signup — 100% client-side.",
    keywords: ["pdf to rtf", "convert pdf to rtf", "pdf to rich text", "pdf rtf converter", "pdf to rtf free", "convert pdf to rich text format online free"],
    category: "pdf",
    heroDescription: "Convert PDF documents to RTF rich text format — editable in Word and LibreOffice. Free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert PDF to RTF rich text format — editable in Word & LibreOffice.",
  },
  "pdf-to-odt": {
    title: "PDF to ODT Converter Free | Convert to LibreOffice Format",
    description:
      "Convert PDF documents to ODT LibreOffice format online for free. Editable in LibreOffice Writer. No watermarks, no signup — 100% client-side.",
    keywords: ["pdf to odt", "convert pdf to odt", "pdf to libreoffice", "pdf odt converter", "pdf to odt free", "convert pdf to libreoffice online free"],
    category: "pdf",
    heroDescription: "Convert PDF documents to ODT LibreOffice format — editable in LibreOffice Writer. Free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert PDF to ODT LibreOffice format — editable in LibreOffice Writer.",
  },
  "pdf-to-doc": {
    title: "PDF to DOC Converter Free | Convert PDF to Word DOC",
    description:
      "Convert PDF documents to Word DOC format online for free. Editable in Microsoft Word. No watermarks, no signup — 100% client-side.",
    keywords: ["pdf to doc", "convert pdf to doc", "pdf to word doc", "pdf doc converter", "pdf to doc free", "convert pdf to word doc online free"],
    category: "pdf",
    heroDescription: "Convert PDF documents to Word DOC format — editable in Microsoft Word. Free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert PDF to Word DOC format — editable in Microsoft Word.",
  },
  "pdf-to-xls": {
    title: "PDF to XLS Converter Free | Convert PDF Tables to Excel XLS",
    description:
      "Convert PDF tables to Excel XLS format online for free. Smart table detection preserves rows and columns. No watermarks, no signup — 100% client-side.",
    keywords: ["pdf to xls", "convert pdf to xls", "pdf to excel xls", "pdf xls converter", "pdf to xls free", "convert pdf tables to excel online free"],
    category: "pdf",
    heroDescription: "Convert PDF tables to Excel XLS with smart table detection preserving rows and columns — free, instant, and completely private. No watermarks.",
    cardDescription: "Convert PDF tables to Excel XLS — smart table detection.",
  },
  "pdf-to-ppt": {
    title: "PDF to PPT Converter Free | Convert PDF to PowerPoint",
    description:
      "Convert PDF documents to PowerPoint PPT online for free. Each PDF page becomes a presentation slide. No watermarks, no signup — 100% client-side.",
    keywords: ["pdf to ppt", "convert pdf to ppt", "pdf to powerpoint", "pdf ppt converter", "pdf to ppt free", "convert pdf to powerpoint online free"],
    category: "pdf",
    heroDescription: "Convert PDF documents to PowerPoint PPT — each page becomes a slide. Free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert PDF to PowerPoint PPT — each page becomes a slide.",
  },
  "pdf-to-epub": {
    title: "PDF to EPUB Converter Free | Convert PDF to eBook Format",
    description:
      "Convert PDF documents to EPUB eBook format online for free. Readable on Kindle, Kobo, and more. No watermarks, no signup — 100% client-side.",
    keywords: ["pdf to epub", "convert pdf to epub", "pdf to ebook", "pdf epub converter", "pdf to epub free", "convert pdf to epub online free"],
    category: "pdf",
    heroDescription: "Convert PDF documents to EPUB eBook format — readable on Kindle, Kobo, and more. Free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert PDF to EPUB eBook format — readable on Kindle and Kobo.",
  },
  "pdf-to-mobi": {
    title: "PDF to MOBI Converter Free | Convert PDF for Kindle",
    description:
      "Convert PDF documents to MOBI Kindle format online for free. Read your PDF on any Kindle device. No watermarks, no signup — 100% client-side.",
    keywords: ["pdf to mobi", "convert pdf to mobi", "pdf for kindle", "pdf mobi converter", "pdf to mobi free", "convert pdf to mobi online free"],
    category: "pdf",
    heroDescription: "Convert PDF documents to MOBI Kindle format — read your PDF on any Kindle device. Free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert PDF to MOBI Kindle format — read on any Kindle device.",
  },
  "pdf-to-azw3": {
    title: "PDF to AZW3 Converter Free | Convert PDF to Kindle Format",
    description:
      "Convert PDF documents to AZW3 Kindle format online for free. Enhanced Kindle reading experience. No watermarks, no signup — 100% client-side.",
    keywords: ["pdf to azw3", "convert pdf to azw3", "pdf to kindle azw3", "pdf azw3 converter", "pdf to azw3 free", "convert pdf to kindle format online free"],
    category: "pdf",
    heroDescription: "Convert PDF documents to AZW3 Kindle format for an enhanced Kindle reading experience — free, instant, and completely private. No watermarks.",
    cardDescription: "Convert PDF to AZW3 Kindle format — enhanced Kindle reading.",
  },
  "pdf-roast": {
    title: "PDF Roast and Quality Score | Free PDF Quality Checker",
    description:
      "Analyze and score your PDF quality. Checks file size, compression, page count, metadata health, and accessibility issues. Free, private, no signup.",
    keywords: ["pdf quality checker", "pdf grader", "pdf roast", "analyze pdf quality", "pdf score", "pdf optimizer checker", "check pdf quality free"],
    category: "pdf",
    heroDescription: "Get a quality score for your PDF — analyze file size, compression ratio, page count, metadata health, and accessibility issues. Free, instant, and completely private.",
    cardDescription: "Analyze and score your PDF quality — compression, metadata, accessibility.",
  },
  "business-docs": {
    title: "Business Document Pack | Free Invoice, Quote and Receipt",
    description:
      "Generate professional invoices, quotes, and receipts for free. Custom branding, line items, and PDF download. No watermarks, no signup — 100% client-side.",
    keywords: ["invoice generator", "quote generator", "receipt generator", "business documents free", "create invoice free", "pdf invoice receipt", "business doc maker"],
    category: "pdf",
    heroDescription: "Create professional invoices, quotes, and receipts with custom branding and line items — free, instant, and private. Download as PDF without any watermarks.",
    cardDescription: "Create professional invoices, quotes, and receipts — PDF download.",
  },

  // ─── Image Converters ──────────────────────────────────
  "png-to-jpg": {
    title: "PNG to JPG Converter Free | Convert PNG to JPEG Instantly",
    description:
      "Convert PNG images to JPG/JPEG online for free. Adjust quality and reduce file size. No watermarks, no signup — 100% client-side.",
    keywords: ["png to jpg", "convert png to jpg", "png to jpeg", "png jpg converter", "convert png to jpeg online free", "png to jpg free"],
    category: "image",
    heroDescription: "Convert PNG images to JPG/JPEG instantly — adjust quality and reduce file size. Free, private, and nothing leaves your browser. No watermarks.",
    cardDescription: "Convert PNG to JPG/JPEG — adjust quality and reduce file size.",
  },
  "png-to-webp": {
    title: "PNG to WebP Converter Free | Smaller File Sizes Online",
    description:
      "Convert PNG images to WebP online for free. Save 25–35% file size with the same visual quality. No watermarks, no signup — 100% client-side.",
    keywords: ["png to webp", "convert png to webp", "png webp converter", "convert png to webp online free", "png to webp free", "reduce image size webp", "bulk png to webp", "towebp alternative", "core web vitals image optimization", "webp for website speed"],
    category: "image",
    heroDescription: "Convert PNG to WebP and save 25–35% on file size with the same visual quality — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert PNG to WebP — save 25–35% file size instantly.",
  },
  "png-to-gif": {
    title: "PNG to GIF Converter Free | Convert PNG Images to GIF",
    description:
      "Convert PNG images to GIF format online for free. Create animated GIFs from multiple PNGs. No watermarks, no signup — 100% client-side.",
    keywords: ["png to gif", "convert png to gif", "png gif converter", "convert png to gif online free", "png to gif free"],
    category: "image",
    heroDescription: "Convert PNG images to GIF or create animated GIFs from multiple PNGs — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert PNG to GIF or create animated GIFs from multiple PNGs.",
  },
  "png-to-ico": {
    title: "PNG to ICO Converter Free | Create Favicon from PNG",
    description:
      "Convert PNG images to ICO favicon format online for free. Multi-size ICO output (16, 32, 48px). No watermarks, no signup — 100% client-side.",
    keywords: ["png to ico", "convert png to ico", "create favicon from png", "png ico converter", "convert png to ico online free", "png favicon generator"],
    category: "image",
    heroDescription: "Convert PNG images to ICO favicon format with multi-size output (16, 32, 48px) — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert PNG to ICO favicon — multi-size output (16, 32, 48px).",
  },
  "png-to-bmp": {
    title: "PNG to BMP Converter Free | Convert PNG to Bitmap Format",
    description:
      "Convert PNG images to BMP bitmap format online for free. Lossless conversion with no compression. No watermarks, no signup — 100% client-side.",
    keywords: ["png to bmp", "convert png to bmp", "png bitmap converter", "convert png to bitmap online free", "png to bmp free"],
    category: "image",
    heroDescription: "Convert PNG images to BMP bitmap format with lossless conversion — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert PNG to BMP bitmap — lossless conversion, no compression.",
  },
  "png-to-avif": {
    title: "PNG to AVIF Converter Free | Next-Gen Smaller Files",
    description:
      "Convert PNG images to AVIF online for free. Next-gen format delivers 50% smaller files with same quality. No watermarks, no signup — 100% client-side.",
    keywords: ["png to avif", "convert png to avif", "png avif converter", "convert png to avif online free", "png to avif free", "avif image converter"],
    category: "image",
    heroDescription: "Convert PNG to AVIF — the next-gen format with 50% smaller files at the same quality. Free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert PNG to AVIF — next-gen format, 50% smaller file size.",
  },
  "png-to-tiff": {
    title: "PNG to TIFF Converter | Professional Print Format Guide",
    description:
      "PNG to TIFF conversion requires desktop software for professional print workflows. This guide covers the best tools including GIMP, Photoshop, and IrfanView.",
    keywords: ["png to tiff", "convert png to tiff", "png tiff converter", "png to tiff print", "png to tiff guide", "tiff for print"],
    category: "image",
    heroDescription: "TIFF encoding for print workflows is best handled by desktop software. This guide explains why and recommends the best free tools including GIMP, Photoshop, and IrfanView for PNG to TIFF.",
    cardDescription: "PNG to TIFF guide — best desktop tools for professional print workflows.",
  },
  "png-to-heic": {
    title: "PNG to HEIC | Apple Format Guide and Open Alternatives",
    description:
      "HEIC encoding requires Apple OS support. This guide covers the best free alternatives for PNG to HEIC including CloudConvert and native macOS options.",
    keywords: ["png to heic", "convert png to heic", "png heic converter", "png to heic mac", "heic encoder free", "png to heic guide"],
    category: "image",
    heroDescription: "HEIC encoding requires Apple OS support not available in browsers. This guide explains the limitation and recommends the best free alternatives including macOS native tools and CloudConvert.",
    cardDescription: "PNG to HEIC guide — Apple format alternatives and best free tools.",
  },
  "jpg-to-png": {
    title: "JPG to PNG Converter Free | Convert JPEG to Lossless PNG",
    description:
      "Convert JPG/JPEG images to lossless PNG format online for free. Preserve full quality with no compression. No watermarks, no signup — 100% client-side.",
    keywords: ["jpg to png", "convert jpg to png", "jpeg to png", "jpg png converter", "convert jpg to png online free", "jpg to png free"],
    category: "image",
    heroDescription: "Convert JPG/JPEG images to lossless PNG preserving full quality with no compression — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert JPG to lossless PNG — full quality, no compression.",
  },
  "jpg-to-webp": {
    title: "JPG to WebP Converter Free | Smaller File Sizes Online",
    description:
      "Convert JPG images to WebP online for free. Save 25–34% file size with similar visual quality. No watermarks, no signup — 100% client-side.",
    keywords: ["jpg to webp", "convert jpg to webp", "jpeg to webp", "jpg webp converter", "convert jpg to webp online free", "jpg to webp free", "bulk jpg to webp", "towebp alternative", "batch convert jpg to webp", "jpeg webp converter free"],
    category: "image",
    heroDescription: "Convert JPG images to WebP and save 25–34% on file size with similar visual quality — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert JPG to WebP — save 25–34% file size instantly.",
  },
  "jpg-to-gif": {
    title: "JPG to GIF Converter Free | Convert JPEG to GIF Format",
    description:
      "Convert JPG images to GIF format online for free. Create animated GIFs from multiple JPGs. No watermarks, no signup — 100% client-side.",
    keywords: ["jpg to gif", "convert jpg to gif", "jpeg to gif", "jpg gif converter", "convert jpg to gif online free", "jpg to gif free"],
    category: "image",
    heroDescription: "Convert JPG images to GIF or create animated GIFs from multiple JPEGs — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert JPG to GIF or create animated GIFs from multiple JPEGs.",
  },
  "jpg-to-svg": {
    title: "JPG to SVG Converter Free | Trace JPEG to SVG Vector",
    description:
      "Trace JPG images to SVG vector format online for free. Potrace-powered vectorization converts photos to scalable vectors. No watermarks, no signup.",
    keywords: ["jpg to svg", "convert jpg to svg", "jpeg to svg", "jpg svg converter", "trace jpg to vector", "convert jpg to svg online free"],
    category: "image",
    heroDescription: "Trace JPG images to SVG vector format with Potrace-powered vectorization — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Trace JPG to SVG vector — Potrace-powered vectorization.",
  },
  "jpg-to-ico": {
    title: "JPG to ICO Converter Free | Create Favicon from JPG",
    description:
      "Convert JPG images to ICO favicon format online for free. Multi-size ICO output (16, 32, 48px). No watermarks, no signup — 100% client-side.",
    keywords: ["jpg to ico", "convert jpg to ico", "create favicon from jpg", "jpg ico converter", "convert jpg to ico online free", "jpg favicon generator"],
    category: "image",
    heroDescription: "Convert JPG images to ICO favicon format with multi-size output (16, 32, 48px) — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert JPG to ICO favicon — multi-size output (16, 32, 48px).",
  },
  "jpg-to-bmp": {
    title: "JPG to BMP Converter Free | Convert JPEG to BMP Format",
    description:
      "Convert JPG images to BMP bitmap format online for free. Uncompressed output for compatibility. No watermarks, no signup — 100% client-side.",
    keywords: ["jpg to bmp", "convert jpg to bmp", "jpeg to bmp", "jpg bmp converter", "convert jpg to bmp online free", "jpg to bmp free"],
    category: "image",
    heroDescription: "Convert JPG images to BMP bitmap format with uncompressed output — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert JPG to BMP bitmap — uncompressed output for compatibility.",
  },
  "jpg-to-avif": {
    title: "JPG to AVIF Converter Free | Convert JPEG to AVIF Format",
    description:
      "Convert JPG images to AVIF next-gen format online for free. Smaller file sizes with same quality. No watermarks, no signup — 100% client-side.",
    keywords: ["jpg to avif", "convert jpg to avif", "jpeg to avif", "jpg avif converter", "convert jpg to avif online free", "jpg to avif free"],
    category: "image",
    heroDescription: "Convert JPG images to AVIF next-gen format for smaller file sizes with same quality — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert JPG to AVIF — next-gen format, smaller file sizes.",
  },
  "jpg-to-tiff": {
    title: "JPG to TIFF Converter | Professional Print Workflow Guide",
    description:
      "JPG to TIFF conversion for professional print workflows requires desktop software. This guide covers the best tools including GIMP, Photoshop, and IrfanView.",
    keywords: ["jpg to tiff", "convert jpg to tiff", "jpeg to tiff", "jpg tiff converter", "jpg to tiff print", "jpg to tiff guide"],
    category: "image",
    heroDescription: "TIFF encoding for print workflows is best handled by desktop software. This guide recommends the best free tools including GIMP, Photoshop, and IrfanView for JPG to TIFF.",
    cardDescription: "JPG to TIFF guide — best desktop tools for print workflows.",
  },
  "jpg-to-heic": {
    title: "JPG to HEIC | Apple Format Guide and AVIF Alternative",
    description:
      "HEIC encoding requires Apple OS support. This guide covers the best free alternatives for converting JPG to HEIC including AVIF as an open-standard replacement.",
    keywords: ["jpg to heic", "convert jpg to heic", "jpeg to heic", "jpg heic converter", "jpg to heic mac", "heic encoder alternative"],
    category: "image",
    heroDescription: "HEIC encoding requires Apple OS support not available in browsers. This guide explains the limitation and recommends AVIF as an open-standard alternative, plus macOS native tools.",
    cardDescription: "JPG to HEIC guide — AVIF alternative and best free tools.",
  },
  "webp-to-png": {
    title: "WebP to PNG Converter Free | Universal Compatibility",
    description:
      "Convert WebP images to PNG for universal browser and software compatibility online for free. No watermarks, no signup — 100% client-side.",
    keywords: ["webp to png", "convert webp to png", "webp png converter", "convert webp to png online free", "webp to png free"],
    category: "image",
    heroDescription: "Convert WebP images to PNG for universal browser and software compatibility — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert WebP to PNG — universal browser and software compatibility.",
  },
  "webp-to-jpg": {
    title: "WebP to JPG Converter Free | Convert WebP to JPEG",
    description:
      "Convert WebP images to JPG/JPEG online for free. Adjust quality and reduce file size. No watermarks, no signup — 100% client-side.",
    keywords: ["webp to jpg", "convert webp to jpg", "webp to jpeg", "webp jpg converter", "convert webp to jpg online free", "webp to jpg free"],
    category: "image",
    heroDescription: "Convert WebP images to JPG/JPEG — adjust quality and reduce file size. Free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert WebP to JPG/JPEG — adjust quality and reduce file size.",
  },
  "webp-to-gif": {
    title: "WebP to GIF Converter Free | Convert WebP to GIF",
    description:
      "Convert WebP images to GIF format online for free. Create animated GIFs from WebP files. No watermarks, no signup — 100% client-side.",
    keywords: ["webp to gif", "convert webp to gif", "webp gif converter", "convert webp to gif online free", "webp to gif free"],
    category: "image",
    heroDescription: "Convert WebP images to GIF or create animated GIFs from multiple WebP files — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert WebP to GIF or create animated GIFs from WebP files.",
  },
  "webp-to-svg": {
    title: "WebP to SVG Converter Free | Trace WebP to SVG Vector",
    description:
      "Trace WebP images to SVG vector format online for free. Potrace-powered vectorization. No watermarks, no signup — 100% client-side.",
    keywords: ["webp to svg", "convert webp to svg", "webp svg converter", "trace webp to vector", "convert webp to svg online free", "webp to svg free"],
    category: "image",
    heroDescription: "Trace WebP images to SVG vector format with Potrace-powered vectorization — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Trace WebP to SVG vector — Potrace-powered vectorization.",
  },
  "webp-to-ico": {
    title: "WebP to ICO Converter Free | Create Favicon from WebP",
    description:
      "Convert WebP images to ICO favicon format online for free. Multi-size ICO output (16, 32, 48px). No watermarks, no signup — 100% client-side.",
    keywords: ["webp to ico", "convert webp to ico", "create favicon from webp", "webp ico converter", "convert webp to ico online free", "webp favicon generator"],
    category: "image",
    heroDescription: "Convert WebP images to ICO favicon format with multi-size output (16, 32, 48px) — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert WebP to ICO favicon — multi-size output (16, 32, 48px).",
  },
  "webp-to-bmp": {
    title: "WebP to BMP Converter Free | Convert WebP to BMP",
    description:
      "Convert WebP images to BMP bitmap format online for free. Uncompressed output for compatibility. No watermarks, no signup — 100% client-side.",
    keywords: ["webp to bmp", "convert webp to bmp", "webp bmp converter", "convert webp to bmp online free", "webp to bmp free"],
    category: "image",
    heroDescription: "Convert WebP images to BMP bitmap format with uncompressed output — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert WebP to BMP bitmap — uncompressed output for compatibility.",
  },
  "webp-to-tiff": {
    title: "WebP to TIFF Converter | Professional Format Guide",
    description:
      "WebP to TIFF conversion for professional workflows requires desktop software. This guide covers the best tools including GIMP, Photoshop, and CloudConvert.",
    keywords: ["webp to tiff", "convert webp to tiff", "webp tiff converter", "webp to tiff guide", "webp to tiff print"],
    category: "image",
    heroDescription: "TIFF encoding for professional workflows is best handled by desktop software. This guide recommends the best free tools including GIMP, Photoshop, and CloudConvert for WebP to TIFF.",
    cardDescription: "WebP to TIFF guide — best desktop tools for professional workflows.",
  },
  "gif-to-png": {
    title: "GIF to PNG Converter Free | Extract GIF Frame as PNG",
    description:
      "Convert GIF images to PNG or extract individual frames as PNG online for free. No watermarks, no signup — 100% client-side.",
    keywords: ["gif to png", "convert gif to png", "gif png converter", "extract gif frame png", "convert gif to png online free", "gif to png free"],
    category: "image",
    heroDescription: "Convert GIF to PNG or extract individual GIF frames as PNG images — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert GIF to PNG or extract individual frames as PNG images.",
  },
  "gif-to-jpg": {
    title: "GIF to JPG Converter Free | Convert GIF to JPEG",
    description:
      "Convert GIF images to JPG/JPEG format online for free. Extract the first frame or all frames. No watermarks, no signup — 100% client-side.",
    keywords: ["gif to jpg", "convert gif to jpg", "gif to jpeg", "gif jpg converter", "convert gif to jpg online free", "gif to jpg free"],
    category: "image",
    heroDescription: "Convert GIF images to JPG/JPEG — extract the first frame or all frames as JPEGs. Free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert GIF to JPG/JPEG — extract first frame or all frames.",
  },
  "gif-to-webp": {
    title: "GIF to WebP Converter Free | Convert GIF to WebP",
    description:
      "Convert GIF images to WebP format online for free. Animated WebP preserves motion with smaller file size. No watermarks, no signup — 100% client-side.",
    keywords: ["gif to webp", "convert gif to webp", "gif webp converter", "animated gif to webp", "convert gif to webp online free", "gif to webp free"],
    category: "image",
    heroDescription: "Convert GIF to WebP — animated WebP preserves motion at 25–40% smaller file sizes. Free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert GIF to WebP — animated WebP preserves motion, smaller files.",
  },
  "bmp-to-png": {
    title: "BMP to PNG Converter Free | Convert Bitmap to Smaller PNG",
    description:
      "Convert BMP bitmap images to PNG online for free. Dramatically reduce file size without losing quality. No watermarks, no signup — 100% client-side.",
    keywords: ["bmp to png", "convert bmp to png", "bitmap to png", "bmp png converter", "convert bmp to png online free", "bmp to png free"],
    category: "image",
    heroDescription: "Convert BMP bitmaps to PNG and dramatically reduce file size without losing quality — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert BMP to PNG — dramatically reduce file size without quality loss.",
  },
  "bmp-to-jpg": {
    title: "BMP to JPG Converter Free | Convert BMP to JPEG",
    description:
      "Convert BMP bitmap images to JPG/JPEG online for free. Compress and reduce file size significantly. No watermarks, no signup — 100% client-side.",
    keywords: ["bmp to jpg", "convert bmp to jpg", "bitmap to jpg", "bmp jpg converter", "convert bmp to jpg online free", "bmp to jpg free"],
    category: "image",
    heroDescription: "Convert BMP bitmaps to JPG/JPEG and significantly reduce file size — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert BMP to JPG/JPEG — significantly reduce file size.",
  },
  "bmp-to-webp": {
    title: "BMP to WebP Converter Free | Convert BMP to Modern WebP",
    description:
      "Convert BMP bitmap images to WebP modern format online for free. Achieve 80%+ file size reduction. No watermarks, no signup — 100% client-side.",
    keywords: ["bmp to webp", "convert bmp to webp", "bitmap to webp", "bmp webp converter", "convert bmp to webp online free", "bmp to webp free"],
    category: "image",
    heroDescription: "Convert BMP bitmaps to modern WebP format and achieve 80%+ file size reduction — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert BMP to WebP — 80%+ file size reduction with modern format.",
  },
  "avif-to-png": {
    title: "AVIF to PNG Converter Free | Convert AVIF to PNG",
    description:
      "Convert AVIF images to PNG format online for free. Universal compatibility for software that doesn't support AVIF. No watermarks, no signup — 100% client-side.",
    keywords: ["avif to png", "convert avif to png", "avif png converter", "convert avif to png online free", "avif to png free"],
    category: "image",
    heroDescription: "Convert AVIF images to PNG for universal compatibility with software that doesn't support AVIF — free, instant, and completely private. No watermarks.",
    cardDescription: "Convert AVIF to PNG — universal compatibility for older software.",
  },
  "avif-to-jpg": {
    title: "AVIF to JPG Converter Free | Convert AVIF to JPEG",
    description:
      "Convert AVIF images to JPG/JPEG format online for free. Maximum compatibility with any app or platform. No watermarks, no signup — 100% client-side.",
    keywords: ["avif to jpg", "convert avif to jpg", "avif to jpeg", "avif jpg converter", "convert avif to jpg online free", "avif to jpg free"],
    category: "image",
    heroDescription: "Convert AVIF images to JPG/JPEG for maximum compatibility with any app or platform — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert AVIF to JPG/JPEG — maximum compatibility with any platform.",
  },
  "ico-to-png": {
    title: "ICO to PNG Converter Free | Extract PNG from ICO Favicon",
    description:
      "Extract PNG images from ICO favicon files online for free. Choose from all embedded sizes. No watermarks, no signup — 100% client-side.",
    keywords: ["ico to png", "convert ico to png", "extract png from ico", "ico png converter", "convert ico to png online free", "ico to png free"],
    category: "image",
    heroDescription: "Extract PNG images from ICO favicon files — choose from all embedded sizes. Free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Extract PNG from ICO favicon — choose from all embedded sizes.",
  },
  "ico-to-jpg": {
    title: "ICO to JPG Converter Free | Convert ICO Favicon to JPEG",
    description:
      "Convert ICO favicon files to JPG/JPEG format online for free. Extracts and converts embedded images. No watermarks, no signup — 100% client-side.",
    keywords: ["ico to jpg", "convert ico to jpg", "ico to jpeg", "ico jpg converter", "convert ico to jpg online free", "ico to jpg free"],
    category: "image",
    heroDescription: "Convert ICO favicon files to JPG/JPEG — extracts and converts embedded images. Free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert ICO favicon to JPG/JPEG — extracts all embedded images.",
  },
  "ico-to-webp": {
    title: "ICO to WebP Converter Free | Convert ICO to WebP",
    description:
      "Convert ICO favicon files to WebP format online for free. Modern format for web use. No watermarks, no signup — 100% client-side.",
    keywords: ["ico to webp", "convert ico to webp", "ico webp converter", "convert ico to webp online free", "ico to webp free"],
    category: "image",
    heroDescription: "Convert ICO favicon files to modern WebP format for web use — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert ICO favicon to WebP — modern format for web use.",
  },
  "ico-to-svg": {
    title: "ICO to SVG Converter | Two-Step Raster Tracing Guide",
    description:
      "ICO to SVG conversion requires a two-step raster tracing process. This guide covers ICO extraction plus Potrace vectorization for the best SVG results.",
    keywords: ["ico to svg", "convert ico to svg", "ico svg converter", "favicon to svg", "ico to svg guide", "vectorize ico"],
    category: "image",
    heroDescription: "Converting ICO to SVG requires a two-step process: extracting the PNG layer then tracing it with Potrace. This guide explains the best approach for clean SVG favicon output.",
    cardDescription: "ICO to SVG guide — two-step raster tracing for clean SVG favicons.",
  },
  "svg-to-ico": {
    title: "SVG to ICO Converter Free | Create Favicon from SVG",
    description:
      "Convert SVG vector images to ICO favicon format online for free. Multi-size ICO output (16, 32, 48px). No watermarks, no signup — 100% client-side.",
    keywords: ["svg to ico", "convert svg to ico", "create favicon from svg", "svg ico converter", "convert svg to ico online free", "svg favicon generator"],
    category: "image",
    heroDescription: "Convert SVG vector images to ICO favicon format with multi-size output (16, 32, 48px) — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert SVG to ICO favicon — multi-size output (16, 32, 48px).",
  },
  "svg-to-png": {
    title: "SVG to PNG Converter Free | Rasterize SVG to PNG",
    description:
      "Rasterize SVG vector graphics to PNG images online for free. Choose output resolution and dimensions. No watermarks, no signup — 100% client-side.",
    keywords: ["svg to png", "convert svg to png", "rasterize svg", "svg png converter", "convert svg to png online free", "svg to png free"],
    category: "image",
    heroDescription: "Rasterize SVG vector graphics to PNG images — choose output resolution and dimensions. Free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Rasterize SVG to PNG — choose output resolution and dimensions.",
  },
  "svg-to-jpg": {
    title: "SVG to JPG Converter Free | Convert SVG to JPEG",
    description:
      "Convert SVG vector graphics to JPG/JPEG images online for free. Rasterize to any resolution. No watermarks, no signup — 100% client-side.",
    keywords: ["svg to jpg", "convert svg to jpg", "svg to jpeg", "svg jpg converter", "convert svg to jpg online free", "svg to jpg free"],
    category: "image",
    heroDescription: "Convert SVG vector graphics to JPG/JPEG images at any resolution — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert SVG to JPG/JPEG — rasterize to any resolution instantly.",
  },
  "svg-to-webp": {
    title: "SVG to WebP Converter Free | Convert SVG to WebP",
    description:
      "Convert SVG vector graphics to WebP images online for free. Modern format for web delivery. No watermarks, no signup — 100% client-side.",
    keywords: ["svg to webp", "convert svg to webp", "svg webp converter", "convert svg to webp online free", "svg to webp free"],
    category: "image",
    heroDescription: "Convert SVG vector graphics to WebP images for modern web delivery — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert SVG to WebP — modern web delivery format.",
  },
  "png-to-svg": {
    title: "PNG to SVG Converter Free | Trace PNG to Scalable Vector",
    description:
      "Trace PNG images to scalable SVG vector format online for free. Potrace-powered vectorization. No watermarks, no signup — 100% client-side.",
    keywords: ["png to svg", "convert png to svg", "trace png to svg", "png svg converter", "convert png to svg online free", "png to svg free"],
    category: "image",
    heroDescription: "Trace PNG images to scalable SVG vector format with Potrace-powered vectorization — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Trace PNG to SVG vector — Potrace-powered vectorization.",
  },
  "tiff-to-jpg": {
    title: "TIFF to JPG Converter | Desktop Software Guide",
    description:
      "TIFF decoding requires desktop software. This guide covers the best free alternatives including IrfanView, GIMP, and CloudConvert for TIFF to JPG conversion.",
    keywords: ["tiff to jpg", "convert tiff to jpg", "tif to jpg", "tiff jpg converter", "tiff to jpg free", "tiff to jpg guide"],
    category: "image",
    heroDescription: "TIFF decoding requires desktop software for best results. This guide covers the best free alternatives including IrfanView, GIMP, and CloudConvert for TIFF to JPG conversion.",
    cardDescription: "TIFF to JPG guide — best desktop tools including GIMP and IrfanView.",
  },
  "tiff-to-png": {
    title: "TIFF to PNG Converter | Desktop Software Guide",
    description:
      "TIFF decoding requires desktop software. This guide covers the best free alternatives including IrfanView, GIMP, and CloudConvert for TIFF to PNG conversion.",
    keywords: ["tiff to png", "convert tiff to png", "tif to png", "tiff png converter", "tiff to png free", "tiff to png guide"],
    category: "image",
    heroDescription: "TIFF decoding requires desktop software for best results. This guide covers the best free alternatives including IrfanView, GIMP, and CloudConvert for TIFF to PNG conversion.",
    cardDescription: "TIFF to PNG guide — best desktop tools including GIMP and IrfanView.",
  },
  "tiff-to-webp": {
    title: "TIFF to WebP Converter | Desktop Software Guide",
    description:
      "TIFF decoding requires desktop software. This guide covers the best free alternatives including GIMP and CloudConvert for TIFF to WebP conversion.",
    keywords: ["tiff to webp", "convert tiff to webp", "tif to webp", "tiff webp converter", "tiff to webp free", "tiff to webp guide"],
    category: "image",
    heroDescription: "TIFF decoding requires desktop software for best results. This guide covers the best free alternatives including GIMP and CloudConvert for TIFF to WebP conversion.",
    cardDescription: "TIFF to WebP guide — best desktop tools including GIMP and CloudConvert.",
  },
  "heic-to-png": {
    title: "HEIC to PNG Converter Free | Convert iPhone HEIC to PNG",
    description:
      "Convert iPhone HEIC photos to PNG format online for free. Lossless output for universal compatibility. No watermarks, no signup — 100% client-side.",
    keywords: ["heic to png", "convert heic to png", "iphone heic to png", "heic png converter", "convert heic to png online free", "heic to png free"],
    category: "image",
    heroDescription: "Convert iPhone HEIC photos to lossless PNG format for universal compatibility — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert iPhone HEIC to lossless PNG — universal compatibility.",
  },
  "heic-to-webp": {
    title: "HEIC to WebP Converter Free | Convert HEIC to WebP",
    description:
      "Convert iPhone HEIC photos to WebP format online for free. Smaller file sizes with excellent quality. No watermarks, no signup — 100% client-side.",
    keywords: ["heic to webp", "convert heic to webp", "iphone heic to webp", "heic webp converter", "convert heic to webp online free", "heic to webp free"],
    category: "image",
    heroDescription: "Convert iPhone HEIC photos to WebP format for smaller file sizes with excellent quality — free, instant, and completely private. No server uploads, no watermarks.",
    cardDescription: "Convert iPhone HEIC to WebP — smaller files, excellent quality.",
  },
  "passport-photo": {
    title: "Passport Photo Maker Free | Create Passport & Visa Photos",
    description:
      "Create passport and visa photos online for free. Correct dimensions for 30+ countries, print-ready 300 DPI output. No signup, no watermarks — 100% client-side.",
    keywords: ["passport photo maker", "passport photo online", "visa photo maker", "id photo free", "passport photo free", "passport photo creator", "passport photo online free"],
    category: "image",
    heroDescription: "Create passport and visa photos with correct dimensions for 30+ countries — print-ready 300 DPI output, free, and completely private. No signup, no watermarks.",
    cardDescription: "Create passport & visa photos — correct dimensions for 30+ countries.",
  },
  "compress-to-size": {
    title: "Compress Image to Exact Size Free | Target KB or MB",
    description:
      "Compress images to a specific target file size in KB or MB online for free. Binary search compression hits your target precisely. No watermarks, no signup.",
    keywords: ["compress image to size", "compress to specific size", "image to exact kb", "compress image kb", "target file size compressor", "compress to size free"],
    category: "image",
    heroDescription: "Compress images to a precise target file size in KB or MB — binary search compression hits your target accurately. Free, instant, and completely private. No watermarks.",
    cardDescription: "Compress images to exact KB or MB target — binary search precision.",
  },
  "size-analyzer": {
    title: "Image Size Analyzer Free | What Is Making My Image Large?",
    description:
      "Analyze what's making your image file large. Breakdown by color depth, metadata, resolution, and compression ratio. Free, instant, no signup.",
    keywords: ["image size analyzer", "why is my image large", "image file size breakdown", "analyze image size", "image compression analyzer", "image size checker free"],
    category: "image",
    heroDescription: "Find out exactly what's making your image file large — breakdown by color depth, metadata, resolution, and compression ratio. Free, instant, and completely private.",
    cardDescription: "Analyze what's making your image large — color, metadata, resolution.",
  },
  "image-roast": {
    title: "Image Roast and Quality Score | Free Image Quality Checker",
    description:
      "Score your image quality — analyze resolution, compression, color depth, metadata, and optimization potential. Free, private, no signup — 100% client-side.",
    keywords: ["image quality checker", "image roast", "image quality score", "analyze image quality", "image optimizer checker", "check image quality free"],
    category: "image",
    heroDescription: "Get a quality score for your image — analyze resolution, compression, color depth, metadata, and optimization potential. Free, instant, and completely private.",
    cardDescription: "Score your image quality — resolution, compression, optimization potential.",
  },
  "ai-detector": {
    title: "AI Image Detector Free | Is This Photo AI-Generated?",
    description:
      "Detect whether an image was AI-generated online for free. Analyzes artifacts, metadata, and generation signatures. No signup — 100% client-side and private.",
    keywords: ["ai image detector", "detect ai generated image", "is this ai generated", "ai photo detector", "ai image checker free", "ai generated image detector"],
    category: "image",
    heroDescription: "Detect whether an image was AI-generated — analyzes artifacts, metadata, and generation signatures. Free, instant, and completely private. No server uploads.",
    cardDescription: "Detect if an image is AI-generated — analyzes artifacts and metadata.",
  },
  "print-calculator": {
    title: "Print Size Calculator Free | Photo Print Resolution Checker",
    description:
      "Check if your photo has enough resolution to print at a given size. Shows DPI, quality rating, and print recommendations. Free, no signup.",
    keywords: ["print size calculator", "photo print resolution", "dpi calculator", "will my photo print well", "print quality checker", "photo print calculator free"],
    category: "image",
    heroDescription: "Calculate if your photo has enough resolution for print — shows DPI at target size, quality rating, and print recommendations. Free, instant, and private.",
    cardDescription: "Check if your photo has enough resolution to print at a given size.",
  },

  // ─── Bulk Image Tools ──────────────────────────────────
  "bulk-image-compressor": {
    title: "Bulk Image Compressor Free | Compress Multiple Images",
    description:
      "Compress multiple images at once online for free. Batch compress JPG, PNG, WebP with ZIP download. No watermarks, no signup — 100% client-side.",
    keywords: ["bulk image compressor", "compress multiple images", "batch image compressor", "bulk compress images free", "compress images in batch", "batch compress photos"],
    category: "image",
    heroDescription: "Compress multiple images at once with ZIP download — batch process JPG, PNG, WebP with adjustable quality. Free, private, and nothing leaves your browser.",
    cardDescription: "Compress multiple images in batch — ZIP download, adjustable quality.",
  },
  "bulk-image-resizer": {
    title: "Bulk Image Resizer Free | Resize Multiple Images in Batch",
    description:
      "Resize multiple images at once online for free. Batch resize with custom dimensions or presets. ZIP download all results. No watermarks, no signup.",
    keywords: ["bulk image resizer", "resize multiple images", "batch image resizer", "bulk resize images free", "batch resize photos", "resize images in batch"],
    category: "image",
    heroDescription: "Resize multiple images at once with custom dimensions or presets — ZIP download all results. Free, private, and nothing leaves your browser. No watermarks.",
    cardDescription: "Resize multiple images in batch — custom dimensions, ZIP download.",
  },
  "bulk-image-converter": {
    title: "Bulk Image Converter Free | Batch Convert Images to WebP",
    description:
      "Batch convert multiple images to WebP, PNG, JPG, or other formats online for free. ZIP download all results. No watermarks, no signup — 100% client-side.",
    keywords: ["bulk image converter", "batch convert images", "bulk convert to webp", "batch image converter free", "convert multiple images", "batch convert photos"],
    category: "image",
    heroDescription: "Batch convert multiple images to WebP, PNG, JPG, or other formats at once — ZIP download all results. Free, private, and nothing leaves your browser. No watermarks.",
    cardDescription: "Batch convert multiple images to any format — ZIP download all results.",
  },
  "bulk-background-remover": {
    title: "Bulk Background Remover Free | Remove Multiple Backgrounds",
    description:
      "Remove backgrounds from multiple photos at once online for free. Batch AI background removal with ZIP download. No watermarks, no signup — 100% client-side.",
    keywords: ["bulk background remover", "remove backgrounds multiple photos", "batch background removal", "bulk remove bg free", "batch background remover"],
    category: "image",
    heroDescription: "Remove backgrounds from multiple photos at once with batch AI processing and ZIP download — free, private, and nothing leaves your browser. No watermarks.",
    cardDescription: "Remove backgrounds from multiple photos — batch AI processing, ZIP download.",
  },
  "bulk-watermark-adder": {
    title: "Bulk Watermark Adder Free | Add Watermarks in Batch",
    description:
      "Add text or image watermarks to multiple photos at once online for free. Consistent placement across all images. ZIP download. No signup, 100% private.",
    keywords: ["bulk watermark adder", "add watermark multiple images", "batch watermark images", "bulk watermark free", "batch add watermark"],
    category: "image",
    heroDescription: "Add consistent text or image watermarks to multiple photos at once — ZIP download all results. Free, private, and nothing leaves your browser. No signup required.",
    cardDescription: "Add watermarks to multiple images in batch — consistent placement, ZIP download.",
  },
  "bulk-png-to-jpg": {
    title: "Bulk PNG to JPG Converter Free | Batch Convert PNG to JPEG",
    description:
      "Batch convert multiple PNG images to JPG/JPEG online for free. Adjustable quality, ZIP download. No watermarks, no signup — 100% client-side.",
    keywords: ["bulk png to jpg", "batch convert png to jpg", "batch png to jpeg", "bulk png jpg converter free", "convert multiple png to jpg"],
    category: "image",
    heroDescription: "Batch convert multiple PNG images to JPG/JPEG with adjustable quality and ZIP download — free, private, and nothing leaves your browser. No watermarks.",
    cardDescription: "Batch convert PNG to JPG/JPEG — adjustable quality, ZIP download.",
  },
  "bulk-png-to-webp": {
    title: "Bulk PNG to WebP Converter Free | Batch Convert PNG to WebP",
    description:
      "Batch convert multiple PNG images to WebP online for free. Save 25–35% file size across all images. ZIP download. No watermarks, no signup — 100% client-side.",
    keywords: ["bulk png to webp", "batch convert png to webp", "batch png webp", "bulk png webp converter free", "convert multiple png to webp"],
    category: "image",
    heroDescription: "Batch convert multiple PNG images to WebP and save 25–35% file size across all files — ZIP download, free, private, and nothing leaves your browser. No watermarks.",
    cardDescription: "Batch convert PNG to WebP — save 25–35% file size, ZIP download.",
  },
  "bulk-png-to-gif": {
    title: "Bulk PNG to GIF Converter Free | Batch Convert PNG to GIF",
    description:
      "Batch convert multiple PNG images to GIF format online for free. ZIP download all results. No watermarks, no signup — 100% client-side.",
    keywords: ["bulk png to gif", "batch convert png to gif", "batch png gif", "bulk png gif converter free", "convert multiple png to gif"],
    category: "image",
    heroDescription: "Batch convert multiple PNG images to GIF format with ZIP download — free, private, and nothing leaves your browser. No watermarks, no signup.",
    cardDescription: "Batch convert PNG to GIF — ZIP download all results.",
  },
  "bulk-jpg-to-png": {
    title: "Bulk JPG to PNG Converter Free | Batch Convert JPEG to PNG",
    description:
      "Batch convert multiple JPG/JPEG images to PNG format online for free. Lossless output, ZIP download. No watermarks, no signup — 100% client-side.",
    keywords: ["bulk jpg to png", "batch convert jpg to png", "batch jpeg to png", "bulk jpg png converter free", "convert multiple jpg to png"],
    category: "image",
    heroDescription: "Batch convert multiple JPG/JPEG images to lossless PNG format with ZIP download — free, private, and nothing leaves your browser. No watermarks.",
    cardDescription: "Batch convert JPG to lossless PNG — ZIP download all results.",
  },
  "bulk-jpg-to-webp": {
    title: "Bulk JPG to WebP Converter Free | Batch Optimize JPEG Photos",
    description:
      "Batch convert multiple JPG photos to WebP online for free. Smaller file sizes across all images. ZIP download. No watermarks, no signup.",
    keywords: ["bulk jpg to webp", "batch convert jpg to webp", "batch jpeg to webp", "bulk jpg webp converter free", "batch optimize jpeg photos"],
    category: "image",
    heroDescription: "Batch convert multiple JPG photos to WebP and reduce file sizes by 25–34% across all images — ZIP download, free, private, nothing leaves your browser.",
    cardDescription: "Batch convert JPG to WebP — 25–34% smaller, ZIP download.",
  },
  "bulk-webp-to-png": {
    title: "Bulk WebP to PNG Converter Free | Batch Convert WebP to PNG",
    description:
      "Batch convert multiple WebP images to PNG format online for free. Universal compatibility output, ZIP download. No watermarks, no signup — 100% client-side.",
    keywords: ["bulk webp to png", "batch convert webp to png", "batch webp png", "bulk webp png converter free", "convert multiple webp to png"],
    category: "image",
    heroDescription: "Batch convert multiple WebP images to PNG for universal compatibility — ZIP download, free, private, and nothing leaves your browser. No watermarks.",
    cardDescription: "Batch convert WebP to PNG — universal compatibility, ZIP download.",
  },

  // ─── Product Image Tools ───────────────────────────────
  "amazon-image-resizer": {
    title: "Amazon Image Resizer Free | Resize to 1000x1000",
    description:
      "Resize product photos to Amazon's required 1000x1000 online for free. White background option, square crop preset. No watermarks, no signup.",
    keywords: ["amazon image resizer", "amazon product photo size", "resize for amazon", "amazon listing image size", "amazon product image 1000x1000", "amazon photo requirements"],
    category: "image",
    heroDescription: "Resize product photos to Amazon's required 1000×1000 minimum with white background option and square crop preset — free, instant, and completely private. No watermarks.",
    cardDescription: "Resize product photos to Amazon's 1000×1000 requirement — white background.",
  },
  "shopify-image-optimizer": {
    title: "Shopify Image Optimizer Free | Resize Product Images to 2048",
    description:
      "Optimize product images to Shopify's recommended 2048x2048 size online for free. Compress and resize for fast store loading. No watermarks, no signup.",
    keywords: ["shopify image optimizer", "shopify product image size", "optimize for shopify", "shopify listing image", "shopify image 2048x2048", "shopify photo requirements"],
    category: "image",
    heroDescription: "Optimize product images to Shopify's recommended 2048×2048 size with compression for fast store loading — free, instant, and completely private. No watermarks.",
    cardDescription: "Optimize product images to Shopify's 2048×2048 — compress for fast loading.",
  },
  "etsy-image-resizer": {
    title: "Etsy Image Resizer Free | Resize Product Photos for Etsy",
    description:
      "Resize product photos to Etsy's recommended dimensions online for free. Square and landscape presets, optimized for Etsy listings. No watermarks, no signup.",
    keywords: ["etsy image resizer", "etsy product photo size", "resize for etsy", "etsy listing image size", "etsy photo requirements", "etsy image dimensions"],
    category: "image",
    heroDescription: "Resize product photos for Etsy's recommended dimensions with square and landscape presets optimized for listings — free, instant, and completely private. No watermarks.",
    cardDescription: "Resize product photos for Etsy — square and landscape presets.",
  },
  "product-image-resizer": {
    title: "Product Image Resizer Free | Amazon, Shopify, Etsy, eBay",
    description:
      "Resize product photos for Amazon, Shopify, Etsy, eBay, and more online for free. Platform presets included. No watermarks, no signup — 100% client-side.",
    keywords: ["product image resizer", "resize for amazon shopify etsy", "ecommerce image resizer", "product photo size tool", "marketplace image requirements", "product image resize free"],
    category: "image",
    heroDescription: "Resize product photos for Amazon (1000×1000), Shopify (2048×2048), Etsy, eBay, and more with platform presets — free, instant, and completely private. No watermarks.",
    cardDescription: "Resize for Amazon, Shopify, Etsy, eBay — platform presets included.",
  },
  "product-photo-optimizer": {
    title: "Product Photo Optimizer Free | Batch Compress Images",
    description:
      "Batch compress and optimize product photos for faster page loading online for free. Smart compression keeps product details sharp. No watermarks, no signup.",
    keywords: ["product photo optimizer", "compress ecommerce images", "optimize product photos", "batch product image compressor", "ecommerce image optimizer free"],
    category: "image",
    heroDescription: "Batch compress and optimize e-commerce product photos for faster page loading — smart compression keeps product details sharp. Free, instant, and completely private.",
    cardDescription: "Batch compress e-commerce product photos — smart, detail-preserving compression.",
  },
  "product-background-remover": {
    title: "Product Background Remover Free | White Background",
    description:
      "Remove product backgrounds and add a clean white background online for free. E-commerce ready for Amazon, Shopify, Etsy. No watermarks, no signup.",
    keywords: ["product background remover", "white background product photo", "remove background ecommerce", "product photo white background free", "amazon product white background"],
    category: "image",
    heroDescription: "Remove product backgrounds and replace with a clean white background for e-commerce — ready for Amazon, Shopify, and Etsy. Free, instant, and completely private.",
    cardDescription: "Remove product background, add white — ready for Amazon, Shopify, Etsy.",
  },

  // ─── OCR Tools ─────────────────────────────────────────
  "screenshot-to-text": {
    title: "Screenshot to Text Free | Extract Text from Screenshots",
    description:
      "Extract text from screenshots online for free using OCR. Copy text from any screenshot instantly. No signup — 100% client-side and private.",
    keywords: ["screenshot to text", "extract text from screenshot", "ocr screenshot", "screenshot text extractor", "copy text from screenshot free"],
    category: "image",
    heroDescription: "Extract text from any screenshot using OCR — copy text instantly without retyping. Free, instant, and completely private. No server uploads, no signup.",
    cardDescription: "Extract text from screenshots via OCR — copy instantly without retyping.",
  },
  "handwriting-to-text": {
    title: "Handwriting to Text Free | Convert Handwritten Notes via OCR",
    description:
      "Convert handwritten notes to digital text online for free using OCR. Accurate handwriting recognition from photos and scans. No signup — 100% client-side.",
    keywords: ["handwriting to text", "convert handwriting to text", "handwriting ocr", "handwritten notes to text", "handwriting recognition free"],
    category: "image",
    heroDescription: "Convert handwritten notes to digital text using OCR — accurate handwriting recognition from photos and scans. Free, instant, and completely private.",
    cardDescription: "Convert handwritten notes to text via OCR — photos and scans supported.",
  },
  "receipt-scanner": {
    title: "Receipt Scanner Free | Scan Receipts via OCR",
    description:
      "Scan receipts and extract text, totals, and line items online for free using OCR. Perfect for expense tracking. No signup — 100% client-side and private.",
    keywords: ["receipt scanner", "scan receipt online", "receipt ocr", "extract text from receipt", "receipt text extractor free", "receipt scanner app"],
    category: "image",
    heroDescription: "Scan receipts and extract text, totals, and line items using OCR — perfect for expense tracking. Free, instant, and completely private. No server uploads.",
    cardDescription: "Scan receipts via OCR — extract totals and line items for expense tracking.",
  },
  "business-card-scanner": {
    title: "Business Card Scanner Free | Scan and Extract Contact Info",
    description:
      "Scan business cards and extract contact information online for free using OCR. Name, email, phone, company extracted instantly. No signup — 100% client-side.",
    keywords: ["business card scanner", "scan business card", "business card ocr", "extract contact from card", "business card reader free"],
    category: "image",
    heroDescription: "Scan business cards and extract contact information using OCR — name, email, phone, and company extracted instantly. Free, private, and nothing leaves your browser.",
    cardDescription: "Scan business cards via OCR — extract name, email, phone instantly.",
  },
  "table-extraction-from-image": {
    title: "Table Extraction from Image Free | Extract Tables as CSV",
    description:
      "Extract table data from images and photos as CSV online for free using OCR. Preserves rows and columns automatically. No signup — 100% client-side and private.",
    keywords: ["table extraction from image", "extract table from photo", "image table to csv", "ocr table extraction", "extract table csv from image free"],
    category: "image",
    heroDescription: "Extract table data from images and photos as CSV using OCR — rows and columns preserved automatically. Free, instant, and completely private. No server uploads.",
    cardDescription: "Extract tables from images as CSV — rows and columns preserved via OCR.",
  },

  // ─── Dev Tools ─────────────────────────────────────────
  "resume-builder": {
    title: "Free Resume Builder | ATS Optimized with 20 Plus Templates",
    description:
      "Build a professional ATS-optimized resume online for free. 20+ templates, PDF export, live preview. No watermarks, no signup — 100% client-side.",
    keywords: ["resume builder free", "ats resume builder", "online resume maker", "create resume online", "professional resume template", "resume builder no signup", "free resume maker", "resume download free", "resume creator online", "job resume builder", "resume com alternative", "free resume templates download", "build resume for free"],
    category: "dev",
    heroDescription: "Build a professional ATS-optimized resume with 20+ templates and instant PDF export — free, private, and no signup required. Your data never leaves your browser.",
    cardDescription: "Build ATS-optimized resumes with 20+ templates — PDF export, no signup.",
  },
  "json-to-pptx": {
    title: "JSON to PPTX Converter Free | Generate PowerPoint from JSON",
    description:
      "Generate PowerPoint PPTX presentations from JSON data online for free. Define slides, content, and styling in JSON. No watermarks, no signup — 100% client-side.",
    keywords: ["json to pptx", "json to powerpoint", "generate pptx from json", "json pptx converter", "json to presentation free", "convert json to pptx online free"],
    category: "dev",
    heroDescription: "Generate PowerPoint PPTX presentations from JSON data — define slides, content, and styling in JSON. Free, instant, and completely private. No server uploads.",
    cardDescription: "Generate PowerPoint from JSON — define slides and styling in JSON.",
  },
  "js-to-pptx": {
    title: "JavaScript to PPTX Free | Create PowerPoint from Code",
    description:
      "Create PowerPoint PPTX presentations with JavaScript online for free. Write code, export a presentation instantly. No signup, 100% private.",
    keywords: ["js to pptx", "javascript to powerpoint", "generate pptx with javascript", "code to presentation", "programmatic pptx generator", "javascript pptx free"],
    category: "dev",
    heroDescription: "Create PowerPoint PPTX presentations programmatically with JavaScript — write code, export a presentation instantly. Free, private, and no server uploads.",
    cardDescription: "Create PowerPoint presentations with JavaScript code — instant PPTX export.",
  },
  "word-to-pdf": {
    title: "Word to PDF Converter Free | Convert DOCX to PDF Online",
    description:
      "Convert Word DOCX documents to PDF online for free. Client-side processing preserves formatting perfectly — no uploads, no signup, no watermarks.",
    keywords: ["word to pdf", "convert word to pdf", "docx to pdf", "word document to pdf", "word to pdf free", "convert docx to pdf online free"],
    category: "dev",
    heroDescription: "Convert Word DOCX documents to PDF — client-side processing preserves formatting perfectly. Free, instant, and completely private. No uploads, no watermarks.",
    cardDescription: "Convert Word DOCX to PDF — client-side, formatting preserved perfectly.",
  },
  "website-trust-checker": {
    title: "Website Trust Checker Free | SSL and Security Score",
    description:
      "Check any website's trustworthiness instantly. Analyzes SSL, HTTPS, security headers, robots.txt, sitemap, and OG tags. Scores 0 to 100. Free, no signup.",
    keywords: ["website trust checker", "website safety checker", "ssl checker", "security headers checker", "is website safe", "website legitimacy checker", "website trust score", "check website security", "https checker", "website security scanner free"],
    category: "dev",
    heroDescription: "Check if any website is safe and legitimate. Analyzes SSL certificate, security headers, robots.txt, sitemap, and social tags — generates a 0–100 trust score instantly.",
    cardDescription: "Check SSL, security headers & trust score for any URL.",
  },
  "website-content-extractor": {
    title: "Website Content Extractor | URL to Text and Markdown",
    description:
      "Paste any article URL to extract clean, reader-friendly text. Removes ads, navigation, and clutter. Export as Markdown or plain text. Free, no signup.",
    keywords: ["website content extractor", "article extractor", "url to text", "webpage to markdown", "extract text from url", "mercury reader alternative", "clean article text", "url to markdown", "web content cleaner", "remove ads from article free", "url to markdown converter", "web scraper free", "llm training data extractor", "webpage to text online", "html to plain text converter", "structured data from webpages", "web page parser free", "yourgpt alternative", "readability mode online"],
    category: "dev",
    heroDescription: "Extract clean, readable article content from any URL. Removes ads, navigation, and clutter. Export as Markdown or plain text — powered by Mozilla Readability.",
    cardDescription: "Extract clean article text from any URL — export as Markdown or plain text.",
  },
};

/**
 * Get the full Next.js Metadata object for a tool page.
 * Handles title, description, keywords, Open Graph, Twitter Card, and canonical URL.
 */
export function getToolMetadata(slug: string): Metadata {
  const tool = toolMetadataMap[slug];
  if (!tool) {
    return {
      title: SITE_NAME,
    };
  }

  const url = `${SITE_URL}/${slug}`;
  const categoryLabel =
    tool.category === "pdf"
      ? "PDF Tools"
      : tool.category === "image"
      ? "Image Tools"
      : "Developer Tools";

  return {
    title: tool.title,
    description: tool.description,
    keywords: tool.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: tool.title,
      description: tool.description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: tool.title,
      description: tool.description,
    },
  };
}

/**
 * Get the category page metadata.
 */
export function getCategoryMetadata(
  category: "pdf-tools" | "image-tools" | "dev-tools"
): Metadata {
  const configs: Record<string, { title: string; description: string; keywords: string[] }> = {
    "pdf-tools": {
      title: "Free PDF Tools Online | 77 Tools, No Watermarks, No Signup",
      description:
        "77 free PDF tools online. Compress, merge, split, convert, sign, watermark, redact, OCR, and edit. No watermarks, no signup, no uploads.",
      keywords: [
        "free pdf tools",
        "pdf tools no watermark",
        "pdf tools no signup",
        "client-side pdf tools",
        "private pdf tools",
        "pdf editor online free",
        "compress pdf free",
        "merge pdf free",
        "convert pdf free",
        "pdf tools online",
        "pdf tools without upload",
        "best free pdf tools",
        "smallpdf alternative",
        "ilovepdf alternative",
      ],
    },
    "image-tools": {
      title: "Free Image Tools Online | 113 Tools, No Watermarks",
      description:
        "113 free image tools online. Compress, resize, convert, crop, remove backgrounds, enhance photos, and bulk tools. No watermarks, no signup.",
      keywords: [
        "free image tools",
        "image tools no watermark",
        "image tools no signup",
        "client-side image tools",
        "private image tools",
        "image editor online free",
        "compress image free",
        "resize image free",
        "convert image free",
        "image tools online",
        "image tools without upload",
        "best free image tools",
        "image converter online",
        "bulk image tools",
        "free image editor no watermark",
      ],
    },
    "dev-tools": {
      title: "Free Developer Tools Online | 29 Tools, No Signup",
      description:
        "29 free developer tools in your browser. Format APIs, preview JSON, test regex, debug CSV, generate QR codes, build resumes, and more. No signup, no uploads.",
      keywords: [
        "free developer tools",
        "dev tools no signup",
        "client-side dev tools",
        "private developer tools",
        "json formatter free",
        "regex tester free",
        "qr code generator free",
        "api formatter online",
        "csv debugger free",
        "code screenshot generator",
        "best free dev tools",
        "developer tools without upload",
        "carbon now sh alternative",
        "mockaroo alternative",
        "regex101 alternative",
        "diffchecker alternative",
        "svg optimizer free",
        "barcode generator free",
      ],
    },
  };

  const config = configs[category];
  const url = `${SITE_URL}/${category}`;

  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: config.title,
      description: config.description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: config.title,
      description: config.description,
    },
  };
}

/**
 * Get BreadcrumbList JSON-LD for a tool page.
 */
export function getBreadcrumbLd(slug: string) {
  const tool = toolMetadataMap[slug];
  if (!tool) return null;

  const categoryMap: Record<string, { name: string; path: string }> = {
    pdf: { name: "PDF Tools", path: "/pdf-tools" },
    image: { name: "Image Tools", path: "/image-tools" },
    dev: { name: "Developer Tools", path: "/dev-tools" },
  };
  const cat = categoryMap[tool.category];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: cat.name,
        item: `${SITE_URL}${cat.path}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: tool.title.replace(/ [|—] .*$/, ""),
        item: `${SITE_URL}/${slug}`,
      },
    ],
  };
}

/**
 * Get WebApplication JSON-LD for a tool page.
 */
export function getWebApplicationLd(slug: string) {
  const tool = toolMetadataMap[slug];
  if (!tool) return null;

  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.title.replace(/ [|—] .*$/, ""),
    description: tool.description,
    url: `${SITE_URL}/${slug}`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    browserRequirements: "Requires a modern web browser with JavaScript enabled",
  };
}

/** All tool slugs for sitemap and script generation */
export const allToolSlugs = Object.keys(toolMetadataMap);

/**
 * Get FAQPage JSON-LD for a tool page.
 * Reads FAQ items from seo-content.ts and formats them as structured data.
 */
export function getFaqPageLd(slug: string) {
  const content = getToolSeoContent(slug);
  if (!content || content.faqItems.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faqItems.map((item: { question: string; answer: string }) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/**
 * Get HowTo JSON-LD for a tool page.
 * Reads HowTo steps from seo-content.ts and formats them as structured data.
 */
export function getHowToLd(slug: string) {
  const content = getToolSeoContent(slug);
  if (!content?.howToSteps || content.howToSteps.length === 0) return null;

  const tool = toolMetadataMap[slug];
  const toolName = tool ? tool.title.split(" — ")[0] : slug;

  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to use ${toolName}`,
    description: tool?.description ?? `Step-by-step guide for ${toolName}`,
    step: content.howToSteps.map(
      (s: { step: string; description: string }, i: number) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.step,
        text: s.description,
      })
    ),
  };
}
