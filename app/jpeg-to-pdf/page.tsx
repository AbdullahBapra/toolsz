import ImagesToPdfConverter from "@/app/components/ImagesToPdfConverter";

const faqs = [
  { q: "What is the difference between JPG and JPEG?", a: "JPG and JPEG are the same format — JPEG stands for Joint Photographic Experts Group. The .jpg extension is a shortened version of .jpeg. Both produce identical files; the name difference is historical." },
  { q: "Can I convert multiple JPEG files into one PDF?", a: "Yes. Upload as many JPEG files as you want and they will all be combined into a single multi-page PDF, with each image on its own page." },
  { q: "Does converting JPEG to PDF reduce quality?", a: "No. The JPEG is embedded directly into the PDF at its original quality. There is no re-encoding or additional quality loss during the conversion." },
  { q: "Can I set the page size when converting JPEG to PDF?", a: "Yes. Choose 'Fit to Page' for A4 with borders, 'Fill Page' to crop-fill A4, or 'Original Size' to create pages matching your image's pixel dimensions." },
];

const relatedTools = [
  { name: "JPG to PDF", href: "/jpg-to-pdf" },
  { name: "PNG to PDF", href: "/png-to-pdf" },
  { name: "HEIC to PDF", href: "/heic-to-pdf" },
  { name: "PDF to JPG", href: "/pdf-to-jpg" },
  { name: "Image to PDF", href: "/image-to-pdf" },
];

export default function JpegToPdfPage() {
  return (
    <ImagesToPdfConverter
      fromFormat="JPEG"
      fromExts=".jpg,.jpeg,.JPG,.JPEG"
      isBulk={true}
      title="JPEG to PDF Converter"
      description="Convert JPEG images to PDF in your browser — free, instant, no upload required. Batch-combine multiple JPEG photos into one professional PDF. No watermarks, no sign-up."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
