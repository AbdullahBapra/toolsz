import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  { q: "Can I convert HEIC to WebP in the browser?", a: "Yes! Our HEIC to JPG tool supports WebP output — select 'WebP' as the output format to convert HEIC photos to WebP directly in your browser, with no file uploads needed." },
  { q: "Why choose WebP over JPG for HEIC conversion?", a: "WebP typically produces 25-35% smaller files than JPG at equivalent quality. It also supports transparency. For web use, WebP is the modern standard — smaller, sharper, and widely supported in all modern browsers." },
  { q: "How does WebP compare to keeping the HEIC format?", a: "HEIC generally achieves slightly better compression than WebP at equivalent quality, but WebP has far broader support outside Apple devices. For web use or sharing outside iOS/macOS, WebP is more practical." },
];

const relatedTools = [
  { name: "HEIC to JPG (+ WebP/PNG options)", href: "/heic-to-jpg" },
  { name: "WebP to JPG", href: "/webp-to-jpg" },
  { name: "Compress Image", href: "/compress-image" },
];

export default function HeicToWebpPage() {
  return (
    <PdfConverterStub
      title="HEIC to WebP Converter"
      description="Convert iPhone HEIC photos to WebP. Use our multi-format HEIC converter — select WebP output for smaller, modern web-optimized images."
      reason="Our HEIC to JPG tool supports WebP output directly. Click the link below, select your HEIC files, choose 'WebP' as the output format, and convert — no upload needed, runs entirely in your browser."
      alternatives={[
        { name: "HEIC to JPG Tool (select WebP output)", href: "/heic-to-jpg" },
        { name: "WebP to PNG (after converting)", href: "/webp-to-png" },
        { name: "Compress Image", href: "/compress-image" },
      ]}
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
