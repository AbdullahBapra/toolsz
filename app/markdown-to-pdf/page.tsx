import DocToPdfConverter from "@/app/components/DocToPdfConverter";

const faqs = [
  { q: "Which Markdown elements are supported?", a: "Headings (# ## ###), bold (**text**), italic (*text*), inline code (`code`), bullet lists (- item), and paragraphs are all converted to styled HTML and rendered in the PDF." },
  { q: "Why convert Markdown to PDF?", a: "Markdown is a plain-text format not universally renderable. Converting to PDF makes it shareable with anyone — no Markdown renderer needed. Perfect for documentation, README files, and reports written in Markdown." },
  { q: "Will code blocks be styled in the PDF?", a: "Inline code (`code`) is styled with a light background. Full fenced code blocks (``` ``` ```) are rendered as preformatted text with a light gray background in the PDF output." },
  { q: "Can I convert a GitHub README.md to PDF?", a: "Yes. Download the raw .md file from GitHub and upload it here. Headings, lists, bold/italic, and code will all be styled in the PDF output." },
];

const relatedTools = [
  { name: "PDF to Markdown", href: "/pdf-to-markdown" },
  { name: "TXT to PDF", href: "/txt-to-pdf" },
  { name: "HTML to PDF", href: "/html-to-pdf" },
  { name: "PDF to HTML", href: "/pdf-to-html" },
];

export default function MarkdownToPdfPage() {
  return (
    <DocToPdfConverter
      conversionType="markdown"
      fromFormat="Markdown"
      fromExts=".md,.markdown,.MD"
      title="Markdown to PDF Converter"
      description="Convert Markdown files to PDF — free, browser-based, no upload. Headings, bold, italic, code, and lists are styled in the PDF output. Perfect for README files and documentation."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
