import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  { q: "What is AZW3 format?", a: "AZW3 (Kindle Format 8) is Amazon's enhanced Kindle eBook format supporting complex layouts, fonts, and rich formatting. It's used on Kindle Fire tablets and modern Kindle e-ink readers." },
  { q: "How do I convert AZW3 to PDF?", a: "Calibre (free, open-source) can convert AZW3 to PDF. However, DRM-protected AZW3 files (purchased from Amazon) cannot be converted without removing the DRM first, which may violate Amazon's terms of service." },
  { q: "Are most AZW3 files DRM-protected?", a: "AZW3 files purchased from the Amazon Kindle Store have DRM (copy protection). AZW3 files you created or received from the author are typically DRM-free and can be freely converted with Calibre." },
  { q: "What's the easiest way to read an AZW3 file on a computer?", a: "Download the free Kindle app for Windows or Mac — it reads AZW3 files natively. For conversion, use Calibre with DRM-free AZW3 files." },
];

export default function Azw3ToPdfPage() {
  return (
    <PdfConverterStub
      title="AZW3 to PDF Converter"
      description="Convert AZW3 Kindle ebooks to PDF. Learn about AZW3 format, DRM considerations, and the best free tools for converting Amazon Kindle format to PDF."
      reason="AZW3 decoding requires Amazon's proprietary format libraries. DRM-protected files also require license removal before conversion. Calibre handles DRM-free AZW3 conversion — it's the best free desktop tool."
      alternatives={[
        { name: "PDF to AZW3 (reverse)", href: "/pdf-to-azw3" },
        { name: "EPUB to PDF (universal eBook format)", href: "/epub-to-pdf" },
        { name: "Calibre (free AZW3 to PDF)", href: "https://calibre-ebook.com", external: true },
      ]}
      faqs={faqs}
      relatedTools={[
        { name: "PDF to AZW3", href: "/pdf-to-azw3" },
        { name: "MOBI to PDF", href: "/mobi-to-pdf" },
        { name: "EPUB to PDF", href: "/epub-to-pdf" },
      ]}
    />
  );
}
