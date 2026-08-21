import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  {
    q: "What's the quality difference between PNG and GIF?",
    a: "Significant for photos. GIF is limited to 256 colors (8-bit palette) while PNG supports 16 million colors. For photos, GIF creates visible color banding and dithering. For simple graphics, logos, and illustrations with few colors, the difference is minimal.",
  },
  {
    q: "Why would I convert PNG to GIF?",
    a: "Common reasons: GIF has broader support in older email clients and legacy systems; animated GIF is the universal format for simple web animations; some platforms only accept GIF; and simple flat graphics can be smaller as GIF than PNG.",
  },
  {
    q: "Does GIF support transparency?",
    a: "Yes, but only binary transparency — pixels are either fully transparent or fully opaque. There's no partial transparency (alpha channel) like PNG supports. Semi-transparent elements in your PNG will be rendered as either fully visible or invisible in the GIF.",
  },
  {
    q: "Will the converted GIF be larger or smaller than my PNG?",
    a: "Depends on the image. For simple graphics with very few colors (logos, icons, flat illustrations), GIF can be smaller than PNG. For photos or complex images, PNG is typically smaller and much higher quality. WebP beats both for web use.",
  },
  {
    q: "Can I create animated GIFs from PNG files?",
    a: "This tool converts a single PNG to a static (single-frame) GIF. For animated GIFs from multiple images or from a video, use our dedicated GIF Maker tool at /gif-maker which supports multi-frame animations with custom timing.",
  },
];

const relatedTools = [
  { name: "Bulk PNG to GIF", href: "/bulk-png-to-gif" },
  { name: "GIF Maker", href: "/gif-maker" },
  { name: "PNG to JPG", href: "/png-to-jpg" },
  { name: "PNG to WebP", href: "/png-to-webp" },
  { name: "JPG to PNG", href: "/jpg-to-png" },
  { name: "Video to GIF", href: "/video-to-gif" },
];

export default function PngToGifPage() {
  return (
    <ImageFormatConverter
      fromFormat="PNG"
      toFormat="GIF"
      fromExts=".png,.PNG"
      toMime="image/gif"
      toExt="gif"
      useGifEncoder={true}
      hasQuality={false}
      isBulk={false}
      title="PNG to GIF Converter"
      description="Convert PNG images to GIF format instantly. Creates a static single-frame GIF with 256-color palette. Free, private, browser-based — no server uploads required."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
