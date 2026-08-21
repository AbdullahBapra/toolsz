import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Toolsz — 219 Free Browser-Based Online Tools | PDF, Image & Dev",
  description:
    "Toolsz is a suite of 219 Free, browser-based tools for PDF processing, image editing, and developer utilities. 100% client-side — your files never leave your device. No signup, no watermarks, no uploads.",
  keywords: [
    "about toolsz",
    "toolsz free online tools",
    "browser based tools no upload",
    "free pdf tools no signup",
    "privacy first online tools",
    "client side file processing",
    "free image tools browser",
    "free developer tools online",
    "no upload file tools",
    "toolsz privacy",
    "how toolsz works",
    "free tools for pdf image dev",
  ],
  openGraph: {
    title: "About Toolsz — 219 Free Tools. Zero Uploads. Zero Watermarks.",
    description:
      "Learn about Toolsz — 219 Free browser-based tools for PDF, images, and developers. All processing is client-side. Files never leave your device.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/about" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
