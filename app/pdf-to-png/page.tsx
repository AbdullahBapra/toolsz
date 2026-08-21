import PdfToImageConverter from "@/app/components/PdfToImageConverter";

const faqs = [
  { q: "How do I convert a PDF to PNG images?", a: "Upload your PDF file, choose an output quality (72, 150, or 300 DPI), and click Convert. Each page becomes a separate PNG file — for multi-page PDFs, all images are packaged in a ZIP." },
  { q: "What DPI should I choose for PDF to PNG?", a: "72 DPI is good for screen viewing, 150 DPI for presentations and web use, 300 DPI for print-quality output. Higher DPI means larger file sizes but sharper images." },
  { q: "Why is PNG better than JPG for PDF conversion?", a: "PNG is lossless — every pixel is preserved perfectly. This makes PNG ideal for PDFs with text, diagrams, or sharp graphics. JPG compression can cause visible artifacts around text edges." },
  { q: "How many PDF pages can I convert?", a: "All pages in your PDF are converted — there is no page limit. For very long documents (100+ pages), the process takes a few seconds per page at 300 DPI." },
  { q: "Is this PDF to PNG converter free?", a: "Yes, completely free. No sign-up, no watermarks, no page limits. All conversion happens in your browser using pdf.js — your PDF never leaves your device." },
];

const relatedTools = [
  { name: "PDF to JPG", href: "/pdf-to-jpg" },
  { name: "PDF to WebP", href: "/pdf-to-webp" },
  { name: "PDF to GIF", href: "/pdf-to-gif" },
  { name: "PNG to PDF", href: "/png-to-pdf" },
  { name: "PDF to Text", href: "/pdf-to-text" },
];

export default function PdfToPngPage() {
  return (
    <PdfToImageConverter
      toMime="image/png"
      toExt="png"
      title="PDF to PNG Converter"
      description="Convert PDF pages to lossless PNG images — free, no upload, browser-based. Choose 72, 150, or 300 DPI quality. All pages converted, ZIP download for multi-page PDFs. No watermarks."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
