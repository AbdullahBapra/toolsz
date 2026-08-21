import PdfToDocConverter from "@/app/components/PdfToDocConverter";

const faqs = [
  { q: "How is PDF content converted to Markdown?", a: "Text is extracted from each PDF page using pdf.js. Each page becomes a Markdown section with '## Page N' heading followed by the extracted text. The result is a clean .md file." },
  { q: "Why convert PDF to Markdown?", a: "Markdown is the preferred format for documentation, README files, wikis (Notion, Confluence), GitHub, and static site generators. Converting PDF to Markdown makes content editable and portable." },
  { q: "Will complex PDF formatting transfer to Markdown?", a: "Basic text content transfers well. Complex formatting like bold text, bullet lists, tables, and headings require manual cleanup after extraction since PDF layout information is not directly mappable to Markdown syntax." },
  { q: "Can I use the Markdown output in GitHub or Notion?", a: "Yes. The generated .md file can be opened directly in any Markdown editor or pasted into Notion, GitHub, Confluence, or any Markdown-supporting platform after reviewing the output." },
];

const relatedTools = [
  { name: "PDF to HTML", href: "/pdf-to-html" },
  { name: "PDF to Text", href: "/pdf-to-text" },
  { name: "Markdown to PDF", href: "/markdown-to-pdf" },
  { name: "PDF to JSON", href: "/pdf-to-json" },
];

export default function PdfToMarkdownPage() {
  return (
    <PdfToDocConverter
      toFormat="markdown"
      toExt="md"
      title="PDF to Markdown Converter"
      description="Convert PDF text to Markdown — free, browser-based, no upload. Each page becomes a Markdown section. Perfect for documentation, wikis, and GitHub. No watermarks."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
