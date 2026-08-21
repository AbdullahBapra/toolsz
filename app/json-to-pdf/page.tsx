import DocToPdfConverter from "@/app/components/DocToPdfConverter";

const faqs = [
  { q: "How is the JSON formatted in the PDF?", a: "The JSON is pretty-printed with 2-space indentation, wrapped in a monospace code block with a light background — making it highly readable in the PDF output." },
  { q: "Why would I convert JSON to PDF?", a: "Common use cases: sharing API responses with non-technical stakeholders, attaching JSON configuration in a report, documenting webhook payloads, or archiving JSON data as a readable document." },
  { q: "Is there a file size limit?", a: "No enforced limit. Very large JSON files (5MB+) may take a few seconds to render. The conversion is local in your browser — performance depends on your device." },
  { q: "Can I convert a JSON array of objects to a table?", a: "Currently, JSON is rendered as pretty-printed code. For tabular JSON data (array of objects), consider converting to CSV first and using CSV to PDF for a formatted table layout." },
];

const relatedTools = [
  { name: "PDF to JSON", href: "/pdf-to-json" },
  { name: "CSV to PDF", href: "/csv-to-pdf" },
  { name: "XML to PDF", href: "/xml-to-pdf" },
  { name: "TXT to PDF", href: "/txt-to-pdf" },
];

export default function JsonToPdfPage() {
  return (
    <DocToPdfConverter
      conversionType="json"
      fromFormat="JSON"
      fromExts=".json,.JSON"
      title="JSON to PDF Converter"
      description="Convert JSON files to PDF — free, browser-based, no upload. JSON is pretty-printed in a readable monospace format. Perfect for sharing API responses and data files as documents."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
