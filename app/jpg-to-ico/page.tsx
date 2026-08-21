import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  { q: "Can I use a JPG photo as a favicon?", a: "Yes, but simple icons work much better than photos. At 16×16 pixels (the size shown in browser tabs), complex photos become unrecognizable blobs. For best results, use a simple logo, letter, or symbol — ideally with high contrast." },
  { q: "What sizes are in the ICO file?", a: "This tool creates a multi-size ICO containing 256×256, 48×48, 32×32, and 16×16 versions. The image is scaled to each size while maintaining aspect ratio, centered on a square canvas." },
  { q: "The JPG has a white background — is that a problem?", a: "For ICO files, a white background is fine. Most favicon contexts have their own background color. If you want a transparent favicon, convert a PNG with transparency to ICO instead (use our PNG to ICO converter)." },
  { q: "How do I add the ICO to my website?", a: "Upload favicon.ico to your website root and add <link rel='icon' href='/favicon.ico'> to your HTML <head>. Most browsers will also automatically detect favicon.ico at the root without the link tag." },
];

const relatedTools = [
  { name: "PNG to ICO", href: "/png-to-ico" },
  { name: "ICO to JPG", href: "/ico-to-jpg" },
  { name: "SVG to ICO", href: "/svg-to-ico" },
  { name: "WebP to ICO", href: "/webp-to-ico" },
];

export default function JpgToIcoPage() {
  return (
    <ImageFormatConverter
      fromFormat="JPG"
      toFormat="ICO"
      fromExts=".jpg,.jpeg,.JPG,.JPEG"
      toMime="image/x-icon"
      toExt="ico"
      useIcoEncoder={true}
      fillWhiteBg={true}
      hasQuality={false}
      isBulk={true}
      title="JPG to ICO Converter — Favicon Creator"
      description="Convert JPG to ICO favicon file online. Creates multi-size .ico with 256, 48, 32, and 16px variants. Free, private, instant — no upload needed."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
