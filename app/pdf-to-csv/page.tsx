import PdfToDocConverter from "@/app/components/PdfToDocConverter";

const faqs = [
  { q: "How does PDF to CSV conversion work?", a: "The tool uses pdf.js to extract all text from each PDF page. Each page becomes one row in the CSV with 'Page' and 'Content' columns. Text extraction preserves content but not complex table formatting." },
  { q: "Will tables from my PDF be converted to CSV properly?", a: "Basic text extraction may not perfectly reconstruct complex table layouts. For PDFs with tabular data, the CSV will contain the text content. For precise table extraction, specialized OCR tools like Adobe Acrobat or Tabula are more accurate." },
  { q: "What encoding is the CSV in?", a: "The CSV is encoded in UTF-8, the universal standard. It opens correctly in Excel, Google Sheets, and any data processing tool that supports UTF-8 CSV files." },
  { q: "Is the conversion private?", a: "Yes. All text extraction uses pdf.js running locally in your browser. Your PDF is never uploaded to any server." },
];

const relatedTools = [
  { name: "PDF to JSON", href: "/pdf-to-json" },
  { name: "PDF to Excel", href: "/pdf-to-excel" },
  { name: "PDF to Text", href: "/pdf-to-text" },
  { name: "CSV to PDF", href: "/csv-to-pdf" },
  { name: "PDF to HTML", href: "/pdf-to-html" },
];

export default function PdfToCsvPage() {
  return (
    <PdfToDocConverter
      toFormat="csv"
      toExt="csv"
      title="PDF to CSV Converter"
      description="Extract text from PDF pages and export as CSV — free, browser-based, no upload. Each page becomes a CSV row. Useful for data extraction and analysis workflows."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
