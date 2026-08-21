import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free TXT to PDF Converter — No Upload, Instant | Toolsz",
  description: "Convert plain text .txt files to PDF — free, browser-based, no upload. Text is formatted in a clean, readable PDF document. No watermarks, no sign-up required.",
  keywords: ["txt to pdf", "text to pdf", "convert txt to pdf", "plain text to pdf", "notepad to pdf", ".txt to pdf"],
  alternates: { canonical: "https://www.toolsz.co/txt-to-pdf" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
