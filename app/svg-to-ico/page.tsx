import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  { q: "Why is SVG the best source for ICO files?", a: "SVG is a vector format — it scales to any size without quality loss. Converting SVG to ICO produces perfectly sharp icons at all sizes (256×256 down to 16×16), which is why SVG logos are ideal starting points for favicon creation." },
  { q: "What sizes are in the ICO file?", a: "The ICO contains 256×256, 48×48, 32×32, and 16×16 variants — all standard sizes for Windows icons and browser favicons. Each is rendered from the vector SVG for crisp quality at every size." },
  { q: "Does the ICO preserve SVG transparency?", a: "Yes — the ICO uses PNG encoding internally, which supports full alpha-channel transparency. If your SVG has a transparent background, it remains transparent in the ICO." },
  { q: "My SVG has no explicit size — what resolution will the ICO be?", a: "The browser renders the SVG at its intrinsic size (from width/height or viewBox attributes). For best results, ensure your SVG has a defined viewBox. If it renders too small, the icons may be lower quality." },
];

const relatedTools = [
  { name: "ICO to SVG", href: "/ico-to-svg" },
  { name: "PNG to ICO", href: "/png-to-ico" },
  { name: "SVG to PNG", href: "/svg-to-png" },
  { name: "SVG Optimizer", href: "/svg-optimizer" },
];

export default function SvgToIcoPage() {
  return (
    <ImageFormatConverter
      fromFormat="SVG"
      toFormat="ICO"
      fromExts=".svg,.SVG"
      toMime="image/x-icon"
      toExt="ico"
      useIcoEncoder={true}
      hasQuality={false}
      isBulk={true}
      title="SVG to ICO Converter — Favicon Creator"
      description="Convert SVG vector to ICO favicon file online. Creates crisp multi-size .ico with 256, 48, 32, and 16px variants from your vector logo. Free, private, instant."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
