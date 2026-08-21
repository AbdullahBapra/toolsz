import ImagesToPdfConverter from "@/app/components/ImagesToPdfConverter";

const faqs = [
  { q: "How do I convert a JPG to PDF?", a: "Upload your JPG file(s), choose a page layout (fit, fill, or original size), then click 'Convert to PDF'. Your PDF downloads instantly — no sign-up needed." },
  { q: "Can I combine multiple JPG images into one PDF?", a: "Yes. Upload as many JPG files as you need — each image becomes its own page in the PDF. They appear in the order you upload them." },
  { q: "Will the image quality be preserved in the PDF?", a: "Yes. The PDF embeds your JPG images at full resolution. Choose 'Original Size' layout if you want the PDF pages to match the exact pixel dimensions of your photos." },
  { q: "Is there a file size limit?", a: "There is no enforced file size limit. Since all processing happens locally in your browser, performance depends on your device's memory. For very large batches (100+ images), process in groups for best results." },
  { q: "Will the PDF have a watermark?", a: "Never. Toolsz is completely free with no watermarks, ever. The PDF you download is clean and professional." },
];

const relatedTools = [
  { name: "JPEG to PDF", href: "/jpeg-to-pdf" },
  { name: "PNG to PDF", href: "/png-to-pdf" },
  { name: "WebP to PDF", href: "/webp-to-pdf" },
  { name: "HEIC to PDF", href: "/heic-to-pdf" },
  { name: "PDF to JPG", href: "/pdf-to-jpg" },
  { name: "Image to PDF", href: "/image-to-pdf" },
];

export default function JpgToPdfPage() {
  return (
    <ImagesToPdfConverter
      fromFormat="JPG"
      fromExts=".jpg,.jpeg,.JPG,.JPEG"
      isBulk={true}
      title="JPG to PDF Converter"
      description="Convert JPG images to a PDF document — free, instant, and 100% private. No file uploads, no watermarks. Combine multiple photos into one PDF with A4 or original sizing."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
