import DocToPdfConverter from "@/app/components/DocToPdfConverter";

const faqs = [
  { q: "What is XLS format?", a: "XLS is the legacy Microsoft Excel file format used in Excel 97-2003. The modern Excel format is XLSX (Excel 2007+). XLS files are still common in older systems and databases that haven't migrated to newer formats." },
  { q: "Can I convert XLS files directly to PDF?", a: "Yes. The xlsx library reads both XLS and XLSX files in your browser. Your XLS file is processed locally and converted to a formatted PDF — no upload, no cloud service needed." },
  { q: "What's the difference between XLS and XLSX conversion?", a: "The conversion process is identical. Both use the xlsx library for reading and html2pdf.js for PDF creation. If your .xls file was created in Excel 2003 or earlier, it may have slightly different formatting than modern XLSX." },
  { q: "My XLS file has multiple sheets — will all be converted?", a: "Yes. Every sheet in the XLS workbook is converted to a separate HTML table and included in the PDF, with the sheet name as a heading." },
];

const relatedTools = [
  { name: "Excel to PDF", href: "/excel-to-pdf" },
  { name: "PDF to Excel", href: "/pdf-to-excel" },
  { name: "CSV to PDF", href: "/csv-to-pdf" },
];

export default function XlsToPdfPage() {
  return (
    <DocToPdfConverter
      conversionType="excel"
      fromFormat="XLS"
      fromExts=".xls,.xlsx,.XLS,.XLSX"
      title="XLS to PDF Converter"
      description="Convert legacy XLS Excel files to PDF — free, browser-based, no upload. Old Excel 97-2003 files are converted with table formatting. No watermarks, no sign-up required."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
