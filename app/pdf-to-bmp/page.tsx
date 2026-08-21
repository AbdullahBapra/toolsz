import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  { q: "What is BMP format?", a: "BMP (Bitmap) is an uncompressed raster image format developed by Microsoft. BMP files store raw pixel data without any compression, making them very large but perfectly lossless — a 1920×1080 BMP is typically 5-6MB." },
  { q: "Why can't browsers export BMP files?", a: "The HTML5 Canvas API does not include BMP as a supported output format in canvas.toBlob(). Browsers can read BMP files but cannot create them without a custom BMP encoder implementation." },
  { q: "What should I use instead of PDF to BMP?", a: "PNG is a lossless format like BMP but with excellent compression (typically 5-10× smaller). Converting PDF to PNG gives you the same lossless pixel data as BMP without the huge file sizes." },
  { q: "Who needs BMP output from PDF?", a: "BMP is mainly used in legacy Windows applications, some medical imaging systems, and specific industrial software that requires uncompressed bitmap input. Most modern workflows accept PNG as a superior BMP replacement." },
];

const relatedTools = [
  { name: "PDF to PNG", href: "/pdf-to-png" },
  { name: "PDF to JPG", href: "/pdf-to-jpg" },
  { name: "BMP to PDF", href: "/bmp-to-pdf" },
];

export default function PdfToBmpPage() {
  return (
    <PdfConverterStub
      title="PDF to BMP Converter"
      description="Convert PDF pages to BMP bitmap images. Learn why BMP encoding isn't browser-native and which lossless format to use instead."
      reason="Browsers cannot encode BMP files natively — the HTML5 Canvas API doesn't support BMP output. PNG is an identical lossless alternative that's 5-10× smaller and universally compatible."
      alternatives={[
        { name: "Convert to PNG instead (lossless)", href: "/pdf-to-png" },
        { name: "Convert to JPG instead", href: "/pdf-to-jpg" },
      ]}
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
