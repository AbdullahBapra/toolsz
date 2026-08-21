import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  { q: "Can I convert a PDF book to EPUB for my eReader?", a: "PDF to EPUB conversion is challenging because PDF is a fixed-layout format while EPUB is reflowable. Tools like Calibre (free, desktop) do a good job of extracting PDF text and reflowing it into EPUB chapters." },
  { q: "What is EPUB format?", a: "EPUB (Electronic Publication) is the universal eBook format supported by Apple Books, Kobo, Nook, and most non-Kindle eReaders. It allows text to reflow at any font size, unlike the fixed-layout PDF." },
  { q: "What's the best PDF to EPUB converter?", a: "Calibre (free, open-source desktop app) is the gold standard for PDF to EPUB conversion. It offers robust conversion with configurable output options. Online tools like Zamzar also provide PDF to EPUB conversion." },
  { q: "Why can't browsers convert PDF to EPUB?", a: "EPUB creation requires packaging multiple HTML, CSS, and XML files into a specific ZIP structure (OPF manifest, NCX navigation). While technically possible, accurate text reflow from PDF layout requires complex processing." },
];

export default function PdfToEpubPage() {
  return (
    <PdfConverterStub
      title="PDF to EPUB Converter"
      description="Convert PDF documents to EPUB eBook format for eReaders. Learn about PDF to EPUB conversion and the best free tools including Calibre."
      reason="PDF to EPUB conversion requires reflowing fixed-layout PDF content into a responsive eBook format — complex processing not yet available in browser tools. Calibre (free desktop app) does this excellently."
      alternatives={[
        { name: "EPUB to PDF (reverse)", href: "/epub-to-pdf" },
        { name: "Calibre (best free PDF to EPUB)", href: "https://calibre-ebook.com", external: true },
        { name: "Zamzar (online PDF to EPUB)", href: "https://www.zamzar.com/convert/pdf-to-epub/", external: true },
      ]}
      faqs={faqs}
      relatedTools={[
        { name: "EPUB to PDF", href: "/epub-to-pdf" },
        { name: "PDF to Text", href: "/pdf-to-text" },
        { name: "PDF to HTML", href: "/pdf-to-html" },
      ]}
    />
  );
}
