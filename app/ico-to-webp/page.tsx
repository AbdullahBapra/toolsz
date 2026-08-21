import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  { q: "Why convert ICO to WebP?", a: "WebP offers excellent compression with alpha-channel transparency support. Converting an ICO to WebP is useful for web use cases where you want a small, transparent image without the ICO format overhead." },
  { q: "Does WebP preserve ICO transparency?", a: "Yes — WebP supports full alpha-channel transparency, so transparent areas in the ICO (favicon) will be preserved in the WebP output." },
  { q: "Is WebP suitable for favicons?", a: "Not all browsers support WebP favicons. For favicons, ICO and PNG are more widely supported. WebP is best for using the icon image in other web contexts (like img tags in modern browsers)." },
];

const relatedTools = [
  { name: "ICO to PNG", href: "/ico-to-png" },
  { name: "ICO to JPG", href: "/ico-to-jpg" },
  { name: "WebP to ICO", href: "/webp-to-ico" },
  { name: "PNG to ICO", href: "/png-to-ico" },
];

export default function IcoToWebpPage() {
  return (
    <ImageFormatConverter
      fromFormat="ICO"
      toFormat="WebP"
      fromExts=".ico,.ICO"
      toMime="image/webp"
      toExt="webp"
      hasQuality={true}
      defaultQuality={0.92}
      isBulk={true}
      title="ICO to WebP Converter"
      description="Convert ICO favicon files to WebP format online. Preserves transparency. Free, private, instant — no upload needed."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
