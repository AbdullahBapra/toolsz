import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Photo Optimizer — E-Commerce Image Optimizer | Toolsz",
  description:
    "Optimize product photos for e-commerce. Convert to JPG with white background fill, adjustable quality, and batch processing. Perfect for Amazon, Shopify, Etsy.",
  keywords: [
    "product photo optimizer",
    "ecommerce image optimizer",
    "optimize product images",
    "product photo to jpg",
    "white background product photo",
  ],
  openGraph: {
    title: "Product Photo Optimizer — E-Commerce Image Optimizer",
    description:
      "Optimize product photos for e-commerce with white background fill and quality adjustment. Batch process. Free, private.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/product-photo-optimizer" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
