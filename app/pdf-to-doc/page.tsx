import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  { q: "What is the difference between DOC and DOCX?", a: "DOC is the legacy binary Word format (Word 97-2003). DOCX is the modern XML-based format (Word 2007+). DOCX is smaller, more reliable, and universally supported. Our PDF to Word tool outputs the modern DOCX format." },
  { q: "Can I use the PDF to Word converter instead?", a: "Yes — our PDF to Word converter converts your PDF to DOCX (the modern Word format), which opens in all versions of Microsoft Word and is fully editable." },
  { q: "How do I save a DOCX as a DOC file?", a: "Open the DOCX in Microsoft Word, click File > Save As > Word 97-2003 Document (.doc). In LibreOffice, go to File > Save As > Microsoft Word 97-2003 (.doc)." },
];

export default function PdfToDocPage() {
  return (
    <PdfConverterStub
      title="PDF to DOC Converter"
      description="Convert PDF to DOC Word document format. Our PDF to Word tool outputs modern DOCX format — editable in all versions of Word."
      reason="We output PDF to DOCX (the modern Word format, fully compatible with all Word versions). DOCX is better than the legacy DOC format — it's smaller, more reliable, and opens in every modern word processor."
      alternatives={[
        { name: "PDF to Word (DOCX format)", href: "/pdf-to-word" },
        { name: "PDF to Text", href: "/pdf-to-text" },
        { name: "DOC to PDF", href: "/doc-to-pdf" },
      ]}
      faqs={faqs}
      relatedTools={[
        { name: "PDF to Word", href: "/pdf-to-word" },
        { name: "DOC to PDF", href: "/doc-to-pdf" },
        { name: "PDF to HTML", href: "/pdf-to-html" },
      ]}
    />
  );
}
