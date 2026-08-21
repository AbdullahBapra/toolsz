import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  { q: "When should I convert JPG to TIFF?", a: "TIFF is used in professional print workflows (offset printing, magazines), archival storage, medical imaging, and photo editing pipelines that require lossless intermediate formats. For web use, JPG is always better — TIFF files are very large and not browser-displayable." },
  { q: "Does converting JPG to TIFF improve quality?", a: "No. JPG artifacts are permanent. Converting to TIFF stores those artifacts losslessly — no new quality loss, but existing JPEG compression damage remains. For best results, always start from RAW or uncompressed sources for professional print work." },
  { q: "What TIFF settings are best for print?", a: "Use LZW or ZIP compression (lossless), 300 DPI resolution metadata, 8-bit per channel (or 16-bit for high-quality work), and RGB or CMYK color space depending on your print workflow. Configure these in your conversion software." },
];

const relatedTools = [
  { name: "JPG to BMP (works in browser)", href: "/jpg-to-bmp" },
  { name: "TIFF to JPG (guide)", href: "/tiff-to-jpg" },
  { name: "PNG to TIFF (guide)", href: "/png-to-tiff" },
];

export default function JpgToTiffPage() {
  return (
    <PdfConverterStub
      title="JPG to TIFF Converter"
      description="Convert JPG to TIFF for professional print workflows. Browsers can't encode TIFF — use GIMP or IrfanView instead."
      reason="Browsers cannot encode TIFF files. Use GIMP (free, cross-platform) or IrfanView (Windows, free) to open your JPG and export as TIFF with your preferred compression and resolution settings."
      alternatives={[
        { name: "GIMP (free, cross-platform)", href: "https://www.gimp.org", external: true },
        { name: "IrfanView (Windows, free)", href: "https://www.irfanview.com", external: true },
        { name: "CloudConvert (online)", href: "https://cloudconvert.com/jpg-to-tiff", external: true },
        { name: "JPG to PNG (lossless, works in browser)", href: "/jpg-to-png" },
      ]}
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
