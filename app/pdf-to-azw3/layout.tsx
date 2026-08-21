import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to AZW3 Converter — Kindle Format | Toolsz",
  description: "Convert PDF to AZW3 for Kindle Fire and Kindle apps. Learn about PDF to AZW3 conversion and the best tools for converting PDF to Amazon's enhanced Kindle format.",
  keywords: ["pdf to azw3", "convert pdf to azw3", "pdf to kindle fire", "pdf azw3 converter", "pdf to amazon kindle"],
  alternates: { canonical: "https://www.toolsz.co/pdf-to-azw3" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
