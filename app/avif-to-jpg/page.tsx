import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  { q: "Why convert AVIF to JPG?", a: "JPG is universally supported by every browser, OS, and application. While AVIF offers better compression, not all tools can open AVIF files. Converting to JPG ensures maximum compatibility." },
  { q: "What quality setting should I use?", a: "92% quality (the default) produces visually indistinguishable results from the original while keeping file sizes reasonable. For sharing online, 85% is often sufficient. For archival or print, use 95-100%." },
  { q: "Does converting AVIF to JPG cause quality loss?", a: "Yes — JPG is a lossy format, so some quality loss is introduced. The amount depends on the quality slider setting. At 92%+, the difference is imperceptible for most content." },
];

const relatedTools = [
  { name: "JPG to AVIF", href: "/jpg-to-avif" },
  { name: "AVIF to PNG", href: "/avif-to-png" },
  { name: "JPG to WebP", href: "/jpg-to-webp" },
  { name: "PNG to JPG", href: "/png-to-jpg" },
];

export default function AvifToJpgPage() {
  return (
    <ImageFormatConverter
      fromFormat="AVIF"
      toFormat="JPG"
      fromExts=".avif,.AVIF"
      toMime="image/jpeg"
      toExt="jpg"
      fillWhiteBg={true}
      hasQuality={true}
      defaultQuality={0.92}
      isBulk={true}
      title="AVIF to JPG Converter"
      description="Convert AVIF to JPG for maximum compatibility. Free, private, instant — works in modern browsers (Chrome 85+, Firefox 93+)."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
