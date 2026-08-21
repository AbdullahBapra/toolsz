import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  {
    q: "Does Amazon require white backgrounds on product photos?",
    a: "Yes. Amazon requires that main product images have a pure white background (RGB 255, 255, 255) with the product filling at least 85% of the image frame. Secondary images can have other backgrounds. Listings with non-white main images risk suppression.",
  },
  {
    q: "What background color do Shopify and Etsy prefer?",
    a: "Shopify recommends white or light grey backgrounds for consistency across your store. Etsy allows any background for listings, but white backgrounds tend to perform better in search results and look more professional. Some Etsy categories (like handmade goods) benefit from lifestyle backgrounds.",
  },
  {
    q: "How accurate is AI background removal for products?",
    a: "Modern AI tools like remove.bg achieve 95%+ accuracy on simple product photos with clear edges. Complex products with hair, fur, transparent elements, or reflective surfaces may need manual touch-up. Studio photos with controlled lighting produce the cleanest results.",
  },
  {
    q: "What is the best way to photograph products for easy background removal?",
    a: "Use a plain white or solid-color backdrop, ensure even lighting with no harsh shadows, shoot at a consistent distance, and keep the product in sharp focus. These conditions make AI background removal nearly perfect with no manual editing required.",
  },
];

const relatedTools = [
  { name: "Remove Background", href: "/remove-bg" },
  { name: "Product Image Resizer", href: "/product-image-resizer" },
  { name: "Amazon Image Resizer", href: "/amazon-image-resizer" },
];

export default function ProductBackgroundRemoverPage() {
  return (
    <PdfConverterStub
      title="Product Background Remover"
      description="Remove backgrounds from product photos for Amazon, Shopify, Etsy, and eBay. Get clean white background images that meet e-commerce platform requirements."
      reason="Product background removal requires AI segmentation models. Our Remove Background tool handles individual product photos. For bulk removal, remove.bg's API is the industry standard."
      alternatives={[
        { name: "Remove Background (our tool)", href: "/remove-bg" },
        { name: "remove.bg (optimized for products)", href: "https://www.remove.bg", external: true },
      ]}
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
