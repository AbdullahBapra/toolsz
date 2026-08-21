import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  {
    q: "How do I take a good photo of a receipt for OCR?",
    a: "Lay the receipt flat on a dark, contrasting surface. Photograph straight down from directly above to avoid perspective distortion. Ensure even lighting with no shadows across the text. If the receipt is crumpled, flatten it first. High-contrast, shadow-free photos give the most accurate text extraction.",
  },
  {
    q: "Can OCR extract structured data like item names, prices, and totals?",
    a: "Our Image to Text tool extracts all visible text as plain text. For structured extraction (items, quantities, prices, totals as separate fields), use Google Lens or specialized receipt scanning apps like Expensify, Veryfi, or Dext — these use AI to parse receipt structure.",
  },
  {
    q: "What receipt formats work best with OCR?",
    a: "Printed thermal receipts (the most common type) work well if photographed clearly. Digital receipts (screenshots of email receipts) work nearly perfectly. Handwritten receipts are less accurate. Very long receipts may need to be photographed in sections.",
  },
  {
    q: "Can I use this for expense reporting?",
    a: "For basic expense reporting, extracting the text and copying the total amount and merchant name manually is quick. For automated expense reporting, dedicated apps like Expensify, Rydoo, or Zoho Expense scan receipts and automatically create expense entries.",
  },
];

const relatedTools = [
  { name: "Image to Text", href: "/image-to-text" },
  { name: "Screenshot to Text", href: "/screenshot-to-text" },
  { name: "Business Card Scanner", href: "/business-card-scanner" },
];

export default function ReceiptScannerPage() {
  return (
    <PdfConverterStub
      title="Receipt Scanner — Extract Text from Receipts"
      description="Scan receipts and extract text using OCR. Upload a photo of your receipt to get all text including items, prices, totals, and store information."
      reason="Use our Image to Text tool to extract text from receipt photos. For structured receipt data (totals, items, dates), take a clear photo and upload to our OCR tool."
      alternatives={[
        { name: "Image to Text (our OCR tool)", href: "/image-to-text" },
        { name: "Google Lens (free mobile OCR)", href: "https://lens.google.com", external: true },
      ]}
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
