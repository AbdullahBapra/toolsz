import ImagesToPdfConverter from "@/app/components/ImagesToPdfConverter";

const faqs = [
  { q: "Can I convert transparent PNG images to PDF?", a: "Yes. PNG transparency is preserved in the conversion. The PDF will embed the full PNG image including any transparent areas (which render as white background in the PDF)." },
  { q: "Will converting PNG to PDF reduce image quality?", a: "No. PNGs are losslessly embedded into the PDF. There is no quality loss — every pixel is preserved exactly as in the original PNG file." },
  { q: "Can I combine multiple PNG files into a single PDF?", a: "Yes. Upload as many PNGs as needed. Each becomes its own PDF page in the order uploaded. This is great for combining screenshots, diagrams, or design assets." },
  { q: "What page size will my PNG PDF be?", a: "Choose 'Fit to Page' for standard A4 with the PNG scaled to fit, 'Fill Page' to crop-fill A4, or 'Original Size' where the PDF page matches your PNG's exact pixel dimensions." },
];

const relatedTools = [
  { name: "JPG to PDF", href: "/jpg-to-pdf" },
  { name: "WebP to PDF", href: "/webp-to-pdf" },
  { name: "PDF to PNG", href: "/pdf-to-png" },
  { name: "PNG to JPG", href: "/png-to-jpg" },
  { name: "Image to PDF", href: "/image-to-pdf" },
];

export default function PngToPdfPage() {
  return (
    <ImagesToPdfConverter
      fromFormat="PNG"
      fromExts=".png,.PNG"
      isBulk={true}
      title="PNG to PDF Converter"
      description="Convert PNG images to PDF in your browser — free, lossless, no upload. Preserves transparency and full image quality. Combine multiple PNGs into one PDF document. No watermarks."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
