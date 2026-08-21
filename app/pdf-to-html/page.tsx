import PdfToDocConverter from "@/app/components/PdfToDocConverter";

const faqs = [
  { q: "How does PDF to HTML conversion work?", a: "pdf.js extracts the text content from each PDF page. Each page is wrapped in an HTML div element with page headings and paragraph formatting. The output is a valid HTML document ready to open in any browser." },
  { q: "Will images and formatting from the PDF appear in the HTML?", a: "This tool extracts text content only. Images embedded in the PDF will not be included in the HTML output. For rich PDF-to-HTML with images, specialized tools like PDF.co or Adobe Export PDF are more suitable." },
  { q: "Can I use the HTML output on a website?", a: "Yes. The generated HTML is clean, well-structured, and includes basic styling. You can edit it in any text editor before publishing, or copy-paste sections into your CMS." },
  { q: "Is the PDF to HTML conversion accurate?", a: "Text content is extracted accurately. However, complex PDF layouts (multi-column text, tables, precise positioning) may not translate exactly to HTML structure. The output is a linear representation of the PDF text per page." },
];

const relatedTools = [
  { name: "PDF to Text", href: "/pdf-to-text" },
  { name: "PDF to Markdown", href: "/pdf-to-markdown" },
  { name: "HTML to PDF", href: "/html-to-pdf" },
  { name: "PDF to JSON", href: "/pdf-to-json" },
];

export default function PdfToHtmlPage() {
  return (
    <PdfToDocConverter
      toFormat="html"
      toExt="html"
      title="PDF to HTML Converter"
      description="Convert PDF text content to HTML — free, no upload, browser-based. Each page becomes an HTML section with clean styling. Export PDF content as a web page. No watermarks."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
