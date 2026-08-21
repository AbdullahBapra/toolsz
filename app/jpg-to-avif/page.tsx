import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  { q: "How does AVIF compare to JPG?", a: "AVIF is typically 50% smaller than JPG at equivalent visual quality. For web use, AVIF represents a significant bandwidth saving. The tradeoff is limited support in older browsers and slower encoding compared to JPG." },
  { q: "Should I use AVIF instead of WebP?", a: "AVIF generally achieves better compression than WebP, but browser support is slightly lower (WebP works in Safari 14+ vs. AVIF's Safari 16+). For maximum compatibility, WebP is safer. For maximum compression with modern browsers, AVIF is the better choice." },
  { q: "Will my converted AVIF lose more quality?", a: "There's a small additional quality loss when transcoding from JPG (lossy) to AVIF (also lossy). The best practice is to convert from original source files (RAW, TIFF, or high-quality PNG) to AVIF, rather than from an already-compressed JPG." },
  { q: "What quality setting should I use for AVIF?", a: "85% is a good starting point — AVIF at 85% typically looks better than JPG at 92% while being much smaller. Try 75-80% for smaller files or 90%+ for the highest quality." },
];

const relatedTools = [
  { name: "AVIF to JPG", href: "/avif-to-jpg" },
  { name: "JPG to WebP", href: "/jpg-to-webp" },
  { name: "PNG to AVIF", href: "/png-to-avif" },
  { name: "Compress Image", href: "/compress-image" },
];

export default function JpgToAvifPage() {
  return (
    <ImageFormatConverter
      fromFormat="JPG"
      toFormat="AVIF"
      fromExts=".jpg,.jpeg,.JPG,.JPEG"
      toMime="image/avif"
      toExt="avif"
      fillWhiteBg={true}
      hasQuality={true}
      defaultQuality={0.85}
      isBulk={true}
      title="JPG to AVIF Converter"
      description="Convert JPG to AVIF for next-gen compression. Smaller files, better quality than JPG. Free, private, instant — requires Chrome 94+ or Firefox 93+."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
