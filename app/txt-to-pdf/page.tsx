import DocToPdfConverter from "@/app/components/DocToPdfConverter";

const faqs = [
  { q: "What text files can I convert to PDF?", a: "Any plain text file (.txt) created in Notepad, TextEdit, VS Code, or any text editor. The file is formatted in a monospace preformatted style in the PDF to preserve the original line breaks and spacing." },
  { q: "Will the PDF preserve my text formatting?", a: "Line breaks, indentation, and spacing are preserved using preformatted text rendering. Character formatting like bold or italic (if written as markdown or ASCII art) is preserved as-is since plain text has no formatting markup." },
  { q: "What encoding does this support?", a: "UTF-8 text files work best. ASCII text files also work perfectly. Files with other encodings (like Windows-1252) may have issues with special characters." },
  { q: "Can I convert code files (.js, .py) to PDF?", a: "Yes. Code files are text files and can be converted to PDF. The output uses a monospace font that preserves code formatting. Rename the file to .txt if the uploader doesn't accept the original extension." },
];

const relatedTools = [
  { name: "PDF to Text", href: "/pdf-to-text" },
  { name: "Markdown to PDF", href: "/markdown-to-pdf" },
  { name: "CSV to PDF", href: "/csv-to-pdf" },
  { name: "HTML to PDF", href: "/html-to-pdf" },
];

export default function TxtToPdfPage() {
  return (
    <DocToPdfConverter
      conversionType="txt"
      fromFormat="TXT"
      fromExts=".txt,.text,.TXT"
      title="TXT to PDF Converter"
      description="Convert plain text files to PDF — free, browser-based, no upload. Text is formatted in a clean, readable PDF with monospace font and preserved line breaks. No watermarks."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
