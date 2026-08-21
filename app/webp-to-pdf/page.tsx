import ImagesToPdfConverter from "@/app/components/ImagesToPdfConverter";

const faqs = [
  { q: "Why convert WebP to PDF?", a: "WebP is a web format not universally supported in document workflows. Converting to PDF makes your WebP images shareable, printable, and viewable in any PDF reader without format compatibility concerns." },
  { q: "Can I batch convert multiple WebP images to one PDF?", a: "Yes. Upload multiple WebP files and they will be combined into a single multi-page PDF — ideal for collecting web screenshots or downloaded WebP images into a document." },
  { q: "Will the WebP quality be maintained in the PDF?", a: "Yes. WebP images are converted via canvas rendering (a high-fidelity process) and embedded in the PDF at near-original quality. The conversion uses JPEG embedding at 95% quality." },
  { q: "Does this tool support animated WebP files?", a: "The converter uses the first/static frame of animated WebP files. For animated output, try our GIF to PDF converter." },
];

const relatedTools = [
  { name: "JPG to PDF", href: "/jpg-to-pdf" },
  { name: "PNG to PDF", href: "/png-to-pdf" },
  { name: "PDF to WebP", href: "/pdf-to-webp" },
  { name: "WebP to PNG", href: "/webp-to-png" },
  { name: "Image to PDF", href: "/image-to-pdf" },
];

export default function WebpToPdfPage() {
  return (
    <ImagesToPdfConverter
      fromFormat="WebP"
      fromExts=".webp,.WEBP"
      isBulk={true}
      title="WebP to PDF Converter"
      description="Convert WebP images to PDF in your browser — free, instant, no upload required. Combine multiple WebP files into one professional PDF. Works offline, no watermarks."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
