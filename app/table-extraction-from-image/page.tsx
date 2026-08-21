import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  {
    q: "How does table extraction from images work?",
    a: "Our Screenshot to Table tool uses Tesseract OCR to read all text in the image, then analyzes the word positions and x-coordinates to reconstruct column alignment. It groups words into rows by y-position and clusters x-positions to find column boundaries — producing a structured table that can be exported as CSV or Excel.",
  },
  {
    q: "What types of tables work best with image OCR?",
    a: "Simple tables with clear grid lines or consistent column spacing give the best results. Tables with merged cells, complex formatting, or colored backgrounds may extract with some misalignment. High-contrast images (dark text, white background, clear table borders) produce the most accurate extraction.",
  },
  {
    q: "Can I extract tables from PDF screenshots?",
    a: "Yes — take a screenshot of the PDF page containing the table and upload it to our Screenshot to Table tool. For PDFs with selectable text (not scanned), consider using our PDF to CSV tool at /pdf-to-csv which can extract tables from the PDF directly without OCR.",
  },
];

const relatedTools = [
  { name: "Screenshot to Table", href: "/screenshot-to-table" },
  { name: "Image to Text", href: "/image-to-text" },
  { name: "PDF to CSV", href: "/pdf-to-csv" },
];

export default function TableExtractionFromImagePage() {
  return (
    <PdfConverterStub
      title="Table Extraction from Image"
      description="Extract tables from images and screenshots into structured CSV or Excel format. Upload an image containing a table and get clean, editable tabular data."
      reason="Use our Screenshot to Table tool — it's specifically designed to extract tabular data from images into structured CSV format."
      alternatives={[
        { name: "Screenshot to Table (our tool)", href: "/screenshot-to-table" },
        { name: "Image to Text (OCR)", href: "/image-to-text" },
      ]}
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
