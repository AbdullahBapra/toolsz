import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  { q: "What is ODT format?", a: "ODT (OpenDocument Text) is the open-standard document format used by LibreOffice, OpenOffice, and Google Docs. It's free, unencumbered by patents, and supported on every major platform." },
  { q: "Why can't browsers convert ODT to PDF directly?", a: "ODT files are ZIP archives containing complex XML with formatting, styles, and embedded objects. Parsing and rendering them accurately in a browser requires the full LibreOffice rendering engine." },
  { q: "How do I convert ODT to PDF?", a: "LibreOffice (free) has native ODT to PDF export: File > Export as PDF. Google Docs can also open ODT files — open in Google Docs, then File > Download > PDF. Both produce excellent results." },
  { q: "What about our DOC to PDF tool?", a: "Our DOC to PDF tool uses mammoth.js which primarily handles DOCX format. For ODT files, LibreOffice's built-in export (free, open-source) is the most accurate converter available." },
];

export default function OdtToPdfPage() {
  return (
    <PdfConverterStub
      title="ODT to PDF Converter"
      description="Convert ODT LibreOffice documents to PDF. Learn the best free methods for converting OpenDocument files to PDF — including LibreOffice's built-in PDF export."
      reason="Accurate ODT to PDF conversion requires the LibreOffice rendering engine which is too large to run in a browser. LibreOffice (free, desktop) has excellent built-in ODT to PDF export via File > Export as PDF."
      alternatives={[
        { name: "PDF to ODT (reverse)", href: "/pdf-to-odt" },
        { name: "DOC to PDF (DOCX support)", href: "/doc-to-pdf" },
        { name: "Word to PDF", href: "/word-to-pdf" },
      ]}
      faqs={faqs}
      relatedTools={[
        { name: "PDF to ODT", href: "/pdf-to-odt" },
        { name: "DOC to PDF", href: "/doc-to-pdf" },
        { name: "Word to PDF", href: "/word-to-pdf" },
      ]}
    />
  );
}
