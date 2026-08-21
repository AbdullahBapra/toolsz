import DocToPdfConverter from "@/app/components/DocToPdfConverter";

const faqs = [
  { q: "How is XML formatted in the PDF?", a: "The XML content is rendered as preformatted monospace text with a light code-style background in the PDF — preserving the XML tree structure, indentation, and tags for easy reading." },
  { q: "Why convert XML to PDF?", a: "XML is not directly readable without an XML viewer. Converting to PDF makes XML content shareable and printable for non-technical audiences — useful for sharing configuration files, SOAP responses, or data exports." },
  { q: "Will large XML files work?", a: "Yes, but very large XML files (multiple MB) may take longer to process. The conversion is fully local in your browser — no file size limits are enforced." },
  { q: "Can I convert SVG files (which are XML) to PDF?", a: "SVG files are technically XML, but this tool treats them as text/code. For proper SVG to PDF conversion (rendering the actual graphic), use our SVG to PDF converter instead." },
];

const relatedTools = [
  { name: "PDF to XML", href: "/pdf-to-xml" },
  { name: "JSON to PDF", href: "/json-to-pdf" },
  { name: "CSV to PDF", href: "/csv-to-pdf" },
  { name: "HTML to PDF", href: "/html-to-pdf" },
];

export default function XmlToPdfPage() {
  return (
    <DocToPdfConverter
      conversionType="xml"
      fromFormat="XML"
      fromExts=".xml,.XML"
      title="XML to PDF Converter"
      description="Convert XML files to PDF — free, browser-based, no upload. XML is formatted as readable preformatted text in a clean PDF document. Instant download, no watermarks."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
