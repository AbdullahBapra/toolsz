import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  { q: "Why can't TIFF be converted in the browser?", a: "Browsers don't have a native TIFF decoder. TIFF supports too many compression variants and color models for browsers to handle natively. Use desktop software for TIFF conversion." },
  { q: "What's the best free path for TIFF to WebP?", a: "Two-step approach using free tools: (1) Open in GIMP or IrfanView → save as PNG, (2) Use our PNG to WebP converter in the browser. Or use ImageMagick: `magick input.tiff output.webp`." },
];

const relatedTools = [
  { name: "PNG to WebP (works in browser)", href: "/png-to-webp" },
  { name: "TIFF to PNG (guide)", href: "/tiff-to-png" },
  { name: "WebP to TIFF (guide)", href: "/webp-to-tiff" },
];

export default function TiffToWebpPage() {
  return (
    <PdfConverterStub
      title="TIFF to WebP Converter"
      description="Convert TIFF to WebP. Browsers can't decode TIFF — convert via GIMP or IrfanView first, then use our PNG to WebP tool."
      reason="TIFF decoding requires desktop software since browsers don't include a native TIFF decoder. Two-step workaround: convert TIFF → PNG in GIMP or IrfanView, then use our browser-based PNG to WebP converter."
      alternatives={[
        { name: "IrfanView (convert TIFF→PNG first)", href: "https://www.irfanview.com", external: true },
        { name: "GIMP (free, cross-platform)", href: "https://www.gimp.org", external: true },
        { name: "PNG to WebP (use after GIMP)", href: "/png-to-webp" },
        { name: "CloudConvert TIFF to WebP", href: "https://cloudconvert.com/tiff-to-webp", external: true },
      ]}
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
