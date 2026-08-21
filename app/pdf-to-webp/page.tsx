import PdfToImageConverter from "@/app/components/PdfToImageConverter";

const faqs = [
  { q: "Why convert PDF to WebP?", a: "WebP images are 25-35% smaller than equivalent JPEG files at the same visual quality — making PDF to WebP ideal when you need PDF content as web-optimized images for websites or apps." },
  { q: "What is the quality of the WebP output?", a: "WebP is output at 95% quality with your chosen DPI (72, 150, or 300). For screen use, 150 DPI WebP gives excellent clarity at small file sizes." },
  { q: "Is WebP widely supported?", a: "Yes. WebP is supported by Chrome, Firefox, Safari (since iOS 14/macOS Big Sur), and Edge. It is now the dominant web image format. However, some older software may not support it." },
  { q: "How do I get all PDF pages as WebP?", a: "All pages are automatically converted. For single-page PDFs, a single .webp file downloads. For multi-page PDFs, all WebP images are packaged in a ZIP archive." },
];

const relatedTools = [
  { name: "PDF to PNG", href: "/pdf-to-png" },
  { name: "PDF to JPG", href: "/pdf-to-jpg" },
  { name: "PDF to GIF", href: "/pdf-to-gif" },
  { name: "WebP to PDF", href: "/webp-to-pdf" },
  { name: "PNG to WebP", href: "/png-to-webp" },
];

export default function PdfToWebpPage() {
  return (
    <PdfToImageConverter
      toMime="image/webp"
      toExt="webp"
      title="PDF to WebP Converter"
      description="Convert PDF pages to WebP images — free, no upload, browser-based. WebP output is 25-35% smaller than JPEG at the same quality. All pages converted, ZIP download. No watermarks."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
