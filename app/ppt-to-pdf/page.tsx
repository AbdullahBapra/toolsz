import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  { q: "What's the difference between PPT and PPTX?", a: "PPT is the legacy PowerPoint format (PowerPoint 97-2003 binary format). PPTX is the modern XML-based format (PowerPoint 2007+). Our PPTX to PDF converter handles modern .pptx files." },
  { q: "Can I convert my .pptx file to PDF here?", a: "Yes — use our PPTX to PDF converter. It accepts modern PowerPoint files (.pptx) and converts them to PDF, preserving slide layout, text, and formatting." },
  { q: "How do I convert an old .ppt file to PDF?", a: "Open the .ppt file in Microsoft PowerPoint (or LibreOffice Impress — free), then File > Save as PDF or File > Export > PDF. Both produce high-quality PDF output from PPT files." },
  { q: "Why is PPT to PDF conversion better done in PowerPoint?", a: "PowerPoint's built-in PDF export renders fonts, animations (as static), and complex layouts perfectly. Browser-based conversion of binary PPT files has limited fidelity for complex presentations." },
];

export default function PptToPdfPage() {
  return (
    <PdfConverterStub
      title="PPT to PDF Converter"
      description="Convert PPT PowerPoint presentations to PDF. Our PPTX to PDF tool supports modern .pptx files. Learn about PPT to PDF conversion options."
      reason="Legacy .ppt (binary format) conversion requires specialized parsing. For .pptx files, use our PPTX to PDF tool. For .ppt files, LibreOffice Impress (free) or Microsoft PowerPoint's built-in PDF export is the most accurate option."
      alternatives={[
        { name: "PPTX to PDF (use our tool)", href: "/pptx-to-pdf" },
        { name: "PDF to PNG (reverse — slides as images)", href: "/pdf-to-png" },
        { name: "LibreOffice Impress (free PPT to PDF)", href: "https://www.libreoffice.org", external: true },
      ]}
      faqs={faqs}
      relatedTools={[
        { name: "PPTX to PDF", href: "/pptx-to-pdf" },
        { name: "Word to PDF", href: "/word-to-pdf" },
        { name: "PDF to PNG", href: "/pdf-to-png" },
      ]}
    />
  );
}
