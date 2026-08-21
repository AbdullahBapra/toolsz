import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  {
    q: "How do I scan a business card with OCR?",
    a: "Take a clear, well-lit photo of the business card on a flat surface. Use our Image to Text tool at /image-to-text to upload the photo and extract all text. You can then copy the name, phone number, email, and address from the extracted text.",
  },
  {
    q: "Can OCR automatically create a contact from a business card?",
    a: "Our Image to Text tool extracts raw text — it does not automatically parse the text into structured contact fields. For automatic vCard creation, use smartphone apps like Google Lens (tap 'Save to Contacts'), CamCard, or ABBYY Business Card Reader, which are specifically designed for this task.",
  },
  {
    q: "What if the business card has unusual fonts or design elements?",
    a: "Decorative or script fonts on business cards can reduce OCR accuracy. Our OCR engine works best on standard sans-serif and serif fonts. If accuracy is low, try increasing contrast or brightness before uploading. Google Lens tends to handle stylized business card fonts better.",
  },
  {
    q: "Can I scan business cards in languages other than English?",
    a: "Our Image to Text tool uses Tesseract OCR with English language support by default. For business cards in other languages (Chinese, Japanese, Arabic, etc.), Google Lens or Microsoft Lens provide better multilingual recognition as they support 100+ languages.",
  },
];

const relatedTools = [
  { name: "Image to Text", href: "/image-to-text" },
  { name: "Receipt Scanner", href: "/receipt-scanner" },
  { name: "Screenshot to Text", href: "/screenshot-to-text" },
];

export default function BusinessCardScannerPage() {
  return (
    <PdfConverterStub
      title="Business Card Scanner — Extract Contact Info"
      description="Scan business cards and extract contact information using OCR. Upload a photo of any business card to get the name, phone number, email, and address as text."
      reason="Use our Image to Text tool to extract all text from business card photos. For automatic vCard/contact creation, smartphone apps like Google Lens or CamCard offer better structured extraction."
      alternatives={[
        { name: "Image to Text (our OCR tool)", href: "/image-to-text" },
        { name: "Google Contacts (scan in app)", href: "https://contacts.google.com", external: true },
      ]}
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
