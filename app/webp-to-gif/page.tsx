import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  { q: "Why convert WebP to GIF?", a: "GIF is supported by virtually every platform for embedding in older systems, email signatures, or services that don't support WebP. Note that GIF's 256-color limit will reduce quality compared to the WebP source." },
  { q: "Will the GIF quality be worse than WebP?", a: "Yes. GIF is limited to 256 colors per frame, which causes visible banding and dithering in photographic content. WebP supports millions of colors. For most modern use cases, keep images in WebP or PNG." },
  { q: "Is the output animated?", a: "No — this converts a single WebP frame to a static GIF. Animated WebP to animated GIF conversion requires specialized tools." },
];

const relatedTools = [
  { name: "GIF to WebP", href: "/gif-to-webp" },
  { name: "WebP to PNG", href: "/webp-to-png" },
  { name: "PNG to GIF", href: "/png-to-gif" },
  { name: "GIF Maker", href: "/gif-maker" },
];

export default function WebpToGifPage() {
  return (
    <ImageFormatConverter
      fromFormat="WebP"
      toFormat="GIF"
      fromExts=".webp,.WEBP"
      toMime="image/gif"
      toExt="gif"
      useGifEncoder={true}
      hasQuality={false}
      isBulk={true}
      title="WebP to GIF Converter"
      description="Convert WebP to GIF online. Note: GIF has a 256-color limit which reduces quality for photos. Free, private, instant."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
