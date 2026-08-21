import DocToPdfConverter from "@/app/components/DocToPdfConverter";

const faqs = [
  { q: "How does EPUB to PDF conversion work?", a: "EPUB files are ZIP archives containing HTML chapters and CSS. This tool extracts up to 30 HTML chapters using JSZip, concatenates the content, and renders it to PDF using html2pdf.js." },
  { q: "Will all chapters of my eBook be in the PDF?", a: "Up to 30 HTML chapters from the EPUB are included. Most standard eBooks have fewer than 30 chapters. Very long books with 30+ chapters will include the first 30 to keep the PDF manageable." },
  { q: "Why would I convert an EPUB to PDF?", a: "PDFs are more universally readable than EPUBs — every device and OS can open a PDF without a dedicated eBook reader. Converting EPUB to PDF is useful for sharing books with people who don't have eBook apps." },
  { q: "Will the formatting (fonts, images) be preserved?", a: "Text content and basic HTML formatting are preserved. EPUB-specific fonts and custom CSS may be simplified. Embedded images in EPUB chapters are included if they're referenced in the HTML content." },
];

const relatedTools = [
  { name: "PDF to EPUB", href: "/pdf-to-epub" },
  { name: "TXT to PDF", href: "/txt-to-pdf" },
  { name: "Markdown to PDF", href: "/markdown-to-pdf" },
];

export default function EpubToPdfPage() {
  return (
    <DocToPdfConverter
      conversionType="epub"
      fromFormat="EPUB"
      fromExts=".epub,.EPUB"
      title="EPUB to PDF Converter"
      description="Convert EPUB eBooks to PDF — free, browser-based, no upload. Chapters are extracted and combined into a PDF document. Up to 30 chapters converted. No watermarks."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
