import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  {
    q: "Why can't bulk background removal run in the browser?",
    a: "Background removal requires AI segmentation models (like U-Net or SegFormer) that are 40–200 MB in size. Loading these models client-side would take 30–90 seconds on most connections and require significant GPU/CPU resources. Server-side APIs like remove.bg process images in 1–2 seconds using dedicated hardware.",
  },
  {
    q: "How much does remove.bg cost for bulk removal?",
    a: "remove.bg offers 50 free background removals per month. For bulk usage, their API plans start at $0.20 per image with volume discounts. For e-commerce with thousands of product images, their Enterprise plans offer the best rates.",
  },
  {
    q: "Can I remove backgrounds from product photos in bulk for free?",
    a: "Yes — remove.bg gives 50 free removals/month. Canva's background remover (included in Canva Pro) lets you process multiple images. For large-scale free processing, our single-image Remove Background tool at /remove-bg handles one image at a time using browser-based AI.",
  },
];

const relatedTools = [
  { name: "Remove Background", href: "/remove-bg" },
  { name: "Bulk Image Converter", href: "/bulk-image-converter" },
  { name: "Product Background Remover", href: "/product-background-remover" },
];

export default function BulkBackgroundRemoverPage() {
  return (
    <PdfConverterStub
      title="Bulk Background Remover"
      description="Remove backgrounds from multiple images at once using AI. Perfect for product photos, portraits, and e-commerce listings."
      reason="Background removal requires AI/ML models that require server-side processing or WebAssembly. For bulk removal at scale, remove.bg offers the best API."
      alternatives={[
        { name: "Remove Background (single image)", href: "/remove-bg" },
        { name: "remove.bg (free for 50/month)", href: "https://www.remove.bg", external: true },
        { name: "Canva Background Remover", href: "https://www.canva.com/tools/background-remover/", external: true },
      ]}
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
