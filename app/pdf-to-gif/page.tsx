import PdfToImageConverter from "@/app/components/PdfToImageConverter";

const faqs = [
  { q: "How does PDF to GIF work?", a: "Each PDF page is rendered to a canvas frame and encoded into an animated GIF using gif-encoder-2. The result is a single GIF file where each frame shows one PDF page, like an animated slideshow." },
  { q: "What speed is the GIF animation?", a: "Each frame displays for 1 second by default, creating a 1-second-per-slide animated presentation. This is optimized for readability of PDF text content." },
  { q: "Is there a page limit for PDF to GIF?", a: "There is no enforced limit, but very long documents (50+ pages) will create large GIF files and take longer to process. For best results, use PDFs up to 30 pages." },
  { q: "Why convert a PDF to animated GIF?", a: "Great use cases: sharing presentations as self-playing previews, creating animated document thumbnails, embedding PDF content into platforms that only support GIFs (like older Slack), or showing a visual overview of a multi-page document." },
  { q: "Will the GIF have all PDF pages?", a: "Yes. Every page in the PDF becomes one frame in the animated GIF, playing in page order with a 1-second delay between frames." },
];

const relatedTools = [
  { name: "PDF to PNG", href: "/pdf-to-png" },
  { name: "PDF to JPG", href: "/pdf-to-jpg" },
  { name: "PDF to WebP", href: "/pdf-to-webp" },
  { name: "GIF to PDF", href: "/gif-to-pdf" },
  { name: "PNG to GIF", href: "/png-to-gif" },
];

export default function PdfToGifPage() {
  return (
    <PdfToImageConverter
      toMime="image/gif"
      toExt="gif"
      isAnimatedGif={true}
      title="PDF to GIF Converter"
      description="Convert PDF to animated GIF — each page becomes an animation frame. Free, browser-based, no upload. Creates a self-playing slideshow GIF from your PDF presentation. No watermarks."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
