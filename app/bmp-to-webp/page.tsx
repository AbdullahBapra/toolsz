import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  { q: "Why convert BMP to WebP?", a: "WebP offers excellent compression for both photos and graphics, typically achieving 25-35% smaller files than equivalent PNG or JPG. Converting from BMP to WebP can reduce file size by 20-50×." },
  { q: "Is WebP supported everywhere?", a: "WebP is supported by all modern browsers (Chrome, Firefox, Safari 14+, Edge). For older apps or legacy systems, PNG or JPG are safer choices. For web use, WebP is the modern standard." },
  { q: "Does WebP support transparency?", a: "Yes. WebP supports full alpha-channel transparency, making it a superior choice over JPG for images that need transparent backgrounds." },
];

const relatedTools = [
  { name: "WebP to BMP", href: "/webp-to-bmp" },
  { name: "BMP to PNG", href: "/bmp-to-png" },
  { name: "BMP to JPG", href: "/bmp-to-jpg" },
  { name: "PNG to WebP", href: "/png-to-webp" },
];

export default function BmpToWebpPage() {
  return (
    <ImageFormatConverter
      fromFormat="BMP"
      toFormat="WebP"
      fromExts=".bmp,.BMP"
      toMime="image/webp"
      toExt="webp"
      hasQuality={true}
      defaultQuality={0.92}
      isBulk={true}
      title="BMP to WebP Converter"
      description="Convert BMP to WebP for superior compression and web performance. Free, private, instant — no upload needed."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
