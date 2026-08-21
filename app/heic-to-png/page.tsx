import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  { q: "Can I convert HEIC to PNG in the browser?", a: "Yes! Our HEIC to JPG tool supports PNG output — select 'PNG' as the output format to convert HEIC files to lossless PNG with full transparency support, all in your browser without any uploads." },
  { q: "Why choose PNG over JPG for HEIC conversion?", a: "PNG is lossless — it preserves every pixel from the HEIC source without any additional compression artifacts. Choose PNG when you need the highest quality, plan to edit the image further, or need transparency support." },
  { q: "Will PNG files be much larger than the original HEIC?", a: "Yes. HEIC uses efficient lossy compression, while PNG is lossless. A 3 MB HEIC photo might become a 20-40 MB PNG. For most purposes, JPG at 92%+ quality or WebP are better choices for smaller file sizes." },
  { q: "Does PNG preserve HEIC quality better than JPG?", a: "PNG is lossless so it introduces no new quality loss. JPG at 92% quality introduces minimal additional loss that's imperceptible for most photos. For archival or editing purposes, PNG is ideal. For sharing, JPG or WebP are more practical." },
];

const relatedTools = [
  { name: "HEIC to JPG (+ PNG/WebP options)", href: "/heic-to-jpg" },
  { name: "PNG to JPG", href: "/png-to-jpg" },
  { name: "Compress Image", href: "/compress-image" },
];

export default function HeicToPngPage() {
  return (
    <PdfConverterStub
      title="HEIC to PNG Converter"
      description="Convert iPhone HEIC photos to PNG. Use our multi-format HEIC converter — select PNG output for lossless quality with transparency support."
      reason="Our HEIC to JPG tool supports PNG output directly. Click the link below, select your HEIC files, choose 'PNG' as the output format, and convert — no upload needed, runs entirely in your browser."
      alternatives={[
        { name: "HEIC to JPG Tool (select PNG output)", href: "/heic-to-jpg" },
        { name: "Compress Image (after converting)", href: "/compress-image" },
        { name: "PNG to WebP (after converting)", href: "/png-to-webp" },
      ]}
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
