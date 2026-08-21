import type { Metadata } from "next";
import Link from "next/link";
import { getCategoryMetadata } from "@/app/utils/seo";

export const metadata: Metadata = getCategoryMetadata("pdf-tools");

import {
  FileDown,
  Image,
  Merge,
  FileText,
  Table2,
  Highlighter,
  FileEdit,
  ArrowRight,
  ArrowLeft,
  ArrowRightLeft,
  Shield,
  Zap,
  BookOpen,
  Scissors,
  RotateCw,
  Droplets,
  EyeOff,
  GitCompare,
  FileEdit as FileEditIcon,
  FileDown as FileDownIcon,
  Receipt,
  PenTool,
  Unlock,
  Lock,
  LayoutList,
  ListOrdered,
  Crop,
  Layers,
  Image as ImageIcon,
  ScanSearch,
  Table2 as Table2Icon,
  Sparkles,
  Check,
  X,
  Star,
  Globe,
  LockOpen,
  Eye,
  Gauge,
  ScrollText,
  ClipboardList,
} from "lucide-react";

const pdfTools = [
  {
    name: "Compress PDF",
    description: "Reduce file size without compromising visual fidelity.",
    href: "/compress-pdf",
    icon: FileDown,
  },
  {
    name: "PDF to JPG",
    description: "Convert each page into a high-quality JPG image.",
    href: "/pdf-to-jpg",
    icon: Image,
  },
  {
    name: "Merge PDF",
    description: "Combine multiple PDFs into a single document.",
    href: "/merge-pdf",
    icon: Merge,
  },
  {
    name: "PDF to Text",
    description: "Extract all text content from your PDF files.",
    href: "/pdf-to-text",
    icon: FileText,
  },
  {
    name: "PDF to Data",
    description: "Convert PDF content into structured JSON or CSV data.",
    href: "/pdf-to-data",
    icon: Table2,
  },
  {
    name: "Highlight Extractor",
    description: "Extract highlighted, underlined, and strikethrough text.",
    href: "/highlight-extractor",
    icon: Highlighter,
  },
  {
    name: "PDF Editor",
    description: "Draw, highlight, add text, and erase directly on your PDF pages.",
    href: "/pdf-editor",
    icon: FileEdit,
  },
  {
    name: "PDF Flipbook",
    description: "Read any PDF as an interactive 3D flipbook with page-turn animations.",
    href: "/flipbook-pdf",
    icon: BookOpen,
  },
  {
    name: "Split PDF",
    description: "Split a PDF by page ranges, every N pages, or extract specific pages.",
    href: "/split-pdf",
    icon: Scissors,
  },
  {
    name: "Rotate PDF",
    description: "Rotate individual or all pages clockwise, counter-clockwise, or 180°.",
    href: "/rotate-pdf",
    icon: RotateCw,
  },
  {
    name: "Watermark PDF",
    description: "Add custom text watermarks with adjustable size, color, opacity, and rotation.",
    href: "/watermark-pdf",
    icon: Droplets,
  },
  {
    name: "Redact PDF",
    description: "Black out sensitive info by drawing rectangles — true permanent redaction.",
    href: "/redact-pdf",
    icon: EyeOff,
  },
  {
    name: "PDF Diff",
    description: "Compare two PDFs side by side with visual and line-by-line text diff highlighting.",
    href: "/pdf-diff",
    icon: GitCompare,
  },
  {
    name: "PDF Form Filler",
    description: "Fill PDF form fields — text, checkboxes, dropdowns — no Adobe account needed.",
    href: "/pdf-form-filler",
    icon: FileEditIcon,
  },
  {
    name: "HTML to PDF",
    description: "Convert HTML markup to a clean PDF — no watermarks. Customize page size, margins, and quality.",
    href: "/html-to-pdf",
    icon: FileDownIcon,
  },
  {
    name: "Invoice Generator",
    description: "Create professional PDF invoices — no watermark, no signup. Add line items, tax, and notes.",
    href: "/invoice-generator",
    icon: Receipt,
  },
  {
    name: "Sign PDF",
    description: "Draw, type, or upload your signature and place it on any PDF page — free, unlimited, no account.",
    href: "/sign-pdf",
    icon: PenTool,
  },
  {
    name: "PPTX to PDF",
    description: "Convert PowerPoint presentations to PDF — client-side, no upload, preserves layout.",
    href: "/pptx-to-pdf",
    icon: FileDownIcon,
  },
  {
    name: "Unlock PDF",
    description: "Remove PDF password protection — free, instant, no signup. Works on encrypted PDFs.",
    href: "/unlock-pdf",
    icon: Unlock,
  },
  {
    name: "Protect PDF",
    description: "Add password encryption to any PDF — set user & owner passwords for access control.",
    href: "/protect-pdf",
    icon: Lock,
  },
  {
    name: "Organize PDF",
    description: "Reorder, delete, and duplicate pages — drag & drop interface for easy page management.",
    href: "/organize-pdf",
    icon: LayoutList,
  },
  {
    name: "Add Page Numbers",
    description: "Insert page numbers in any position & format — bottom-center, top-right, custom start page.",
    href: "/page-numbers",
    icon: ListOrdered,
  },
  {
    name: "Crop PDF",
    description: "Trim PDF page margins — crop top, bottom, left, right in pt, mm, or inches.",
    href: "/crop-pdf",
    icon: Crop,
  },
  {
    name: "Flatten PDF",
    description: "Flatten form fields, annotations, and layers into a static PDF — permanent & non-editable.",
    href: "/flatten-pdf",
    icon: Layers,
  },
  {
    name: "Extract Images from PDF",
    description: "Pull out all embedded images from a PDF — download individually or as ZIP.",
    href: "/extract-images-pdf",
    icon: ImageIcon,
  },
  {
    name: "PDF OCR",
    description: "Make scanned PDFs searchable — add invisible text layer using Tesseract OCR. Premium elsewhere, free here.",
    href: "/pdf-ocr",
    icon: ScanSearch,
  },
  {
    name: "PDF to Word",
    description: "Convert PDF to editable DOCX — extract text and structure, free & client-side. Premium elsewhere.",
    href: "/pdf-to-word",
    icon: FileDownIcon,
  },
  {
    name: "PDF to Excel",
    description: "Convert PDF tables to XLSX — smart row grouping, free & client-side. Premium elsewhere.",
    href: "/pdf-to-excel",
    icon: Table2Icon,
  },
  {
    name: "Smart PDF Cleaner",
    description: "Automatically clean messy PDFs — remove extra margins, center content, and normalize font sizes for perfect readability.",
    href: "/pdf-cleaner",
    icon: Sparkles,
  },
  {
    name: "Why Is My PDF So Big?",
    description: "Visual breakdown of what's eating your PDF's file size — embedded images, fonts, metadata, JavaScript. Object-level analysis with one-click fix links.",
    href: "/size-analyzer",
    icon: Gauge,
  },
  {
    name: "PDF Roast & Quality Score",
    description: "Get a brutally honest quality score for any PDF — size efficiency, font load, image bloat, safety (JavaScript detection), metadata, and PDF version. Download a shareable score card.",
    href: "/pdf-roast",
    icon: ScrollText,
  },
  {
    name: "Business Document Pack",
    description: "Generate Invoices, Quotes, Receipts, Purchase Orders, and Delivery Notes with 5 professional themes. Live preview, PDF export, no watermark.",
    href: "/business-docs",
    icon: ClipboardList,
  },
];

const conversionTools = [
  { name: "JPG to PDF", desc: "Convert JPG images to PDF — batch, no upload.", href: "/jpg-to-pdf", icon: ArrowRightLeft },
  { name: "JPEG to PDF", desc: "Convert JPEG photos to PDF — multi-file support.", href: "/jpeg-to-pdf", icon: ArrowRightLeft },
  { name: "PNG to PDF", desc: "Convert PNG images to PDF — lossless, no upload.", href: "/png-to-pdf", icon: ArrowRightLeft },
  { name: "WebP to PDF", desc: "Convert WebP images to PDF — browser-based.", href: "/webp-to-pdf", icon: ArrowRightLeft },
  { name: "GIF to PDF", desc: "Convert GIF images to PDF — first frame used.", href: "/gif-to-pdf", icon: ArrowRightLeft },
  { name: "BMP to PDF", desc: "Convert BMP bitmap images to PDF.", href: "/bmp-to-pdf", icon: ArrowRightLeft },
  { name: "TIFF to PDF", desc: "Convert TIFF scanned images to PDF.", href: "/tiff-to-pdf", icon: ArrowRightLeft },
  { name: "AVIF to PDF", desc: "Convert AVIF next-gen images to PDF.", href: "/avif-to-pdf", icon: ArrowRightLeft },
  { name: "HEIC to PDF", desc: "Convert iPhone HEIC photos to PDF.", href: "/heic-to-pdf", icon: ArrowRightLeft },
  { name: "SVG to PDF", desc: "Convert SVG vector graphics to PDF.", href: "/svg-to-pdf", icon: ArrowRightLeft },
  { name: "PDF to PNG", desc: "Convert PDF pages to lossless PNG images.", href: "/pdf-to-png", icon: ArrowRightLeft },
  { name: "PDF to WebP", desc: "Convert PDF pages to web-optimized WebP.", href: "/pdf-to-webp", icon: ArrowRightLeft },
  { name: "PDF to GIF", desc: "Convert PDF to animated GIF slideshow.", href: "/pdf-to-gif", icon: ArrowRightLeft },
  { name: "PDF to AVIF", desc: "PDF to AVIF — next-gen image format guide.", href: "/pdf-to-avif", icon: ArrowRightLeft },
  { name: "PDF to BMP", desc: "PDF to BMP — lossless alternatives guide.", href: "/pdf-to-bmp", icon: ArrowRightLeft },
  { name: "PDF to TIFF", desc: "PDF to TIFF — professional format guide.", href: "/pdf-to-tiff", icon: ArrowRightLeft },
  { name: "PDF to SVG", desc: "PDF to SVG vector — conversion guide.", href: "/pdf-to-svg", icon: ArrowRightLeft },
  { name: "PDF to HEIC", desc: "PDF to HEIC — browser limitation guide.", href: "/pdf-to-heic", icon: ArrowRightLeft },
  { name: "PDF to CSV", desc: "Extract PDF text content as CSV data.", href: "/pdf-to-csv", icon: ArrowRightLeft },
  { name: "PDF to HTML", desc: "Convert PDF text to an HTML web page.", href: "/pdf-to-html", icon: ArrowRightLeft },
  { name: "PDF to JSON", desc: "Extract PDF pages as structured JSON.", href: "/pdf-to-json", icon: ArrowRightLeft },
  { name: "PDF to Markdown", desc: "Convert PDF text to Markdown format.", href: "/pdf-to-markdown", icon: ArrowRightLeft },
  { name: "PDF to XML", desc: "Extract PDF content as structured XML.", href: "/pdf-to-xml", icon: ArrowRightLeft },
  { name: "CSV to PDF", desc: "Convert CSV data to a formatted PDF table.", href: "/csv-to-pdf", icon: ArrowRightLeft },
  { name: "TXT to PDF", desc: "Convert plain text files to clean PDF.", href: "/txt-to-pdf", icon: ArrowRightLeft },
  { name: "Markdown to PDF", desc: "Convert Markdown files to styled PDF.", href: "/markdown-to-pdf", icon: ArrowRightLeft },
  { name: "JSON to PDF", desc: "Convert JSON data to formatted PDF.", href: "/json-to-pdf", icon: ArrowRightLeft },
  { name: "XML to PDF", desc: "Convert XML files to readable PDF.", href: "/xml-to-pdf", icon: ArrowRightLeft },
  { name: "Excel to PDF", desc: "Convert Excel XLSX files to PDF tables.", href: "/excel-to-pdf", icon: ArrowRightLeft },
  { name: "XLS to PDF", desc: "Convert legacy XLS Excel files to PDF.", href: "/xls-to-pdf", icon: ArrowRightLeft },
  { name: "DOC to PDF", desc: "Convert DOC/DOCX Word files to PDF.", href: "/doc-to-pdf", icon: ArrowRightLeft },
  { name: "RTF to PDF", desc: "Convert RTF Rich Text files to PDF.", href: "/rtf-to-pdf", icon: ArrowRightLeft },
  { name: "EPUB to PDF", desc: "Convert EPUB eBooks to PDF document.", href: "/epub-to-pdf", icon: ArrowRightLeft },
  { name: "PDF to RTF", desc: "PDF to RTF — format guide & alternatives.", href: "/pdf-to-rtf", icon: ArrowRightLeft },
  { name: "PDF to ODT", desc: "PDF to ODT — LibreOffice format guide.", href: "/pdf-to-odt", icon: ArrowRightLeft },
  { name: "PDF to DOC", desc: "PDF to DOC — see our PDF to Word tool.", href: "/pdf-to-doc", icon: ArrowRightLeft },
  { name: "PDF to XLS", desc: "PDF to XLS — see our PDF to Excel tool.", href: "/pdf-to-xls", icon: ArrowRightLeft },
  { name: "PDF to PPT", desc: "PDF to PowerPoint — conversion guide.", href: "/pdf-to-ppt", icon: ArrowRightLeft },
  { name: "PDF to EPUB", desc: "PDF to EPUB eBook — Calibre guide.", href: "/pdf-to-epub", icon: ArrowRightLeft },
  { name: "PDF to MOBI", desc: "PDF to MOBI Kindle — conversion guide.", href: "/pdf-to-mobi", icon: ArrowRightLeft },
  { name: "PDF to AZW3", desc: "PDF to AZW3 Kindle — conversion guide.", href: "/pdf-to-azw3", icon: ArrowRightLeft },
  { name: "ODT to PDF", desc: "ODT to PDF — LibreOffice format guide.", href: "/odt-to-pdf", icon: ArrowRightLeft },
  { name: "MOBI to PDF", desc: "MOBI to PDF Kindle — Calibre guide.", href: "/mobi-to-pdf", icon: ArrowRightLeft },
  { name: "AZW3 to PDF", desc: "AZW3 to PDF Kindle — conversion guide.", href: "/azw3-to-pdf", icon: ArrowRightLeft },
  { name: "PPT to PDF", desc: "PPT to PDF — use our PPTX to PDF tool.", href: "/ppt-to-pdf", icon: ArrowRightLeft },
];

// Competitor comparison data
const competitors = [
  { name: "Toolsz", tools: "77", watermarks: false, signup: false, clientSide: true, premium: false, unique: "PDF Diff, Highlight Extractor, Flipbook, Smart Cleaner, PDF to Data/JSON, True Redaction, Business Doc Pack" },
  { name: "Smallpdf", tools: "~20", watermarks: true, signup: true, clientSide: false, premium: true, unique: "—" },
  { name: "iLovePDF", tools: "~20", watermarks: true, signup: true, clientSide: false, premium: true, unique: "—" },
  { name: "PDF24", tools: "~30", watermarks: false, signup: false, clientSide: false, premium: false, unique: "Desktop app" },
  { name: "Adobe Acrobat", tools: "~15", watermarks: true, signup: true, clientSide: false, premium: true, unique: "—" },
  { name: "PDF2Go", tools: "~15", watermarks: true, signup: true, clientSide: false, premium: true, unique: "—" },
];

// Tools only available on Toolsz (competitor gap)
const uniqueTools = [
  { name: "PDF Diff", href: "/pdf-diff", description: "Compare two PDFs side by side with visual & text diff — no other free tool offers this", icon: GitCompare },
  { name: "Highlight Extractor", href: "/highlight-extractor", description: "Pull out all highlighted text from annotated PDFs — only pdfhighlightextractor.com has this, and it's just one tool", icon: Highlighter },
  { name: "PDF Flipbook", href: "/flipbook-pdf", description: "Interactive 3D flipbook viewer with page-turn animations — unique to Toolsz", icon: BookOpen },
  { name: "Smart PDF Cleaner", href: "/pdf-cleaner", description: "Auto-remove margins, center content, fix spacing — no competitor offers this", icon: Sparkles },
  { name: "PDF to Data / JSON", href: "/pdf-to-data", description: "Convert PDF to structured JSON or CSV — a premium feature elsewhere, free here", icon: Table2 },
  { name: "True PDF Redaction", href: "/redact-pdf", description: "Permanently remove text data, not just black overlay — most free tools only do visual cover", icon: EyeOff },
  { name: "Invoice Generator", href: "/invoice-generator", description: "Create professional PDF invoices with no watermark — most invoice tools add branding", icon: Receipt },
  { name: "PDF Form Filler", href: "/pdf-form-filler", description: "Fill PDF forms without Adobe — Adobe charges for this, we do it free", icon: FileEditIcon },
];

export default function PdfToolsPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="tool-hero p-6 sm:p-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-foreground-secondary hover:text-primary text-base font-semibold mb-6 transition-colors duration-150"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <FileDown className="w-6 h-6 text-primary" />
            </div>
            <div className="max-w-3xl">
              <h1 className="type-h1 font-display gradient-text mb-2">
                Free Online PDF Tools — 77 Tools, No Upload, No Watermarks, No Signup
              </h1>
              <p className="text-foreground-secondary text-lg max-w-2xl leading-relaxed">
                77 free PDF tools that run entirely in your browser. Compress, merge,
                split, convert, sign, watermark, clean, edit PDFs, plus 45 format conversion tools (JPG↔PDF, Excel↔PDF, EPUB↔PDF, and more) —
                no server uploads, no premium tiers, no watermarks on output,
                and no signup required. Unlike Smallpdf and iLovePDF, your files never leave your device.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pdfTools.map((tool, index) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="glass-card-premium p-5 sm:p-7 group flex flex-col"
            >
              <div className="w-12 h-12 rounded-[12px] bg-primary-muted border border-primary-border flex items-center justify-center mb-4 group-hover:bg-primary/15 group-hover:border-primary-border transition-all duration-200">
                <tool.icon className="w-6 h-6 text-primary transition-transform duration-200 group-hover:scale-110" />
              </div>
              <h3 className="type-h3 font-semibold mb-2 text-foreground group-hover:text-primary transition-colors duration-200 break-words">
                {tool.name}
              </h3>
              <p className="type-small text-foreground-secondary leading-relaxed flex-1 break-words">
                {tool.description}
              </p>
              <div className="mt-5 flex items-center gap-2 text-primary type-label opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                Open tool
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>

        {/* Conversion Tools Section */}
        <div className="mt-14">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-1.5 h-6 rounded-full bg-primary inline-block shrink-0" />
            <h2 className="type-h2 font-display font-semibold text-foreground">PDF Conversion Tools</h2>
          </div>
          <p className="text-base text-foreground-secondary mb-6 ml-4.5">Convert between PDF and every major format — images, spreadsheets, documents, and eBooks. Every format has a reverse tool for complete flexibility.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {conversionTools.map((tool) => (
              <Link key={tool.href} href={tool.href} className="glass-card-premium p-5 sm:p-7 group flex flex-col">
                <div className="w-12 h-12 rounded-[12px] bg-primary-muted border border-primary-border flex items-center justify-center mb-4 group-hover:bg-primary/15 group-hover:border-primary-border transition-all duration-200">
                  <ArrowRightLeft className="w-6 h-6 text-primary transition-transform duration-200 group-hover:scale-110" />
                </div>
                <h3 className="type-h3 font-semibold mb-2 text-foreground group-hover:text-primary transition-colors duration-200 break-words">{tool.name}</h3>
                <p className="type-small text-foreground-secondary leading-relaxed flex-1 break-words">{tool.desc}</p>
                <div className="mt-5 flex items-center gap-2 text-primary type-label opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  Open tool <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Request CTA — visible right after tool grid */}
        <div className="mt-8 rounded-2xl bg-linear-to-r from-red-50 to-indigo-50 border border-red-100 px-5 sm:px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">Missing a PDF tool?</p>
            <p className="text-xs text-foreground-secondary mt-0.5">219 tools and counting — submit yours and vote for what ships next.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Link href="/request-a-tool" className="btn btn-primary gap-1.5 text-xs px-4 py-2 flex-1 sm:flex-none justify-center">
              <Zap className="w-3.5 h-3.5" /> Request a Tool
            </Link>
            <Link href="/roadmap" className="btn btn-secondary gap-1.5 text-xs px-4 py-2 flex-1 sm:flex-none justify-center">
              Roadmap <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4" style={{ contentVisibility: "auto", containIntrinsicSize: "auto 350px" }}>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="type-h4 font-semibold text-foreground mb-1">
                100% Client-Side — No Server Uploads
              </h4>
              <p className="type-small text-foreground-secondary leading-relaxed">
                Unlike Smallpdf, iLovePDF, and Adobe Acrobat Online that upload your files to remote servers,
                Toolsz processes everything locally in your browser. Your
                documents never leave your device — nothing is stored or shared.
              </p>
            </div>
          </div>
          <div className="glass-panel glass-panel-info rounded-[16px] p-6 flex items-start gap-5">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200/50 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="type-h4 font-semibold text-foreground mb-1">
                No Watermarks, No Premium — Truly Free
              </h4>
              <p className="type-small text-foreground-secondary leading-relaxed">
                Smallpdf and iLovePDF add watermarks on the free tier or charge for
                full-quality output. Adobe requires a subscription for most features.
                Toolsz never adds watermarks and has no premium tier — every tool is completely free, forever.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
