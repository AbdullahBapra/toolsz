import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  { q: "Why can't I convert TIFF in the browser?", a: "Web browsers don't include a native TIFF decoder. The TIFF format is complex (supporting many compression types, color spaces, and bit depths) and requires dedicated library support. Convert using desktop apps like IrfanView, GIMP, or Photoshop instead." },
  { q: "What's the best free tool?", a: "IrfanView (Windows, completely free) is the easiest: open the TIFF, press S to save, choose JPG. GIMP works on Windows/Mac/Linux. For batch conversion of many TIFFs, ImageMagick's command line is the most powerful free option." },
  { q: "Does converting TIFF to JPG cause quality loss?", a: "Yes — JPG is a lossy format, so some quality loss occurs. At 90%+ quality settings in your software, the difference is imperceptible for most content. For archival purposes, consider converting to PNG (lossless) instead." },
];

const relatedTools = [
  { name: "BMP to JPG", href: "/bmp-to-jpg" },
  { name: "PNG to JPG", href: "/png-to-jpg" },
  { name: "TIFF to PNG (guide)", href: "/tiff-to-png" },
];

export default function TiffToJpgPage() {
  return (
    <PdfConverterStub
      title="TIFF to JPG Converter"
      description="Convert TIFF images to JPG. Browsers don't support TIFF decoding — use free desktop software instead."
      reason="TIFF format requires a dedicated decoder not built into browsers. Use IrfanView (Windows), GIMP (cross-platform), or an online service for TIFF to JPG conversion."
      alternatives={[
        { name: "IrfanView (Windows, free)", href: "https://www.irfanview.com", external: true },
        { name: "GIMP (cross-platform, free)", href: "https://www.gimp.org", external: true },
        { name: "CloudConvert (online)", href: "https://cloudconvert.com/tiff-to-jpg", external: true },
        { name: "PNG to JPG (works in browser)", href: "/png-to-jpg" },
      ]}
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
