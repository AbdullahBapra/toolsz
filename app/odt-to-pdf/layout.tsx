import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free ODT to PDF Converter — LibreOffice Documents | Toolsz",
  description: "Convert ODT LibreOffice documents to PDF. Learn about ODT to PDF conversion and discover browser-based and desktop tools for converting OpenDocument files to PDF.",
  keywords: ["odt to pdf", "convert odt to pdf", "libreoffice to pdf", "openoffice to pdf", "odt pdf converter"],
  alternates: { canonical: "https://www.toolsz.co/odt-to-pdf" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
