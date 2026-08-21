import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  { q: "Why convert SVG to WebP?", a: "WebP is an efficient raster format supported by all modern browsers. Converting SVG to WebP is useful when you need a raster image for platforms that don't support SVG, while keeping file sizes small." },
  { q: "Does WebP preserve SVG transparency?", a: "Yes — WebP supports full alpha-channel transparency. If your SVG has transparent areas, they will be preserved in the WebP output." },
  { q: "What resolution will the WebP be?", a: "The WebP will have the same pixel dimensions as the SVG's intrinsic size. For best results, ensure your SVG has explicit width/height attributes set to the dimensions you need." },
  { q: "Is WebP supported everywhere?", a: "WebP is supported in all modern browsers. For older systems or apps, use PNG instead, which has universal support and also preserves transparency." },
];

const relatedTools = [
  { name: "SVG to PNG", href: "/svg-to-png" },
  { name: "SVG to JPG", href: "/svg-to-jpg" },
  { name: "WebP to SVG", href: "/webp-to-svg" },
  { name: "SVG Optimizer", href: "/svg-optimizer" },
];

export default function SvgToWebpPage() {
  return (
    <ImageFormatConverter
      fromFormat="SVG"
      toFormat="WebP"
      fromExts=".svg,.SVG"
      toMime="image/webp"
      toExt="webp"
      hasQuality={true}
      defaultQuality={0.92}
      isBulk={true}
      title="SVG to WebP Converter"
      description="Convert SVG vector graphics to WebP raster format online. Preserves transparency. Free, private, instant — no upload needed."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
