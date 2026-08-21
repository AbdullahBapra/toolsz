import ImageToSvgConverter from "@/app/components/ImageToSvgConverter";

const faqs = [
  { q: "Can I truly convert a JPG photo to SVG vector?", a: "Yes — this tool offers two approaches. 'Pixel Perfect' embeds the JPG as a base64 image inside an SVG container, giving you SVG with infinite scalability. 'Vector Tracing' modes (High Detail, Flat, Monochrome) attempt to trace the image into actual vector paths, working best for logos and illustrations rather than complex photos." },
  { q: "Which mode should I choose for photos?", a: "For photos, use 'Pixel Perfect' mode. It wraps the JPG in an SVG container exactly, preserving all detail. Vector tracing modes work best for logos, icons, and flat illustrations — they struggle with photographic gradients and produce very large, complex SVG files for photos." },
  { q: "Why is my vector SVG so large?", a: "Photos contain millions of color transitions that don't map well to vector paths. High Detail mode may produce SVGs that are 5-50× larger than the original JPG for complex photos. This is expected — vector tracing is designed for logos and illustrations, not photos." },
  { q: "How does this compare to professional vectorization?", a: "Tools like Adobe Illustrator's Live Trace or Vector Magic produce better results for logos. This free browser-based tool works well for simple graphics. For professional logo vectorization, Pixel Perfect mode (SVG container) is always pixel-accurate." },
];

const relatedTools = [
  { name: "SVG to JPG", href: "/svg-to-jpg" },
  { name: "PNG to SVG", href: "/png-to-svg" },
  { name: "WebP to SVG", href: "/webp-to-svg" },
  { name: "SVG Optimizer", href: "/svg-optimizer" },
];

export default function JpgToSvgPage() {
  return (
    <ImageToSvgConverter
      fromFormat="JPG"
      fromExts=".jpg,.jpeg,.JPG,.JPEG"
      title="JPG to SVG Converter"
      description="Convert JPG to SVG online. Pixel-perfect SVG embedding or vector tracing with 4 modes. Free, private, instant — no upload needed."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
