import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to ODT Converter — OpenDocument Format Info | Toolsz",
  description: "Convert PDF to ODT (OpenDocument Text) for LibreOffice and OpenOffice. Learn about PDF to ODT conversion and the best tools to convert PDF to editable ODT documents.",
  keywords: ["pdf to odt", "convert pdf to odt", "pdf to libreoffice", "pdf to openoffice", "pdf odt converter"],
  alternates: { canonical: "https://www.toolsz.co/pdf-to-odt" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
