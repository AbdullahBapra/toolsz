import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  { q: "What is HEIC format?", a: "HEIC (High Efficiency Image Container) is Apple's default photo format for iPhones (since iOS 11). It stores images using HEVC compression, achieving half the file size of JPEG at the same visual quality." },
  { q: "Why can't browsers encode HEIC files?", a: "HEIC encoding requires the HEVC codec, which is proprietary and patent-encumbered. Browsers do not include HEVC encoders. Only Apple devices with hardware HEVC encoders (iPhones, newer Macs) can create HEIC files." },
  { q: "What should I use instead of PDF to HEIC?", a: "PNG and WebP are excellent alternatives. PNG is lossless (perfect for text/diagrams), WebP achieves similar compression to HEIC and is widely supported. Use PDF to PNG or PDF to WebP instead." },
  { q: "Who needs HEIC output specifically?", a: "HEIC is primarily used in Apple ecosystems. If you need to send images to iPhone users, converting to JPEG or PNG is actually more compatible — iPhones can open both formats perfectly." },
];

const relatedTools = [
  { name: "PDF to PNG", href: "/pdf-to-png" },
  { name: "PDF to JPG", href: "/pdf-to-jpg" },
  { name: "HEIC to PDF", href: "/heic-to-pdf" },
  { name: "HEIC to JPG", href: "/heic-to-jpg" },
];

export default function PdfToHeicPage() {
  return (
    <PdfConverterStub
      title="PDF to HEIC Converter"
      description="Convert PDF pages to HEIC format. Learn about HEIC encoding limitations in browsers and the best alternatives for PDF to image conversion."
      reason="Encoding HEIC files requires Apple's HEVC codec, which is not available in web browsers. For efficient compressed output, use PDF to WebP (similar compression to HEIC, universally supported) or PDF to PNG for lossless output."
      alternatives={[
        { name: "Convert to WebP instead", href: "/pdf-to-webp" },
        { name: "Convert to PNG instead", href: "/pdf-to-png" },
        { name: "Convert to JPG instead", href: "/pdf-to-jpg" },
      ]}
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
