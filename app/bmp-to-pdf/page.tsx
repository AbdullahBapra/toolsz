import ImagesToPdfConverter from "@/app/components/ImagesToPdfConverter";

const faqs = [
  { q: "Can I convert BMP files to PDF in a browser?", a: "Yes. BMP files are rendered via canvas and embedded into the PDF as high-quality JPEG images. The conversion is fully browser-based — no upload needed." },
  { q: "Will my BMP image quality be preserved?", a: "The BMP is rendered to a canvas and embedded as JPEG at 95% quality. For lossless output, consider PNG to PDF instead — PNG maintains every pixel exactly." },
  { q: "Why are BMP files so large?", a: "BMP (Bitmap) stores raw, uncompressed pixel data. A 1920×1080 BMP can be 5-6MB versus a few hundred KB for a compressed JPEG. Converting to PDF compresses significantly." },
  { q: "Can I combine multiple BMP files into one PDF?", a: "Yes. Upload as many BMP files as needed and they are combined into a single multi-page PDF." },
];

const relatedTools = [
  { name: "JPG to PDF", href: "/jpg-to-pdf" },
  { name: "PNG to PDF", href: "/png-to-pdf" },
  { name: "TIFF to PDF", href: "/tiff-to-pdf" },
  { name: "Image to PDF", href: "/image-to-pdf" },
];

export default function BmpToPdfPage() {
  return (
    <ImagesToPdfConverter
      fromFormat="BMP"
      fromExts=".bmp,.BMP"
      isBulk={true}
      title="BMP to PDF Converter"
      description="Convert BMP bitmap images to PDF in your browser — free, private, no upload. BMP files are compressed and embedded into clean PDF pages. No watermarks, no limits."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
