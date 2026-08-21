import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  { q: "What sizes does the ICO file contain?", a: "This tool creates a multi-size ICO containing 256×256, 48×48, 32×32, and 16×16 versions of your image. Windows and browsers automatically pick the right size for the context — 16×16 for browser tabs, 32×32 for taskbar, 256×256 for high-DPI displays." },
  { q: "What image works best for a favicon?", a: "Simple logos or symbols work best. Avoid complex photos — they're unreadable at 16×16. Use a square image with good contrast. SVG logos can be rasterized cleanly, PNG screenshots usually work well." },
  { q: "How do I use the ICO file as a website favicon?", a: "Place favicon.ico at the root of your website (same level as index.html). Add <link rel='icon' href='/favicon.ico'> in your HTML <head>. Most browsers automatically find favicon.ico at the root, even without the link tag." },
  { q: "Is ICO the only favicon format?", a: "No. Modern browsers also support PNG favicons (recommended for modern sites) and SVG favicons (newest, scalable). ICO is required for compatibility with Internet Explorer and older Windows apps. For a new site, PNG or SVG favicons are often better." },
];

const relatedTools = [
  { name: "ICO to PNG", href: "/ico-to-png" },
  { name: "JPG to ICO", href: "/jpg-to-ico" },
  { name: "SVG to ICO", href: "/svg-to-ico" },
  { name: "WebP to ICO", href: "/webp-to-ico" },
  { name: "Resize Image", href: "/resize-image" },
];

export default function PngToIcoPage() {
  return (
    <ImageFormatConverter
      fromFormat="PNG"
      toFormat="ICO"
      fromExts=".png,.PNG"
      toMime="image/x-icon"
      toExt="ico"
      useIcoEncoder={true}
      hasQuality={false}
      isBulk={true}
      title="PNG to ICO Converter — Favicon Creator"
      description="Convert PNG to ICO favicon file online. Creates multi-size .ico with 256, 48, 32, and 16px variants in a single file. Free, private, instant."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
