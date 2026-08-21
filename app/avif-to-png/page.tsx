import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  { q: "Why convert AVIF to PNG?", a: "PNG has universal compatibility — every browser, OS, and image app supports it. AVIF is a newer format that still has limited support in some tools. Converting to PNG ensures your image works everywhere." },
  { q: "Will I lose quality converting AVIF to PNG?", a: "PNG is lossless, so the PNG output preserves whatever quality the AVIF had. You won't add any new quality loss. However, if the AVIF was created with lossy compression, those original artifacts remain (converting back to AVIF wouldn't restore them)." },
  { q: "Does AVIF support transparency? Will PNG preserve it?", a: "Yes. AVIF supports alpha-channel transparency, and PNG also fully supports transparency. Transparent areas are preserved during conversion." },
  { q: "Is this tool compatible with all browsers?", a: "AVIF decoding requires Chrome 85+, Firefox 93+, or Safari 16+. If you're using an older browser, the conversion may not work. We recommend Chrome for best AVIF support." },
];

const relatedTools = [
  { name: "PNG to AVIF", href: "/png-to-avif" },
  { name: "AVIF to JPG", href: "/avif-to-jpg" },
  { name: "PNG to WebP", href: "/png-to-webp" },
  { name: "Compress Image", href: "/compress-image" },
];

export default function AvifToPngPage() {
  return (
    <ImageFormatConverter
      fromFormat="AVIF"
      toFormat="PNG"
      fromExts=".avif,.AVIF"
      toMime="image/png"
      toExt="png"
      hasQuality={false}
      isBulk={true}
      title="AVIF to PNG Converter"
      description="Convert AVIF to PNG for universal compatibility. Lossless PNG output, preserves transparency. Free, private, instant — requires Chrome or Firefox."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
