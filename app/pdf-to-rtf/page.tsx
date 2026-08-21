import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  { q: "What is RTF format?", a: "RTF (Rich Text Format) is a document format from 1987 that's universally supported by word processors. Unlike DOCX, RTF is human-readable and works in WordPad, LibreOffice, and every major word processor without plugins." },
  { q: "Why is PDF to RTF complex?", a: "Converting PDF to editable RTF requires reconstructing text flow, formatting, tables, and styles from a fixed-layout format. This requires deep document parsing beyond what browser APIs support." },
  { q: "What's the best free tool for PDF to RTF?", a: "Adobe Acrobat can export PDF to RTF. LibreOffice Draw can open PDFs and save as ODT/RTF. Smallpdf and PDF2Doc online offer browser-based PDF to Word/RTF conversion." },
  { q: "Can I use PDF to Word and then save as RTF?", a: "Yes. Convert PDF to Word using our PDF to Word tool, open the DOCX in LibreOffice or Microsoft Word, then File > Save As > RTF format." },
];

export default function PdfToRtfPage() {
  return (
    <PdfConverterStub
      title="PDF to RTF Converter"
      description="Convert PDF to RTF (Rich Text Format) — editable by any word processor. Learn about PDF to RTF conversion and discover the best tools."
      reason="PDF to RTF conversion requires reconstructing editable text flow and formatting from a fixed-layout format. This requires server-side document processing not available in browser-based tools."
      alternatives={[
        { name: "PDF to Word (use our tool)", href: "/pdf-to-word" },
        { name: "PDF to Text (extract content)", href: "/pdf-to-text" },
        { name: "PDF to HTML (another editable format)", href: "/pdf-to-html" },
      ]}
      faqs={faqs}
      relatedTools={[
        { name: "PDF to Word", href: "/pdf-to-word" },
        { name: "PDF to Text", href: "/pdf-to-text" },
        { name: "RTF to PDF", href: "/rtf-to-pdf" },
      ]}
    />
  );
}
