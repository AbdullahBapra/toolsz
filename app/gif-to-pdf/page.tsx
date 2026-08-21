import ImagesToPdfConverter from "@/app/components/ImagesToPdfConverter";

const faqs = [
  { q: "How does GIF to PDF conversion work?", a: "Each GIF image (using its first frame for animated GIFs) is rendered to a canvas and embedded into the PDF as a high-quality image. Multiple GIFs each get their own page." },
  { q: "What happens with animated GIFs?", a: "Animated GIFs use the first frame for the PDF page. PDF does not support frame-by-frame GIF animation. If you need animated output, the page will show the static first frame." },
  { q: "Can I convert multiple GIFs into one PDF?", a: "Yes. Upload multiple GIF files and they are combined into a single multi-page PDF, with each GIF image on its own page." },
  { q: "Why would I convert a GIF to PDF?", a: "Common use cases include archiving GIF memes or stickers as documents, including GIF illustrations in PDF reports, or sharing GIF graphics in a universally compatible format." },
];

const relatedTools = [
  { name: "JPG to PDF", href: "/jpg-to-pdf" },
  { name: "PNG to PDF", href: "/png-to-pdf" },
  { name: "PDF to GIF", href: "/pdf-to-gif" },
  { name: "PNG to GIF", href: "/png-to-gif" },
  { name: "Image to PDF", href: "/image-to-pdf" },
];

export default function GifToPdfPage() {
  return (
    <ImagesToPdfConverter
      fromFormat="GIF"
      fromExts=".gif,.GIF"
      isBulk={true}
      title="GIF to PDF Converter"
      description="Convert GIF images to PDF in your browser — free, instant, no upload. Animated GIFs use the first frame. Combine multiple GIFs into one PDF document. No watermarks."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
