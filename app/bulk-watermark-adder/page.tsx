import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  {
    q: "Does the Watermark Image tool support multiple files?",
    a: "Yes — our Watermark Image tool at /watermark-image supports uploading multiple images and applying the same watermark text or logo to all of them at once. You can download all watermarked images as a ZIP.",
  },
  {
    q: "What types of watermarks can I add?",
    a: "Our Watermark Image tool supports text watermarks (with custom font, size, color, and opacity) and image watermarks (overlay your logo or signature). You can position the watermark in any corner, center, or tile it across the image.",
  },
  {
    q: "Is watermarking free?",
    a: "Yes — our Watermark Image tool is completely free with no limits. Canva also offers free watermarking for individual images. For high-volume API watermarking, tools like Cloudinary or ImageKit provide programmatic watermarking.",
  },
];

const relatedTools = [
  { name: "Watermark Image", href: "/watermark-image" },
  { name: "Bulk Image Compressor", href: "/bulk-image-compressor" },
  { name: "Bulk Image Converter", href: "/bulk-image-converter" },
];

export default function BulkWatermarkAdderPage() {
  return (
    <PdfConverterStub
      title="Bulk Watermark Adder"
      description="Add watermarks to multiple images at once. Protect your photos, product images, and creative work with text or logo watermarks in bulk."
      reason="For bulk watermarking, use our Watermark Image tool which supports batch processing with text and image watermarks."
      alternatives={[
        { name: "Watermark Image (our tool)", href: "/watermark-image" },
        { name: "Canva (free watermarking)", href: "https://www.canva.com", external: true },
      ]}
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
