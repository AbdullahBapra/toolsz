import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  { q: "Can I convert a PDF presentation to PowerPoint?", a: "Yes — our PPTX to PDF tool works in reverse: it accepts PPTX files and outputs PDF. For PDF to PPTX, specialized tools like Adobe Acrobat, Zamzar, or Smallpdf can convert PDF presentations to editable PowerPoint." },
  { q: "How does PDF to PowerPoint conversion work?", a: "Professional tools detect PDF slides (each page = one slide) and convert each page to an editable PowerPoint slide with text boxes and image placeholders. This requires complex document reconstruction." },
  { q: "What's the best free PDF to PPT tool?", a: "Adobe Acrobat (with subscription), Smallpdf, and ILovePDF all offer PDF to PowerPoint conversion. Microsoft PowerPoint itself can open PDFs and render each page as an image slide." },
  { q: "Can I at least see PDF pages as images in PowerPoint?", a: "Yes. Convert your PDF to PNG images (one per page) using our PDF to PNG tool, then insert the images into blank PowerPoint slides. Each page becomes an image slide." },
];

export default function PdfToPptPage() {
  return (
    <PdfConverterStub
      title="PDF to PPT Converter"
      description="Convert PDF presentations to editable PowerPoint (PPT/PPTX) format. Learn about PDF to PowerPoint conversion and the best tools available."
      reason="PDF to PowerPoint conversion requires reconstructing editable slide layouts, text boxes, and formatting from a fixed-layout document. This requires server-side AI-assisted conversion not available in browser-based tools."
      alternatives={[
        { name: "Convert PPT/PPTX to PDF (reverse)", href: "/pptx-to-pdf" },
        { name: "Convert PDF to PNG (one image per slide)", href: "/pdf-to-png" },
        { name: "ILovePDF (PDF to PPT online)", href: "https://www.ilovepdf.com/pdf_to_powerpoint", external: true },
      ]}
      faqs={faqs}
      relatedTools={[
        { name: "PPTX to PDF", href: "/pptx-to-pdf" },
        { name: "PDF to PNG", href: "/pdf-to-png" },
        { name: "PDF to Word", href: "/pdf-to-word" },
      ]}
    />
  );
}
