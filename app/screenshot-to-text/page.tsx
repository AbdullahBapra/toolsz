import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  {
    q: "Can I use our Image to Text tool directly on screenshots?",
    a: "Yes — our Image to Text tool at /image-to-text accepts any image format including PNG screenshots, JPG, and WebP. Simply take a screenshot, save it, and upload it. The Tesseract OCR engine will extract all visible text from the screenshot.",
  },
  {
    q: "What types of text can be extracted from screenshots?",
    a: "OCR works best on printed text, UI elements, menus, dialog boxes, website content, and documents. High-contrast text on clean backgrounds gives the most accurate results. Dark text on white or light backgrounds is ideal.",
  },
  {
    q: "How accurate is screenshot OCR?",
    a: "For screenshots of digital text (websites, apps, documents), OCR accuracy is typically 95–99% because the text is already rendered at screen resolution. Screenshots of photos of printed text may have lower accuracy depending on lighting and angle.",
  },
  {
    q: "Can I extract text from multiple screenshots at once?",
    a: "Our Image to Text tool processes one image at a time. For bulk OCR of many screenshots, use tools like Adobe Acrobat Pro, ABBYY FineReader, or the Google Drive OCR feature (upload images to Drive, right-click, open with Google Docs).",
  },
];

const relatedTools = [
  { name: "Image to Text", href: "/image-to-text" },
  { name: "Screenshot to Table", href: "/screenshot-to-table" },
  { name: "PDF OCR", href: "/pdf-ocr" },
];

export default function ScreenshotToTextPage() {
  return (
    <PdfConverterStub
      title="Screenshot to Text — OCR Tool"
      description="Extract text from screenshots using OCR. Upload your screenshot and get all visible text instantly — UI elements, website content, dialog boxes, and more."
      reason="Use our Image to Text tool — it supports screenshots directly. Upload your screenshot and the OCR engine extracts all visible text."
      alternatives={[
        { name: "Image to Text (our OCR tool)", href: "/image-to-text" },
        { name: "Screenshot to Table (structured data)", href: "/screenshot-to-table" },
      ]}
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
