import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  { q: "Why convert WebP to BMP?", a: "BMP is required by some legacy Windows software, older graphics tools, and certain hardware or embedded systems that don't support modern formats. If your software requires uncompressed bitmap input, this converter handles it." },
  { q: "How much larger will the BMP be?", a: "Significantly larger. WebP is very efficient — a 100 KB WebP might become 5-20 MB as BMP. BMP stores completely uncompressed raw pixel data." },
  { q: "Does BMP support WebP transparency?", a: "This tool creates 24-bit BMP (no alpha channel). Transparent areas will be filled with white. For transparency-preserving conversions, use PNG instead." },
];

const relatedTools = [
  { name: "BMP to WebP", href: "/bmp-to-webp" },
  { name: "PNG to BMP", href: "/png-to-bmp" },
  { name: "WebP to PNG", href: "/webp-to-png" },
  { name: "JPG to BMP", href: "/jpg-to-bmp" },
];

export default function WebpToBmpPage() {
  return (
    <ImageFormatConverter
      fromFormat="WebP"
      toFormat="BMP"
      fromExts=".webp,.WEBP"
      toMime="image/bmp"
      toExt="bmp"
      useBmpEncoder={true}
      hasQuality={false}
      isBulk={true}
      title="WebP to BMP Converter"
      description="Convert WebP to BMP (Bitmap) format online. Uncompressed 24-bit BMP output for legacy software compatibility. Free, private, instant — no upload needed."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
