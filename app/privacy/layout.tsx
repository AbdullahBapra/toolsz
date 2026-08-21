import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Toolsz | Your Files Never Leave Your Browser",
  description:
    "Toolsz Privacy Policy — all 219 tools process files 100% client-side in your browser. Zero uploads. Zero data collection. Zero cookies for tracking. GDPR and CCPA compliant.",
  keywords: [
    "toolsz privacy policy",
    "no upload file tool privacy",
    "browser based tool privacy",
    "client side processing privacy",
    "toolsz data collection policy",
    "gdpr compliant free tools",
    "ccpa compliant tools",
    "zero data collection tools",
    "private pdf tools",
    "private image tools",
  ],
  openGraph: {
    title: "Privacy Policy — Toolsz | Files Never Leave Your Browser",
    description:
      "Toolsz processes all files 100% client-side. Zero uploads, zero data collection, zero tracking cookies. GDPR & CCPA compliant.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/privacy" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
