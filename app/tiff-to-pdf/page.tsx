import ImagesToPdfConverter from "@/app/components/ImagesToPdfConverter";

const faqs = [
  { q: "Can I convert multi-page TIFF files to PDF?", a: "Browser-based TIFF handling typically reads the first page/frame of multi-page TIFFs. For complete multi-page TIFF conversion, we recommend desktop tools like Adobe Acrobat or IrfanView." },
  { q: "Will the TIFF scan quality be preserved in the PDF?", a: "TIFF images are rendered via canvas and embedded at high quality (95% JPEG). For scanned documents, this produces clear, readable PDF output suitable for archiving." },
  { q: "Why convert TIF to PDF?", a: "TIFF is widely used for scanned documents, medical imaging, and print prepress. PDF is more universally shareable and viewable. Converting TIFF to PDF makes your files accessible everywhere." },
  { q: "Can I combine multiple TIFF files into one PDF?", a: "Yes. Upload multiple TIFF/TIF files and they are combined into a multi-page PDF — useful for assembling scanned document pages." },
];

const relatedTools = [
  { name: "JPG to PDF", href: "/jpg-to-pdf" },
  { name: "PNG to PDF", href: "/png-to-pdf" },
  { name: "BMP to PDF", href: "/bmp-to-pdf" },
  { name: "Image to PDF", href: "/image-to-pdf" },
];

export default function TiffToPdfPage() {
  return (
    <ImagesToPdfConverter
      fromFormat="TIFF"
      fromExts=".tiff,.tif,.TIFF,.TIF"
      isBulk={true}
      title="TIFF to PDF Converter"
      description="Convert TIFF and TIF images to PDF in your browser — free, instant, no upload. Great for scanned documents. Combine multiple TIFF files into one PDF. No watermarks."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
