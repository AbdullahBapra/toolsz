import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  { q: "What is ODT format?", a: "ODT (OpenDocument Text) is the open-standard document format used by LibreOffice, OpenOffice, and Google Docs. It's fully free, no license required, and works across platforms." },
  { q: "How do I convert PDF to ODT?", a: "LibreOffice can open PDF files directly (File > Open > choose PDF) and save them as ODT. This is the most accurate free PDF to ODT method available." },
  { q: "Why is PDF to ODT not browser-based?", a: "Creating ODT files requires writing an OpenDocument XML package (a ZIP with specific XML files). While technically possible, browser-based PDF-to-ODT with accurate formatting reconstruction is not yet implemented in this tool." },
  { q: "Can I convert PDF to Word and open in LibreOffice?", a: "Yes. Use our PDF to Word converter to get a DOCX file, then open it in LibreOffice Writer. You can then save it as ODT via File > Save As > ODF Text Document (.odt)." },
];

export default function PdfToOdtPage() {
  return (
    <PdfConverterStub
      title="PDF to ODT Converter"
      description="Convert PDF to ODT (OpenDocument Text) for LibreOffice and OpenOffice. Learn about PDF to ODT conversion and the best free tools."
      reason="Browser-based PDF to ODT conversion with accurate formatting is not yet implemented. LibreOffice (free, desktop) provides excellent PDF to ODT conversion via File > Open. Alternatively, convert to DOCX first."
      alternatives={[
        { name: "PDF to Word (convert to DOCX)", href: "/pdf-to-word" },
        { name: "PDF to Text (plain content)", href: "/pdf-to-text" },
        { name: "ODT to PDF", href: "/odt-to-pdf" },
      ]}
      faqs={faqs}
      relatedTools={[
        { name: "PDF to Word", href: "/pdf-to-word" },
        { name: "ODT to PDF", href: "/odt-to-pdf" },
        { name: "PDF to HTML", href: "/pdf-to-html" },
      ]}
    />
  );
}
