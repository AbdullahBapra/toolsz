import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  { q: "Why convert ICO to JPG?", a: "JPG is a universal raster format supported everywhere. If you need to use an icon image in a context that requires JPG (like certain email templates or older CMS platforms), this converter handles it quickly." },
  { q: "What happens to icon transparency?", a: "ICO files (especially for favicons) often have transparent backgrounds. JPG doesn't support transparency, so transparent areas will be filled with white. For preserving transparency, use ICO to PNG instead." },
  { q: "What is the output resolution?", a: "The browser renders the ICO at its highest available resolution and the tool captures that. Most modern favicons render at 256×256 pixels." },
];

const relatedTools = [
  { name: "ICO to PNG", href: "/ico-to-png" },
  { name: "ICO to WebP", href: "/ico-to-webp" },
  { name: "JPG to ICO", href: "/jpg-to-ico" },
  { name: "PNG to ICO", href: "/png-to-ico" },
];

export default function IcoToJpgPage() {
  return (
    <ImageFormatConverter
      fromFormat="ICO"
      toFormat="JPG"
      fromExts=".ico,.ICO"
      toMime="image/jpeg"
      toExt="jpg"
      fillWhiteBg={true}
      hasQuality={true}
      defaultQuality={0.92}
      isBulk={true}
      title="ICO to JPG Converter"
      description="Convert ICO favicon files to JPG images online. Transparent areas become white. Free, private, instant — no upload needed."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
