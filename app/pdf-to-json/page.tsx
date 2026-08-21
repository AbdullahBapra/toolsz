import PdfToDocConverter from "@/app/components/PdfToDocConverter";

const faqs = [
  { q: "What does the JSON output look like?", a: "The JSON has a 'source' field (filename), 'pageCount' field, and a 'pages' array where each item has 'page' (number) and 'text' (the extracted text for that page)." },
  { q: "Why would I want PDF text as JSON?", a: "JSON is the universal data format for APIs and code. Converting PDF to JSON lets you feed PDF content into scripts, databases, AI/ML pipelines, search indexes, or any JSON-consuming application." },
  { q: "Can I extract metadata from the PDF too?", a: "The current output includes page-by-page text. PDF metadata (author, creation date, title) extraction can be done additionally via pdf.js — this tool focuses on content text extraction." },
  { q: "Is the extraction accurate for all PDF types?", a: "Text-based PDFs extract accurately. Scanned PDFs (images of text without OCR) will show empty text — they require OCR processing which is a separate step." },
];

const relatedTools = [
  { name: "PDF to CSV", href: "/pdf-to-csv" },
  { name: "PDF to XML", href: "/pdf-to-xml" },
  { name: "PDF to Text", href: "/pdf-to-text" },
  { name: "JSON to PDF", href: "/json-to-pdf" },
  { name: "PDF to Data", href: "/pdf-to-data" },
];

export default function PdfToJsonPage() {
  return (
    <PdfToDocConverter
      toFormat="json"
      toExt="json"
      title="PDF to JSON Converter"
      description="Extract PDF text as structured JSON — free, browser-based, no upload. Each page's text exported with page number metadata. Perfect for APIs, scripts, and data processing."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
