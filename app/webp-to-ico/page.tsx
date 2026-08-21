import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  { q: "Why convert WebP to ICO?", a: "ICO is the standard format for Windows icons and browser favicons. If you have your logo or icon as a WebP file, this tool converts it to a multi-size ICO file suitable for use as a website favicon or Windows application icon." },
  { q: "What sizes are in the ICO file?", a: "The ICO contains 256×256, 48×48, 32×32, and 16×16 variants. Each size contains a PNG embedded within the ICO container, which Windows and browsers use automatically for the appropriate context." },
  { q: "Does the ICO preserve WebP transparency?", a: "Yes — the ICO file uses PNG encoding internally, which supports full alpha-channel transparency. Transparent areas in your WebP will remain transparent in the ICO." },
];

const relatedTools = [
  { name: "ICO to WebP", href: "/ico-to-webp" },
  { name: "PNG to ICO", href: "/png-to-ico" },
  { name: "SVG to ICO", href: "/svg-to-ico" },
  { name: "WebP to PNG", href: "/webp-to-png" },
];

export default function WebpToIcoPage() {
  return (
    <ImageFormatConverter
      fromFormat="WebP"
      toFormat="ICO"
      fromExts=".webp,.WEBP"
      toMime="image/x-icon"
      toExt="ico"
      useIcoEncoder={true}
      hasQuality={false}
      isBulk={true}
      title="WebP to ICO Converter — Favicon Creator"
      description="Convert WebP to ICO favicon file online. Creates multi-size .ico with 256, 48, 32, and 16px variants. Preserves transparency. Free, private, instant."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
