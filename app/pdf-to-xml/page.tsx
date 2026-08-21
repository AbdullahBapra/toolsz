import PdfToDocConverter from "@/app/components/PdfToDocConverter";

const faqs = [
  { q: "What does the XML output look like?", a: "The XML has a root 'document' element with title and page count attributes, containing 'page' elements (each with a number attribute) holding the text content for that PDF page." },
  { q: "Why would I need PDF as XML?", a: "XML is widely used in enterprise document management, content management systems (CMS), publishing workflows (DITA, DocBook), and data exchange systems. Converting PDF to XML enables integration with these systems." },
  { q: "Is the XML valid and well-formed?", a: "Yes. The output is valid, well-formed XML with proper encoding declaration and escaped special characters (&, <, >). It can be parsed by any standard XML parser." },
  { q: "Can I use XPath or XSLT on the output?", a: "Yes. The generated XML can be processed with XPath queries and XSLT transformations to reshape the content for your specific needs." },
];

const relatedTools = [
  { name: "PDF to JSON", href: "/pdf-to-json" },
  { name: "PDF to CSV", href: "/pdf-to-csv" },
  { name: "PDF to HTML", href: "/pdf-to-html" },
  { name: "XML to PDF", href: "/xml-to-pdf" },
];

export default function PdfToXmlPage() {
  return (
    <PdfToDocConverter
      toFormat="xml"
      toExt="xml"
      title="PDF to XML Converter"
      description="Extract PDF text content as structured XML — free, browser-based, no upload. Each page wrapped in XML elements with page number attributes. Ideal for enterprise and data workflows."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
