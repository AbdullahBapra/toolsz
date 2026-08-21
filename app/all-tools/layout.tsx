import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All 219 Free Online Tools | PDF, Image and Developer Utilities",
  description:
    "Browse all 219 free browser-based tools in one place. 77 PDF tools, 113 image tools, 29 developer utilities. No file uploads, no watermarks, no signup required. Filter by category.",
  keywords: [
    "all free online tools",
    "free tools list",
    "online tools directory 2026",
    "free pdf image developer tools",
    "all tools no upload",
    "browser based tools collection",
    "free utilities online",
    "complete list free tools",
    "219 free online tools",
    "tools directory no signup",
  ],
  openGraph: {
    title: "All 219 Free Online Tools | PDF, Image and Developer | Toolsz",
    description:
      "219 free browser-based tools. PDF, image, and developer utilities in one place. No uploads, no watermarks, no signup.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/all-tools" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
