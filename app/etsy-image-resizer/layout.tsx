import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Etsy Image Resizer — Listing Photos to 2000×2000 | Toolsz",
  description:
    "Resize product photos for Etsy listings to 2000×2000px. JPG output with white background option. Meets Etsy's image quality recommendations. Free, browser-based, no signup.",
  keywords: [
    "etsy image resizer",
    "etsy listing photo size",
    "etsy 2000x2000 image",
    "resize images for etsy",
    "etsy product photo requirements",
  ],
  openGraph: {
    title: "Etsy Image Resizer — Listing Photos to 2000×2000",
    description:
      "Resize product photos for Etsy listings to 2000×2000px with white background option. Free, private.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/etsy-image-resizer" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
