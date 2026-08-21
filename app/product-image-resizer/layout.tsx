import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Image Resizer — Amazon, Shopify, Etsy Sizes | Toolsz",
  description:
    "Resize product photos to the correct dimensions for Amazon (1000×1000), Shopify (2048×2048), Etsy (2000×2000), and eBay (1600×1600). Free, browser-based, no signup.",
  keywords: [
    "product image resizer",
    "amazon image size",
    "shopify product image size",
    "etsy image size",
    "ecommerce image resizer",
  ],
  openGraph: {
    title: "Product Image Resizer — Amazon, Shopify, Etsy Sizes",
    description:
      "Resize product photos to the correct dimensions for major e-commerce platforms. Free, private, browser-based.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/product-image-resizer" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
