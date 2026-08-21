import ImagesToPdfConverter from "@/app/components/ImagesToPdfConverter";

const faqs = [
  { q: "What is HEIC format?", a: "HEIC (High Efficiency Image Container) is the default photo format on iPhones since iOS 11. It uses HEVC compression to store photos at half the file size of JPEG with the same visual quality." },
  { q: "How do I convert iPhone HEIC photos to PDF?", a: "Upload your HEIC file(s) from your iPhone or computer. The converter uses heic2any to decode the HEIC locally in your browser, then embeds it into a PDF. No upload to any server." },
  { q: "Why won't my PDF reader open HEIC files?", a: "PDF readers don't open HEIC files directly — they're separate formats. This tool converts the HEIC into a PDF document that any PDF reader can open, across all platforms including Windows." },
  { q: "Can I convert multiple iPhone photos (HEIC) to one PDF at once?", a: "Yes. Upload multiple HEIC files and they are combined into a single multi-page PDF — perfect for assembling a photo album or sending multiple iPhone photos as a single document." },
  { q: "Is this HEIC to PDF conversion private?", a: "Yes. HEIC decoding happens entirely in your browser using the heic2any library. Your photos never leave your device. No cloud processing, no data retention." },
];

const relatedTools = [
  { name: "JPG to PDF", href: "/jpg-to-pdf" },
  { name: "PNG to PDF", href: "/png-to-pdf" },
  { name: "HEIC to JPG", href: "/heic-to-jpg" },
  { name: "Image to PDF", href: "/image-to-pdf" },
];

export default function HeicToPdfPage() {
  return (
    <ImagesToPdfConverter
      fromFormat="HEIC"
      fromExts=".heic,.heif,.HEIC,.HEIF"
      isBulk={true}
      title="HEIC to PDF Converter"
      description="Convert iPhone HEIC photos to PDF in your browser — free, private, no upload. Works with .heic and .heif files. Combine multiple iPhone photos into one PDF. No watermarks."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
