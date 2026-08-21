import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  { q: "What is AVIF?", a: "AVIF (AV1 Image File Format) is a next-gen image format based on the AV1 video codec. It typically achieves 50% smaller file sizes than PNG and 20% smaller than WebP at equivalent quality, while also supporting alpha transparency and HDR." },
  { q: "What browsers support AVIF?", a: "AVIF is supported by Chrome 85+, Firefox 93+, Safari 16+, and Edge 121+. As of 2024, it covers over 90% of web users. Older browsers will fall back to other formats." },
  { q: "Does AVIF preserve PNG transparency?", a: "Yes. AVIF supports full alpha-channel transparency, so transparent areas in your PNG will be preserved in the AVIF output." },
  { q: "Is AVIF conversion supported in all browsers?", a: "AVIF encoding (creating AVIF files) requires Chrome 94+ or Firefox 93+. If this tool doesn't work in your browser, update to the latest Chrome or Firefox." },
];

const relatedTools = [
  { name: "AVIF to PNG", href: "/avif-to-png" },
  { name: "PNG to WebP", href: "/png-to-webp" },
  { name: "PNG to JPG", href: "/png-to-jpg" },
  { name: "Compress Image", href: "/compress-image" },
];

export default function PngToAvifPage() {
  return (
    <ImageFormatConverter
      fromFormat="PNG"
      toFormat="AVIF"
      fromExts=".png,.PNG"
      toMime="image/avif"
      toExt="avif"
      hasQuality={true}
      defaultQuality={0.85}
      isBulk={true}
      title="PNG to AVIF Converter"
      description="Convert PNG to AVIF for next-gen web compression. Up to 50% smaller than PNG at equivalent quality, with full transparency support. Free, private, instant — requires Chrome or Firefox."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
