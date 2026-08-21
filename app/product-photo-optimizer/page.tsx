import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  {
    q: "Why convert product photos to JPG with a white background?",
    a: "Most e-commerce platforms (Amazon, Shopify, eBay) require or prefer JPG product images on white backgrounds. JPG provides better file size compression than PNG for photos, and white backgrounds create a professional, consistent look across your catalog.",
  },
  {
    q: "What quality setting should I use for product photos?",
    a: "85% quality (the default) is the sweet spot for product photos. It produces files typically 60–70% smaller than 100% quality with no visible difference on screen. For print-quality output or zoomed product galleries, use 90–95%.",
  },
  {
    q: "Does this tool resize my product photos?",
    a: "This optimizer converts format and adjusts quality — it does not resize images. To resize to Amazon (1000×1000), Shopify (2048×2048), or other platform dimensions, use our Product Image Resizer or Amazon Image Resizer tools after optimizing.",
  },
  {
    q: "Can I process a whole product catalog at once?",
    a: "Yes — this tool supports batch processing. Upload all your product photos at once and download all optimized JPG files as a single ZIP. There is no limit on the number of files.",
  },
];

const relatedTools = [
  { name: "Product Image Resizer", href: "/product-image-resizer" },
  { name: "Amazon Image Resizer", href: "/amazon-image-resizer" },
  { name: "Shopify Image Optimizer", href: "/shopify-image-optimizer" },
  { name: "Compress Image", href: "/compress-image" },
];

export default function ProductPhotoOptimizerPage() {
  return (
    <ImageFormatConverter
      fromFormat="Any"
      toFormat="JPG"
      fromExts=".jpg,.jpeg,.png,.webp"
      toMime="image/jpeg"
      toExt="jpg"
      fillWhiteBg={true}
      hasQuality={true}
      defaultQuality={0.85}
      isBulk={true}
      title="Product Photo Optimizer"
      description="Optimize product photos for e-commerce. Convert to JPG with white background fill at 85% quality. Batch process your entire catalog and download as ZIP. Free, private, browser-based."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
