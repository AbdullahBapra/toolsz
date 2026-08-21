import DocToPdfConverter from "@/app/components/DocToPdfConverter";

const faqs = [
  { q: "What is RTF format?", a: "RTF (Rich Text Format) is a document format developed by Microsoft in 1987. It's supported by almost all word processors (WordPad, LibreOffice, Word) and is a universal interchange format for formatted text." },
  { q: "How is RTF converted to PDF?", a: "Mammoth.js reads the RTF file, extracts the formatted content as HTML (preserving headings, bold, italic, lists), and html2pdf.js renders it to a clean PDF document." },
  { q: "Will all RTF formatting be preserved?", a: "Common formatting (paragraphs, bold, italic, headings, bullet lists) is converted well. Complex RTF features like custom styles, embedded objects, or special character styles may be simplified in the PDF output." },
  { q: "Is RTF still used today?", a: "Yes. RTF is used in legal documents (some courts require RTF submissions), cross-platform document exchange, email clients with RTF format, and legacy systems. Converting to PDF makes RTF documents universally viewable." },
];

const relatedTools = [
  { name: "DOC to PDF", href: "/doc-to-pdf" },
  { name: "Word to PDF", href: "/word-to-pdf" },
  { name: "TXT to PDF", href: "/txt-to-pdf" },
  { name: "PDF to Text", href: "/pdf-to-text" },
];

export default function RtfToPdfPage() {
  return (
    <DocToPdfConverter
      conversionType="doc"
      fromFormat="RTF"
      fromExts=".rtf,.RTF"
      title="RTF to PDF Converter"
      description="Convert RTF Rich Text Format files to PDF — free, browser-based, no upload. RTF formatting including headings, bold, lists are preserved in the PDF output. No watermarks."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
