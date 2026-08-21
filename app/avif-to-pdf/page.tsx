import ImagesToPdfConverter from "@/app/components/ImagesToPdfConverter";

const faqs = [
  { q: "What is AVIF format?", a: "AVIF (AV1 Image File Format) is a next-generation image format offering superior compression vs JPEG and WebP. It's used by web platforms like Netflix and Google Images for smaller file sizes at the same quality." },
  { q: "Can I convert AVIF to PDF in a browser?", a: "Yes. AVIF images are decoded by your browser and rendered to a canvas, then embedded into the PDF as a high-quality image. Browser support for AVIF decoding is excellent in Chrome, Firefox, and Safari." },
  { q: "Why convert AVIF to PDF?", a: "AVIF is a web-only format not supported by most document workflows. Converting to PDF makes your AVIF images universally shareable, printable, and compatible with all document readers." },
  { q: "Can I batch convert multiple AVIF files to PDF?", a: "Yes. Upload multiple AVIF files and they are combined into a single multi-page PDF document." },
];

const relatedTools = [
  { name: "JPG to PDF", href: "/jpg-to-pdf" },
  { name: "WebP to PDF", href: "/webp-to-pdf" },
  { name: "PNG to PDF", href: "/png-to-pdf" },
  { name: "Image to PDF", href: "/image-to-pdf" },
];

export default function AvifToPdfPage() {
  return (
    <ImagesToPdfConverter
      fromFormat="AVIF"
      fromExts=".avif,.AVIF"
      isBulk={true}
      title="AVIF to PDF Converter"
      description="Convert AVIF images to PDF in your browser — free, instant, no upload. Convert next-gen AVIF photos to PDF format for universal sharing. No watermarks, no sign-up."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
