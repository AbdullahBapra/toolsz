import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  { q: "What is MOBI format?", a: "MOBI is Amazon's older Kindle eBook format. MOBI files work on Kindle e-ink readers and the Kindle app. Amazon's newer format is AZW3/KFX, but MOBI files remain widely used." },
  { q: "How do I convert MOBI to PDF?", a: "Calibre (free, open-source desktop app) is the best tool: import your MOBI file, select PDF as output format, and click Convert. The result is a PDF with the eBook's text and basic formatting." },
  { q: "Why can't browsers convert MOBI to PDF?", a: "MOBI is Amazon's proprietary format that requires specialized decoding libraries. These libraries are large and not available as browser-compatible JavaScript packages." },
  { q: "Can I read a MOBI file without converting it?", a: "Yes. Download the free Kindle app (Windows, Mac, iOS, Android) and open the MOBI file directly. Kindle apps read MOBI files natively without any conversion." },
];

export default function MobiToPdfPage() {
  return (
    <PdfConverterStub
      title="MOBI to PDF Converter"
      description="Convert MOBI Kindle ebooks to PDF. Learn about MOBI to PDF conversion and discover the best free tools — including Calibre — for converting Kindle books to PDF."
      reason="MOBI decoding requires Amazon's proprietary format libraries not available as browser JavaScript. Calibre (free, open-source) is the gold standard for MOBI to PDF conversion on desktop."
      alternatives={[
        { name: "PDF to MOBI (reverse)", href: "/pdf-to-mobi" },
        { name: "EPUB to PDF (EPUB is universal)", href: "/epub-to-pdf" },
        { name: "Calibre (free MOBI converter)", href: "https://calibre-ebook.com", external: true },
      ]}
      faqs={faqs}
      relatedTools={[
        { name: "PDF to MOBI", href: "/pdf-to-mobi" },
        { name: "EPUB to PDF", href: "/epub-to-pdf" },
        { name: "AZW3 to PDF", href: "/azw3-to-pdf" },
      ]}
    />
  );
}
