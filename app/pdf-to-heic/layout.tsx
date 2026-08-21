import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to HEIC Converter — Browser Limitation Info | Toolsz",
  description: "Learn about PDF to HEIC conversion. Encoding HEIC files in a browser is not currently possible — discover the best alternatives for PDF to HEIC conversion.",
  keywords: ["pdf to heic", "convert pdf to heic", "pdf to iphone format", "pdf heic converter"],
  alternates: { canonical: "https://www.toolsz.co/pdf-to-heic" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
