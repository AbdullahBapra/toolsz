import ImageToSvgConverter from "@/app/components/ImageToSvgConverter";

const faqs = [
  { q: "Can WebP be converted to real SVG vectors?", a: "This tool offers two modes: 'Pixel Perfect' embeds the WebP as base64 inside an SVG (exact quality, infinitely scalable container) and vector tracing modes (High Detail, Flat, Monochrome) trace the image into actual SVG paths. Use tracing for logos and icons; use Pixel Perfect for photos." },
  { q: "Which mode is recommended for WebP images?", a: "For most WebP images (photos), 'Pixel Perfect' is recommended — it creates a lossless SVG container that scales to any size. For WebP logos or icons with flat colors, try 'Flat Colors' or 'High Detail' tracing mode." },
  { q: "Why would I want an SVG wrapper around a raster image?", a: "SVG containers let you use raster images in SVG-based workflows (like Figma, Illustrator, or CSS backgrounds) while maintaining infinite scalability for the container. The image itself stays raster, but the SVG format enables things like CSS transforms and animations." },
];

const relatedTools = [
  { name: "SVG to WebP", href: "/svg-to-webp" },
  { name: "PNG to SVG", href: "/png-to-svg" },
  { name: "JPG to SVG", href: "/jpg-to-svg" },
  { name: "WebP to PNG", href: "/webp-to-png" },
];

export default function WebpToSvgPage() {
  return (
    <ImageToSvgConverter
      fromFormat="WebP"
      fromExts=".webp,.WEBP"
      title="WebP to SVG Converter"
      description="Convert WebP to SVG online. Pixel-perfect embedding or vector tracing. Free, private, instant — no upload needed."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
