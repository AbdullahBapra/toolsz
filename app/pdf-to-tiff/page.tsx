import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  { q: "What is TIFF format?", a: "TIFF (Tagged Image File Format) is a flexible lossless image format widely used in professional photography, medical imaging, printing, and document scanning. TIFF supports multiple pages, multiple layers, and various color depths." },
  { q: "Why can't browsers output TIFF files?", a: "The HTML5 Canvas API does not include TIFF in its supported output formats. TIFF encoding is complex (supporting many variants like LZW, ZIP, uncompressed) and is not implemented in browser canvas." },
  { q: "What should I use instead for PDF to TIFF?", a: "For lossless output, use PDF to PNG — PNG is universally supported and lossless like TIFF. For specific TIFF requirements (multi-page TIFF, CMYK), use Adobe Acrobat, GIMP, or ImageMagick." },
  { q: "Who needs PDF to TIFF conversion?", a: "PDF to TIFF is commonly needed in medical imaging (DICOM workflows), archival scanning (archival TIFF standard), print prepress (CMYK TIFF), and legal document systems that require TIFF format." },
];

const relatedTools = [
  { name: "PDF to PNG", href: "/pdf-to-png" },
  { name: "PDF to JPG", href: "/pdf-to-jpg" },
  { name: "TIFF to PDF", href: "/tiff-to-pdf" },
];

export default function PdfToTiffPage() {
  return (
    <PdfConverterStub
      title="PDF to TIFF Converter"
      description="Convert PDF pages to TIFF images. Learn about TIFF format requirements and the best tools for professional PDF to TIFF conversion."
      reason="Browsers cannot encode TIFF files natively. For lossless PDF-to-image conversion, PNG is an excellent alternative. For specific TIFF requirements (multi-page, CMYK), use Adobe Acrobat, GIMP, or ImageMagick."
      alternatives={[
        { name: "Convert to PNG instead (lossless)", href: "/pdf-to-png" },
        { name: "Convert to JPG instead", href: "/pdf-to-jpg" },
      ]}
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
