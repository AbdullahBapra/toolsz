import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "77 Best Free PDF Tools Online in 2026 — No Upload, No Watermarks | Toolsz",
  description:
    "77 free PDF tools that run entirely in your browser — compress, merge, split, convert, sign, edit, OCR PDFs plus 45 format converters. No watermarks, no file uploads, no signup. Better than Smallpdf and iLovePDF.",
  keywords: [
    "best free pdf tools",
    "free pdf tools online 2026",
    "pdf tools no watermark",
    "free pdf editor online",
    "free pdf compressor online",
    "smallpdf alternative free",
    "ilovepdf alternative",
    "online pdf tools no signup",
    "best pdf tools without upload",
    "free pdf merger online",
    "pdf tools no registration",
    "best free pdf converter",
  ],
  openGraph: {
    title: "77 Best Free PDF Tools Online in 2026 — No Watermarks, No Upload",
    description:
      "77 browser-based PDF tools. Compress, merge, split, sign, convert & edit PDFs + 45 format converters. No uploads to servers, no watermarks on output, no signup required.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/best-free-pdf-tools" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
