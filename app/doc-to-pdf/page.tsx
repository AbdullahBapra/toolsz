import DocToPdfConverter from "@/app/components/DocToPdfConverter";

const faqs = [
  { q: "What Word file formats does this support?", a: "This converter supports both .docx (Word 2007+) and .doc (Word 97-2003) files using the mammoth.js library, which handles text extraction and HTML conversion for both formats." },
  { q: "Will my Word formatting be preserved in the PDF?", a: "Mammoth.js converts common Word formatting to HTML: paragraphs, headings, bold, italic, lists, and tables are all transferred. Complex features like tracked changes, custom styles, or macros are simplified." },
  { q: "What's the difference between this and Word to PDF?", a: "Both convert Word documents to PDF. This page specifically targets users searching for '.doc to PDF' conversion. Functionally, they use the same conversion process with mammoth.js." },
  { q: "Can I convert password-protected Word files?", a: "Password-protected DOC/DOCX files cannot be converted without removing the password first. Open the file in Word, remove the password protection under Review > Protect Document, then re-upload." },
];

const relatedTools = [
  { name: "Word to PDF", href: "/word-to-pdf" },
  { name: "PDF to Word", href: "/pdf-to-word" },
  { name: "RTF to PDF", href: "/rtf-to-pdf" },
  { name: "TXT to PDF", href: "/txt-to-pdf" },
];

export default function DocToPdfPage() {
  return (
    <DocToPdfConverter
      conversionType="doc"
      fromFormat="DOC"
      fromExts=".doc,.docx,.DOC,.DOCX"
      title="DOC to PDF Converter"
      description="Convert DOC and DOCX Word documents to PDF — free, browser-based, no upload. Formatting, paragraphs, headings, and lists preserved. Instant download, no watermarks."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
