import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  { q: "What is the difference between XLS and XLSX?", a: "XLS is the legacy Excel format (Excel 97-2003). XLSX is the modern XML-based format (Excel 2007+). Our PDF to Excel tool outputs XLSX — modern Excel format compatible with all Excel versions including 2003+." },
  { q: "Can I use PDF to Excel instead?", a: "Yes — use our PDF to Excel tool to convert PDF data to XLSX format. XLSX is better than legacy XLS: it's smaller, more stable, and supported by every modern spreadsheet application." },
  { q: "How do I save XLSX as XLS?", a: "Open the XLSX in Microsoft Excel, click File > Save As > Excel 97-2003 Workbook (.xls). In LibreOffice Calc, go to File > Save As > Microsoft Excel 97-2003." },
];

export default function PdfToXlsPage() {
  return (
    <PdfConverterStub
      title="PDF to XLS Converter"
      description="Convert PDF to XLS Excel spreadsheet. Our PDF to Excel tool outputs modern XLSX format — editable in all versions of Excel and LibreOffice."
      reason="We output PDF to XLSX (the modern Excel format, fully compatible with all Excel versions back to 2003). XLSX is superior to legacy XLS — more reliable, smaller, and universally supported."
      alternatives={[
        { name: "PDF to Excel (XLSX format)", href: "/pdf-to-excel" },
        { name: "PDF to CSV (tabular data)", href: "/pdf-to-csv" },
        { name: "XLS to PDF", href: "/xls-to-pdf" },
      ]}
      faqs={faqs}
      relatedTools={[
        { name: "PDF to Excel", href: "/pdf-to-excel" },
        { name: "PDF to CSV", href: "/pdf-to-csv" },
        { name: "XLS to PDF", href: "/xls-to-pdf" },
      ]}
    />
  );
}
