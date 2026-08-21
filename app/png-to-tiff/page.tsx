import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  { q: "When do I need TIFF format?", a: "TIFF is used in professional printing and publishing workflows, medical imaging, archival scanning, and prepress (Adobe InDesign, offset printing). For web use, PNG is almost always better — TIFF files are huge and browsers don't display them natively." },
  { q: "Is PNG to TIFF lossless?", a: "Yes — both PNG and TIFF support lossless compression. Converting PNG to TIFF preserves every pixel exactly. TIFF can be uncompressed or use lossless compression (LZW, ZIP) depending on your software settings." },
  { q: "What's the best free tool for PNG to TIFF?", a: "GIMP (free, cross-platform): File → Export As → save as TIFF. IrfanView (Windows, free): open PNG, Save As TIFF. For batch conversion, ImageMagick: `magick input.png output.tiff`." },
  { q: "What DPI setting should I use for print TIFF?", a: "For professional printing: 300 DPI for standard print, 600 DPI for fine detail or very small text. The DPI metadata is set in your conversion software — it doesn't change the actual pixel count, just the print size interpretation." },
];

const relatedTools = [
  { name: "PNG to BMP (similar, works in browser)", href: "/png-to-bmp" },
  { name: "TIFF to PNG (guide)", href: "/tiff-to-png" },
  { name: "Compress Image", href: "/compress-image" },
];

export default function PngToTiffPage() {
  return (
    <PdfConverterStub
      title="PNG to TIFF Converter"
      description="Convert PNG to TIFF for professional printing and publishing. Browsers can't encode TIFF — use GIMP or IrfanView instead."
      reason="Browsers cannot encode TIFF files — the Canvas API doesn't support TIFF output. TIFF conversion requires desktop software. Use GIMP or IrfanView (both free) for reliable PNG to TIFF conversion."
      alternatives={[
        { name: "GIMP (free, cross-platform)", href: "https://www.gimp.org", external: true },
        { name: "IrfanView (Windows, free)", href: "https://www.irfanview.com", external: true },
        { name: "CloudConvert (online)", href: "https://cloudconvert.com/png-to-tiff", external: true },
        { name: "PNG to BMP (works in browser)", href: "/png-to-bmp" },
      ]}
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
