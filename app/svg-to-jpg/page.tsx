import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  { q: "Why convert SVG to JPG?", a: "JPG is a raster format supported by every application and service. SVG is a vector format that requires browser or SVG-capable software to render. Converting to JPG ensures your graphic works in any image viewer, editor, or upload form." },
  { q: "What resolution will the JPG be?", a: "The JPG will have the same pixel dimensions as the SVG's intrinsic size (defined by its width/height or viewBox attributes). For SVGs without explicit dimensions, the browser uses its natural rendering size." },
  { q: "Will I lose the ability to scale the image?", a: "Yes — JPG is a raster (pixel-based) format. Once converted, you lose the infinite scalability of SVG. If you need to resize later, keep the original SVG. For the JPG, ensure you export at the largest size you need." },
  { q: "What happens to SVG transparency?", a: "JPG doesn't support transparency. Any transparent areas in the SVG will be filled with white in the JPG output. If you need transparency, use our SVG to PNG converter instead." },
];

const relatedTools = [
  { name: "SVG to PNG", href: "/svg-to-png" },
  { name: "SVG to WebP", href: "/svg-to-webp" },
  { name: "JPG to SVG", href: "/jpg-to-svg" },
  { name: "SVG to ICO", href: "/svg-to-ico" },
  { name: "SVG Optimizer", href: "/svg-optimizer" },
];

export default function SvgToJpgPage() {
  return (
    <ImageFormatConverter
      fromFormat="SVG"
      toFormat="JPG"
      fromExts=".svg,.SVG"
      toMime="image/jpeg"
      toExt="jpg"
      fillWhiteBg={true}
      hasQuality={true}
      defaultQuality={0.92}
      isBulk={true}
      title="SVG to JPG Converter"
      description="Convert SVG vector graphics to JPG raster images online. Transparent areas become white. Free, private, instant — no upload needed."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
