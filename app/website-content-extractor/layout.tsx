import type { Metadata } from "next";
import { SITE_URL } from "@/app/utils/seo";

export const metadata: Metadata = {
  title: "Website Content Extractor — Get Clean Article Text & Markdown from Any URL | Toolsz",
  description:
    "Paste any article URL to extract clean, reader-friendly text. Removes ads, navigation, and clutter. Export as Markdown or plain text. Free, no signup — the best free alternative to Mercury Reader and Readability.",
  keywords: [
    "website content extractor",
    "article extractor",
    "url to text",
    "webpage to markdown",
    "article text extractor",
    "web scraper no code",
    "clean article text",
    "extract text from url",
    "mercury reader alternative",
    "readable article extractor",
    "url to markdown",
    "web content cleaner",
    "remove ads from article",
  ],
  alternates: { canonical: `${SITE_URL}/website-content-extractor` },
  openGraph: {
    title: "Website Content Extractor — Clean Article Text from Any URL | Toolsz",
    description:
      "Extract clean article content from any URL. Export as Markdown or plain text. Free, no signup.",
    url: `${SITE_URL}/website-content-extractor`,
    siteName: "Toolsz",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Website Content Extractor — URL to Clean Text | Toolsz",
    description:
      "Extract clean readable content from any article URL. Export as Markdown or plain text. Free.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
