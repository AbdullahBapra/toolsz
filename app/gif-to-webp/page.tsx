import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  { q: "What are the advantages of WebP over GIF?", a: "WebP is typically 25-35% smaller than GIF at equivalent quality. WebP also supports full alpha-channel transparency (vs. GIF's binary transparency) and supports both lossy and lossless compression. Modern browsers support WebP natively." },
  { q: "Does WebP support animation like GIF?", a: "Yes, WebP supports animation. However, this tool converts a single GIF frame to a static WebP image. For animated WebP conversion, specialized tools are needed." },
  { q: "What happens to GIF transparency?", a: "GIF's index-based transparency is converted to WebP's full alpha channel — transparent areas remain transparent and may look smoother in WebP." },
  { q: "Is WebP widely supported?", a: "Yes. As of 2024, WebP is supported by all modern browsers (Chrome, Firefox, Safari 14+, Edge). For maximum compatibility with older systems, stick with PNG or JPG." },
];

const relatedTools = [
  { name: "WebP to GIF", href: "/webp-to-gif" },
  { name: "GIF to PNG", href: "/gif-to-png" },
  { name: "GIF to JPG", href: "/gif-to-jpg" },
  { name: "PNG to WebP", href: "/png-to-webp" },
];

export default function GifToWebpPage() {
  return (
    <ImageFormatConverter
      fromFormat="GIF"
      toFormat="WebP"
      fromExts=".gif,.GIF"
      toMime="image/webp"
      toExt="webp"
      hasQuality={true}
      defaultQuality={0.92}
      isBulk={true}
      title="GIF to WebP Converter"
      description="Convert GIF to WebP for smaller file sizes and better web performance. Preserves transparency. Free, private, no upload needed."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
