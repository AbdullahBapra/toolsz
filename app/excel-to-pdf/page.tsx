import DocToPdfConverter from "@/app/components/DocToPdfConverter";

const faqs = [
  { q: "How does Excel to PDF conversion work?", a: "The Excel file is read using the xlsx library (locally in your browser). Each sheet is converted to an HTML table, then rendered to PDF using html2pdf.js. All sheets are included in the PDF." },
  { q: "Will all sheets in my Excel file be converted?", a: "Yes. Every sheet in your Excel workbook is converted to a table and included in the PDF. Sheet names are shown as headings above each table." },
  { q: "Are formulas included in the PDF?", a: "The PDF shows the calculated values from formulas, not the formula expressions themselves — just like how you'd see the spreadsheet when printed." },
  { q: "Will charts and images from Excel appear in the PDF?", a: "Charts and images embedded in Excel sheets are not included — this tool converts the data tables. For full chart/image fidelity, use Microsoft Excel's built-in 'Export to PDF' feature." },
  { q: "Can I convert .xlsx and .xls files?", a: "Yes. Both modern .xlsx (Excel 2007+) and legacy .xls (Excel 97-2003) files are supported by the xlsx library." },
];

const relatedTools = [
  { name: "PDF to Excel", href: "/pdf-to-excel" },
  { name: "XLS to PDF", href: "/xls-to-pdf" },
  { name: "CSV to PDF", href: "/csv-to-pdf" },
  { name: "PDF to CSV", href: "/pdf-to-csv" },
];

export default function ExcelToPdfPage() {
  return (
    <DocToPdfConverter
      conversionType="excel"
      fromFormat="Excel"
      fromExts=".xlsx,.xls,.XLSX,.XLS"
      title="Excel to PDF Converter"
      description="Convert Excel XLSX files to PDF — free, browser-based, no upload. All sheets are converted with styled table formatting. Instant download, no watermarks, no sign-up required."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
