import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  { q: "What is AZW3 format?", a: "AZW3 (Kindle Format 8) is Amazon's enhanced eBook format supporting richer formatting than older MOBI. It's used by Kindle Fire, Kindle Paperwhite, and the Kindle app on phones and tablets." },
  { q: "How do I convert PDF to AZW3?", a: "Calibre (free, open-source) converts PDF to AZW3 — import your PDF and select AZW3 as the output format. The KindleGen tool (from Amazon) also creates AZW3 files from source documents." },
  { q: "Should I use AZW3 or EPUB for my Kindle?", a: "EPUB is now supported directly by Kindle (since 2022 firmware update). Converting PDF to EPUB with Calibre and transferring to Kindle is often easier than creating AZW3 files. Amazon's 'Send to Kindle' also handles PDF conversion automatically." },
  { q: "Is AZW3 the same as KFX?", a: "KFX (Kindle Format X) is Amazon's newer format introduced around 2015 with enhanced typography. AZW3 is the slightly older format. Both work on modern Kindle devices. Calibre supports both." },
];

export default function PdfToAzw3Page() {
  return (
    <PdfConverterStub
      title="PDF to AZW3 Converter"
      description="Convert PDF to AZW3 for Kindle Fire and Kindle apps. Learn about AZW3 format and the best free tools for PDF to Kindle conversion."
      reason="AZW3 encoding requires Amazon's proprietary format libraries. Calibre (free desktop app) is the best tool for PDF to AZW3 conversion. Amazon's 'Send to Kindle' service also handles PDF conversion automatically."
      alternatives={[
        { name: "AZW3 to PDF (reverse)", href: "/azw3-to-pdf" },
        { name: "Calibre (free AZW3 converter)", href: "https://calibre-ebook.com", external: true },
        { name: "Amazon Send to Kindle", href: "https://www.amazon.com/sendtokindle", external: true },
      ]}
      faqs={faqs}
      relatedTools={[
        { name: "AZW3 to PDF", href: "/azw3-to-pdf" },
        { name: "EPUB to PDF", href: "/epub-to-pdf" },
        { name: "PDF to MOBI", href: "/pdf-to-mobi" },
      ]}
    />
  );
}
