import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  { q: "What is MOBI format?", a: "MOBI is Amazon's Kindle eBook format (used on Kindle e-ink devices). It was the primary format before Amazon introduced KFX/AZW3. MOBI files can be sent to Kindle devices via email or USB." },
  { q: "How do I convert PDF to MOBI for Kindle?", a: "Calibre (free desktop app) is the best tool: import your PDF, select MOBI as output format, and click Convert. Alternatively, Amazon's 'Send to Kindle' service can automatically convert PDFs sent to your Kindle email." },
  { q: "What's the difference between MOBI and AZW3?", a: "AZW3 is the enhanced Kindle format (Kindle Format 8) supporting more complex layouts. MOBI is the older, more compatible format. For most Kindle devices, EPUB via Calibre or 'Send to Kindle' is easier than MOBI." },
  { q: "Can I just email the PDF to my Kindle?", a: "Yes. Send your PDF to your Kindle email address (found in your Amazon account > Manage Your Content and Devices). Amazon converts it to Kindle format automatically. This is often the easiest solution." },
];

export default function PdfToMobiPage() {
  return (
    <PdfConverterStub
      title="PDF to MOBI Converter"
      description="Convert PDF to MOBI for Kindle eReaders. Learn about PDF to MOBI conversion and the best free tools — including sending PDF directly to your Kindle."
      reason="MOBI encoding requires Amazon's proprietary format libraries. The best approaches are Calibre (free desktop app) or Amazon's 'Send to Kindle' service which automatically converts PDFs."
      alternatives={[
        { name: "MOBI to PDF (reverse)", href: "/mobi-to-pdf" },
        { name: "Calibre (free MOBI converter)", href: "https://calibre-ebook.com", external: true },
        { name: "Amazon Send to Kindle", href: "https://www.amazon.com/sendtokindle", external: true },
      ]}
      faqs={faqs}
      relatedTools={[
        { name: "MOBI to PDF", href: "/mobi-to-pdf" },
        { name: "EPUB to PDF", href: "/epub-to-pdf" },
        { name: "PDF to EPUB", href: "/pdf-to-epub" },
      ]}
    />
  );
}
