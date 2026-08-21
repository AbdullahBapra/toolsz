import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  { q: "What would PDF to SVG conversion produce?", a: "True PDF to SVG conversion would extract vector paths, fonts, and shapes from the PDF and reconstruct them as SVG elements. This preserves infinite scalability — the SVG can be scaled to any size without pixelation." },
  { q: "Why is PDF to SVG so difficult?", a: "PDF is a complex format with its own vector graphics model (PostScript-based). Accurately converting PDF vector data to SVG requires deep parsing of PDF content streams, font handling, and graphics state — this is beyond browser capability." },
  { q: "What tools can convert PDF to SVG accurately?", a: "Inkscape (free, open-source) offers excellent PDF to SVG conversion via File > Import. Adobe Illustrator can open PDFs and export as SVG. pdf2svg (command-line tool) is also excellent for automated workflows." },
  { q: "Can I convert PDF pages to raster SVG?", a: "Yes — though it would be an SVG containing a raster (bitmap) image rather than true vectors. This is equivalent to converting to PNG and wrapping it in an SVG container. Consider PDF to PNG as the practical alternative." },
];

const relatedTools = [
  { name: "PDF to PNG", href: "/pdf-to-png" },
  { name: "PDF to JPG", href: "/pdf-to-jpg" },
  { name: "SVG to PDF", href: "/svg-to-pdf" },
];

export default function PdfToSvgPage() {
  return (
    <PdfConverterStub
      title="PDF to SVG Converter"
      description="Convert PDF pages to SVG vector format. Learn about PDF to SVG conversion and the best tools for true vector output from PDF files."
      reason="PDF to SVG conversion requires deep PDF content parsing to extract vector paths, fonts, and graphics — this complexity is beyond browser-based tools. Use Inkscape (free) or Adobe Illustrator for accurate PDF to SVG conversion."
      alternatives={[
        { name: "Convert to PNG instead", href: "/pdf-to-png" },
        { name: "Inkscape (free, desktop)", href: "https://inkscape.org", external: true },
      ]}
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
