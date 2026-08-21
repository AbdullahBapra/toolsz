import ImagesToPdfConverter from "@/app/components/ImagesToPdfConverter";

const faqs = [
  { q: "How is SVG converted to PDF?", a: "The SVG vector graphic is loaded as an image in the browser, rendered to a high-resolution canvas, then embedded into the PDF as a raster image. The PDF output is high-quality at the canvas resolution." },
  { q: "Will the SVG vectors be preserved in the PDF?", a: "The browser renders the SVG to a canvas first, so the PDF contains a high-resolution raster version of the SVG rather than preserved vector paths. For true vector PDF output, use professional tools like Inkscape or Adobe Illustrator." },
  { q: "What size/resolution will the SVG render at?", a: "SVG files without defined dimensions render at the SVG's intrinsic size. For best quality, ensure your SVG has explicit width and height attributes set to the desired pixel dimensions." },
  { q: "Can I convert multiple SVG files into one PDF?", a: "Yes. Upload multiple SVG files and they are combined into a single multi-page PDF — useful for combining icon sets, diagrams, or design mockups." },
];

const relatedTools = [
  { name: "JPG to PDF", href: "/jpg-to-pdf" },
  { name: "PNG to PDF", href: "/png-to-pdf" },
  { name: "Image to PDF", href: "/image-to-pdf" },
  { name: "PDF to PNG", href: "/pdf-to-png" },
];

export default function SvgToPdfPage() {
  return (
    <ImagesToPdfConverter
      fromFormat="SVG"
      fromExts=".svg,.SVG"
      isBulk={true}
      title="SVG to PDF Converter"
      description="Convert SVG vector graphics to PDF in your browser — free, instant, no upload. Renders SVG at high resolution and embeds in PDF. Combine multiple SVGs into one PDF. No watermarks."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
