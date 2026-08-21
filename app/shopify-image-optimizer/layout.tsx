import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopify Image Optimizer — Perfect Product Photos | Toolsz",
  description:
    "Resize and optimize product images for Shopify to 2048×2048px. White background, JPG at 85% quality. Meets Shopify's product image recommendations. Free, browser-based.",
  keywords: [
    "shopify image optimizer",
    "shopify product image size",
    "shopify 2048x2048",
    "optimize images for shopify",
    "shopify image requirements",
  ],
  openGraph: {
    title: "Shopify Image Optimizer — Perfect Product Photos",
    description:
      "Resize and optimize product images for Shopify to 2048×2048px. White background, JPG output. Free, private.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/shopify-image-optimizer" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
