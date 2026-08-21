import DocToPdfConverter from "@/app/components/DocToPdfConverter";

const faqs = [
  { q: "How is my CSV converted to PDF?", a: "The CSV is parsed into a formatted HTML table with styled headers and alternating rows, then rendered to a PDF using html2pdf.js. The result is a clean, professional table on A4 pages." },
  { q: "What CSV formats are supported?", a: "Standard comma-separated CSV files are supported, including quoted fields and escaped commas. Both .csv extension files are accepted. UTF-8 encoding is recommended for best results with special characters." },
  { q: "Will all my columns be included?", a: "Yes. All columns and rows from the first CSV file are included. The first row is treated as a header row with bold styling. Columns are sized proportionally to fit the A4 page width." },
  { q: "Is there a row limit?", a: "No enforced limit. However, very large CSV files (10,000+ rows) will produce large PDFs and take longer to process. The conversion happens locally in your browser — performance depends on your device." },
];

const relatedTools = [
  { name: "PDF to CSV", href: "/pdf-to-csv" },
  { name: "Excel to PDF", href: "/excel-to-pdf" },
  { name: "TXT to PDF", href: "/txt-to-pdf" },
  { name: "JSON to PDF", href: "/json-to-pdf" },
];

export default function CsvToPdfPage() {
  return (
    <DocToPdfConverter
      conversionType="csv"
      fromFormat="CSV"
      fromExts=".csv,.CSV"
      title="CSV to PDF Converter"
      description="Convert CSV spreadsheet files to PDF — free, browser-based, no upload. CSV data is formatted as a styled table in a professional PDF document. Instant download, no watermarks."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
