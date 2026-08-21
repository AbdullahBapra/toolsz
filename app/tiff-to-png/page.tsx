import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  { q: "Why can't I convert TIFF in the browser?", a: "TIFF (Tagged Image File Format) is not natively supported by web browsers for decoding. Browser's Canvas API and image APIs only support PNG, JPG, WebP, GIF, AVIF, and a few other formats. TIFF requires a dedicated decoder library which adds significant complexity and file size." },
  { q: "What's the best free tool for TIFF to PNG?", a: "IrfanView (Windows, free) and GIMP (cross-platform, free) both handle TIFF to PNG conversion reliably. For online conversion, CloudConvert and Convertio support TIFF. For batch conversion, ImageMagick is the professional choice." },
  { q: "Does TIFF to PNG lose quality?", a: "No. TIFF is typically stored as uncompressed or losslessly compressed data. Converting to PNG (also lossless) preserves every pixel exactly. This is a completely lossless conversion." },
  { q: "My TIFF has multiple pages — what happens?", a: "Multi-page TIFF files (common in scanned documents) need specialized software. GIMP can open each page as a layer. IrfanView can extract pages. For automated batch processing, ImageMagick handles multi-page TIFFs natively." },
];

const relatedTools = [
  { name: "PNG to TIFF (guide)", href: "/png-to-tiff" },
  { name: "BMP to PNG", href: "/bmp-to-png" },
  { name: "Compress Image", href: "/compress-image" },
];

export default function TiffToPngPage() {
  return (
    <PdfConverterStub
      title="TIFF to PNG Converter"
      description="Convert TIFF images to PNG format. TIFF decoding requires desktop software — browsers don't support TIFF natively. Here's how to do it for free."
      reason="Browsers don't support TIFF decoding natively. The TIFF format requires a dedicated decoder that's not part of the browser's built-in image APIs. Use IrfanView, GIMP, or CloudConvert for reliable TIFF to PNG conversion."
      alternatives={[
        { name: "IrfanView (Windows, free)", href: "https://www.irfanview.com", external: true },
        { name: "GIMP (cross-platform, free)", href: "https://www.gimp.org", external: true },
        { name: "CloudConvert (online)", href: "https://cloudconvert.com/tiff-to-png", external: true },
        { name: "BMP to PNG (similar)", href: "/bmp-to-png" },
      ]}
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
