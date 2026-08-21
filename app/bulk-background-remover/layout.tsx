import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bulk Background Remover — Free Online Tool | Toolsz",
  description:
    "Remove backgrounds from multiple images at once. AI-powered bulk background removal for product photos, portraits, and more.",
  keywords: [
    "bulk background remover",
    "batch background removal",
    "remove background multiple images",
    "bulk remove bg",
    "batch transparent background",
  ],
  openGraph: {
    title: "Bulk Background Remover — Free Online Tool",
    description:
      "Remove backgrounds from multiple images at once using AI. Free alternatives and tools.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/bulk-background-remover" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
