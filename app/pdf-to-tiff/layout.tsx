import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to TIFF Converter — Browser Limitation Info | Toolsz",
  description: "Learn about PDF to TIFF conversion. Browsers cannot encode TIFF files natively — discover the best alternative tools for converting PDF pages to TIFF images.",
  keywords: ["pdf to tiff", "pdf to tif", "convert pdf to tiff", "pdf tiff converter", "pdf to scanned image"],
  alternates: { canonical: "https://www.toolsz.co/pdf-to-tiff" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
