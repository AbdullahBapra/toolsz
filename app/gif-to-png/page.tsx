import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  { q: "Does converting GIF to PNG lose quality?", a: "No. PNG is a lossless format, so converting a GIF frame to PNG produces an exact pixel-accurate result. Any quality loss in the original GIF (from its 256-color palette) is preserved but no new quality loss is introduced." },
  { q: "What happens to GIF transparency?", a: "GIF uses index-based transparency (one color is marked transparent). PNG supports full alpha-channel transparency, so the transparent areas are preserved and may look even cleaner in PNG than in GIF." },
  { q: "Will my animated GIF become a single PNG?", a: "Yes — this tool converts the first frame of an animated GIF to a static PNG. If you need to extract all frames, you'll need a dedicated GIF frame extractor tool." },
  { q: "Why is PNG better than GIF for most images?", a: "PNG supports millions of colors (vs. GIF's 256), full alpha transparency (vs. GIF's binary transparency), and produces smaller files for most content. GIF's advantage is animation — for static images, PNG is superior in every way." },
];

const relatedTools = [
  { name: "PNG to GIF", href: "/png-to-gif" },
  { name: "GIF to JPG", href: "/gif-to-jpg" },
  { name: "GIF to WebP", href: "/gif-to-webp" },
  { name: "PNG to JPG", href: "/png-to-jpg" },
  { name: "Compress Image", href: "/compress-image" },
];

export default function GifToPngPage() {
  return (
    <ImageFormatConverter
      fromFormat="GIF"
      toFormat="PNG"
      fromExts=".gif,.GIF"
      toMime="image/png"
      toExt="png"
      hasQuality={false}
      isBulk={true}
      title="GIF to PNG Converter"
      description="Convert GIF images to PNG format online. Preserves transparency, lossless quality, free and private — no file uploads needed."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
