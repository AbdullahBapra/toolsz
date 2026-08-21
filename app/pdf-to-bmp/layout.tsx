import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to BMP Converter — Browser Limitation Info | Toolsz",
  description: "Learn about PDF to BMP conversion. Browsers cannot encode BMP files natively — discover the best alternatives for converting PDF pages to bitmap images.",
  keywords: ["pdf to bmp", "convert pdf to bmp", "pdf to bitmap", "pdf bmp converter"],
  alternates: { canonical: "https://www.toolsz.co/pdf-to-bmp" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
