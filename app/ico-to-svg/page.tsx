import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  { q: "Can ICO files be converted to true vector SVG?", a: "Not directly — ICO files contain raster (pixel) images, not vector data. Converting ICO to SVG as a true vector requires vector tracing (like our PNG to SVG tool), which approximates the pixel data as vector shapes. The result is a traced SVG, not a true vector." },
  { q: "What's the best approach for getting an SVG from an ICO?", a: "Two-step: (1) Extract the ICO to PNG using our ICO to PNG converter, (2) Trace or embed in SVG using our PNG to SVG converter. The 'Pixel Perfect' mode creates a scalable SVG container, while tracing modes attempt to vectorize the icon." },
  { q: "Why is getting a true SVG from ICO so hard?", a: "SVG is a vector format based on mathematical curves, while ICO contains raster pixels. 'Converting' between them is like converting a JPEG photograph to a hand-drawn illustration — the conversion requires interpretation (tracing), not a direct format translation." },
  { q: "I have a logo as ICO — how do I get the original vector?", a: "If you created the icon from a vector source (SVG, AI, or EPS file), retrieve the original file. If you only have the ICO, use our ICO to PNG converter to extract the highest-resolution version, then manually recreate the vector in Inkscape (free) or Adobe Illustrator." },
];

const relatedTools = [
  { name: "Step 1: ICO to PNG", href: "/ico-to-png" },
  { name: "Step 2: PNG to SVG (trace)", href: "/png-to-svg" },
  { name: "SVG to ICO (reverse)", href: "/svg-to-ico" },
  { name: "PNG to ICO", href: "/png-to-ico" },
];

export default function IcoToSvgPage() {
  return (
    <PdfConverterStub
      title="ICO to SVG Converter"
      description="Convert ICO favicon to SVG. ICO contains raster pixels, not vectors — use our two-step PNG→SVG approach instead."
      reason="ICO files contain raster pixel data, not vector paths. True ICO to SVG conversion requires vector tracing. Use our two-step approach: extract ICO to PNG (ICO to PNG tool), then trace to SVG (PNG to SVG tool with your preferred mode)."
      alternatives={[
        { name: "Step 1: ICO to PNG", href: "/ico-to-png" },
        { name: "Step 2: PNG to SVG (pixel-perfect or traced)", href: "/png-to-svg" },
        { name: "SVG to ICO (if you have the source SVG)", href: "/svg-to-ico" },
        { name: "Inkscape (free vector editor)", href: "https://inkscape.org", external: true },
      ]}
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
