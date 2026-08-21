import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  {
    q: "How well does OCR work on handwritten text?",
    a: "OCR accuracy on handwriting varies significantly. Print handwriting (block letters, clearly separated characters) achieves 70–90% accuracy with Tesseract OCR. Cursive or connected handwriting is much harder — accuracy can drop to 40–60%. AI-powered tools like Google Lens and Microsoft Lens are significantly better for cursive.",
  },
  {
    q: "How can I get the best results when converting handwriting?",
    a: "Use good lighting with no shadows across the text. Shoot straight down (not at an angle) to avoid perspective distortion. Write on plain white paper with dark ink. Keep characters clearly separated. High-contrast, well-lit photos dramatically improve OCR accuracy.",
  },
  {
    q: "What is the difference between Tesseract OCR and Google Lens for handwriting?",
    a: "Tesseract (used in our Image to Text tool) is a traditional OCR engine optimized for printed text. Google Lens uses deep learning models specifically trained on handwriting recognition and handles cursive, stylized writing, and mixed languages much better. For complex handwriting, Google Lens is the recommended tool.",
  },
  {
    q: "Can I convert an entire notebook of handwritten notes?",
    a: "For large volumes of handwritten notes, Microsoft OneNote has a built-in 'Ink to Text' feature that works well. Google Drive OCR also handles handwriting when you open an image with Google Docs. Adobe Acrobat Pro supports OCR on handwritten documents. For individual pages, our Image to Text tool at /image-to-text works for clearly printed handwriting.",
  },
];

const relatedTools = [
  { name: "Image to Text", href: "/image-to-text" },
  { name: "Screenshot to Text", href: "/screenshot-to-text" },
  { name: "PDF OCR", href: "/pdf-ocr" },
];

export default function HandwritingToTextPage() {
  return (
    <PdfConverterStub
      title="Handwriting to Text Converter"
      description="Convert handwritten notes and documents to digital text using OCR. Upload a photo of your handwriting and extract the text instantly."
      reason="Our Image to Text tool uses Tesseract OCR which works for printed handwriting. For complex cursive, Microsoft Lens or Google Lens offer better AI-powered handwriting recognition."
      alternatives={[
        { name: "Image to Text (our OCR tool)", href: "/image-to-text" },
        { name: "Microsoft Lens (mobile app)", href: "https://www.microsoft.com/en-us/microsoft-365/microsoft-lens", external: true },
      ]}
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
