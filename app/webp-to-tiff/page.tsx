import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  { q: "When would I need WebP to TIFF?", a: "Professional print workflows sometimes require TIFF as the delivery format. If you have web images in WebP format that need to go into a print pipeline, converting to TIFF ensures compatibility with InDesign, Photoshop, and professional print workflows." },
  { q: "What's the best free approach?", a: "Two-step: (1) Convert WebP to PNG using our browser tool (free, instant), (2) Open the PNG in GIMP or IrfanView and export as TIFF. Or use ImageMagick: `magick input.webp output.tiff`." },
];

const relatedTools = [
  { name: "WebP to PNG (works in browser)", href: "/webp-to-png" },
  { name: "PNG to TIFF (guide)", href: "/png-to-tiff" },
  { name: "TIFF to WebP (guide)", href: "/tiff-to-webp" },
];

export default function WebpToTiffPage() {
  return (
    <PdfConverterStub
      title="WebP to TIFF Converter"
      description="Convert WebP to TIFF for professional print workflows. Browsers can't encode TIFF — use our two-step workaround."
      reason="Browsers cannot encode TIFF. Two-step solution: use our WebP to PNG converter (instant, browser-based), then open the PNG in GIMP or IrfanView and export as TIFF."
      alternatives={[
        { name: "Step 1: WebP to PNG (browser)", href: "/webp-to-png" },
        { name: "Step 2: GIMP (open PNG → export TIFF)", href: "https://www.gimp.org", external: true },
        { name: "CloudConvert WebP to TIFF", href: "https://cloudconvert.com/webp-to-tiff", external: true },
      ]}
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
