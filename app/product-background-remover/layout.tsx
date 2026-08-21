import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Background Remover — Amazon, Shopify, Etsy | Toolsz",
  description:
    "Remove backgrounds from product photos for Amazon, Shopify, Etsy, and eBay. Get clean white background product images for e-commerce listings.",
  keywords: [
    "product background remover",
    "remove background product photo",
    "amazon white background",
    "shopify product background",
    "ecommerce background removal",
  ],
  openGraph: {
    title: "Product Background Remover — Amazon, Shopify, Etsy",
    description:
      "Remove backgrounds from product photos for e-commerce. Free tools and alternatives.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/product-background-remover" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
