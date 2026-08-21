import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  { q: "What is AVIF format?", a: "AVIF (AV1 Image File Format) is a next-generation image format developed by the Alliance for Open Media. It offers 50% better compression than JPEG at the same quality, making it ideal for web use." },
  { q: "Why can't browsers encode AVIF directly from PDF?", a: "While modern browsers can display AVIF images, the ability to encode (create) AVIF files via the Canvas API has limited and inconsistent browser support. The encoding process is computationally intensive and not yet universally implemented." },
  { q: "What should I use instead of PDF to AVIF?", a: "Convert your PDF to PNG first (lossless, full quality), then use our PNG to WebP converter (similar compression benefits to AVIF) or a dedicated AVIF encoder like Squoosh.app." },
  { q: "Is AVIF better than WebP?", a: "AVIF typically achieves 20-30% better compression than WebP at the same quality. However, WebP has broader browser support and better encoder availability. For most web use cases, WebP is the practical choice today." },
];

const relatedTools = [
  { name: "PDF to PNG", href: "/pdf-to-png" },
  { name: "PDF to WebP", href: "/pdf-to-webp" },
  { name: "PDF to JPG", href: "/pdf-to-jpg" },
  { name: "AVIF to PDF", href: "/avif-to-pdf" },
];

export default function PdfToAvifPage() {
  return (
    <PdfConverterStub
      title="PDF to AVIF Converter"
      description="Convert PDF pages to AVIF next-gen images. AVIF offers superior compression — learn about the format and the best tools to use."
      reason="AVIF encoding via the browser Canvas API has limited and inconsistent support across browsers. We recommend converting to PNG (lossless) or WebP (excellent compression) instead — both work perfectly in this tool."
      alternatives={[
        { name: "Convert to PNG instead", href: "/pdf-to-png" },
        { name: "Convert to WebP instead", href: "/pdf-to-webp" },
        { name: "Squoosh (AVIF encoder)", href: "https://squoosh.app", external: true },
      ]}
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
