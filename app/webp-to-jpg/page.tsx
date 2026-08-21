import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  { q: "Why convert WebP to JPG?", a: "JPG is supported by virtually every application, browser, and device. Some older software, email clients, and printing services don't yet support WebP. Converting to JPG ensures your image opens everywhere." },
  { q: "What happens to WebP transparency?", a: "JPG doesn't support transparency. Transparent areas in the WebP image will be filled with white in the JPG output. If you need transparency, convert to PNG instead." },
  { q: "Does converting WebP to JPG lose quality?", a: "JPG is a lossy format, so some quality loss is introduced. At 92% quality (default), the difference is visually imperceptible for most images. You can adjust the quality slider to balance size vs. quality." },
  { q: "WebP is already compressed — will JPG be larger?", a: "It depends. WebP is often more efficient than JPG. A WebP image converted to JPG at similar quality settings may actually be slightly larger. The exact difference depends on image content." },
];

const relatedTools = [
  { name: "JPG to WebP", href: "/jpg-to-webp" },
  { name: "WebP to PNG", href: "/webp-to-png" },
  { name: "PNG to JPG", href: "/png-to-jpg" },
  { name: "WebP to GIF", href: "/webp-to-gif" },
];

export default function WebpToJpgPage() {
  return (
    <ImageFormatConverter
      fromFormat="WebP"
      toFormat="JPG"
      fromExts=".webp,.WEBP"
      toMime="image/jpeg"
      toExt="jpg"
      fillWhiteBg={true}
      hasQuality={true}
      defaultQuality={0.92}
      isBulk={true}
      title="WebP to JPG Converter"
      description="Convert WebP to JPG online for maximum compatibility. Transparent areas filled with white. Free, private, instant — no upload needed."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
