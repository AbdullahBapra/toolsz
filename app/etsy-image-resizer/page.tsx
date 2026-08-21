import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  {
    q: "What size should Etsy listing photos be?",
    a: "Etsy recommends uploading images at least 2000px on the shortest side. For square listing photos, 2000×2000px is the ideal size. Etsy displays thumbnails at 570×456px but buyers can click to see the full-resolution image. Larger images give buyers more detail and build trust.",
  },
  {
    q: "What is the best aspect ratio for Etsy listing photos?",
    a: "Etsy uses a 4:3 aspect ratio for listing thumbnails in search results. Square (1:1) images are also popular and display well. For cover photos (the large hero image on your Etsy shop front), use 3360×840px (4:1 ratio).",
  },
  {
    q: "Does Etsy require white backgrounds on product photos?",
    a: "No, Etsy does not require white backgrounds. Etsy sellers commonly use lifestyle photos, textured backgrounds, and branded settings. However, for certain categories (jewelry, electronics), clean white or neutral backgrounds tend to perform better in search results.",
  },
  {
    q: "How many photos can I add to an Etsy listing?",
    a: "Etsy allows up to 10 photos per listing. Use all 10 slots to show your product from multiple angles, in use, with scale references, and with close-up detail shots. Listings with more high-quality photos consistently get more views and higher conversion rates.",
  },
];

const relatedTools = [
  { name: "Product Image Resizer", href: "/product-image-resizer" },
  { name: "Amazon Image Resizer", href: "/amazon-image-resizer" },
  { name: "Shopify Image Optimizer", href: "/shopify-image-optimizer" },
  { name: "Product Photo Optimizer", href: "/product-photo-optimizer" },
];

export default function EtsyImageResizerPage() {
  return (
    <ImageFormatConverter
      fromFormat="Any"
      toFormat="JPG"
      fromExts=".jpg,.jpeg,.png,.webp,.bmp,.gif,.avif"
      toMime="image/jpeg"
      toExt="jpg"
      fillWhiteBg={true}
      hasQuality={true}
      defaultQuality={0.90}
      isBulk={true}
      title="Etsy Image Resizer"
      description="Resize product photos for Etsy listings to 2000×2000px or larger for best quality. Upload at 2000px or larger for the best Etsy thumbnail and zoom quality. Convert to JPG with white background fill. Free, private, browser-based."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
