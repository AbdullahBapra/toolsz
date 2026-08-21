import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bulk Watermark Adder — Add Watermarks to Multiple Images | Toolsz",
  description:
    "Add watermarks to multiple images at once. Protect your photos with text or logo watermarks in bulk.",
  keywords: [
    "bulk watermark adder",
    "batch watermark images",
    "add watermark multiple images",
    "bulk watermark",
    "batch add watermark",
  ],
  openGraph: {
    title: "Bulk Watermark Adder — Add Watermarks to Multiple Images",
    description:
      "Add watermarks to multiple images at once. Free alternatives and tools.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/bulk-watermark-adder" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
