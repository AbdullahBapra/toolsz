import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "29 Best Free Developer Tools Online in 2026 | Browser-Based",
  description:
    "The 29 best free browser-based developer tools. JSON formatter, regex tester, code screenshot, QR generator, Base64 encoder, CSS gradient builder, diff checker, resume builder, Word to PDF and more. No install, no signup.",
  keywords: [
    "best free developer tools online 2026",
    "free developer utilities browser",
    "free json formatter online",
    "free regex tester online",
    "best free coding tools",
    "free developer tools no signup",
    "browser based developer tools",
    "free qr code generator",
    "free base64 encoder online",
    "best online tools for developers",
    "free diff checker online",
    "free code screenshot tool",
  ],
  openGraph: {
    title: "29 Best Free Developer Tools Online in 2026",
    description:
      "29 browser-based developer utilities. JSON, regex, QR codes, Base64, CSS gradients, diff checker, resume builder and more. No install, no signup.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/best-free-developer-tools" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
