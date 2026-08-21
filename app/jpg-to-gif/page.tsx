import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  { q: "Why would I convert JPG to GIF?", a: "GIF is primarily used for animation. Converting a static JPG to GIF typically makes sense when you need to embed it in a system that only accepts GIF, or as a step in creating an animated sequence. For still images, JPG or PNG are better formats." },
  { q: "Does GIF support the full JPG color range?", a: "No. GIF is limited to 256 colors per frame. Converting a JPG photo (which can have millions of colors) to GIF will reduce the color palette and may cause visible banding or dithering, especially in gradients and photos." },
  { q: "Why is the GIF larger than the JPG?", a: "JPG is optimized for photos with its lossy compression. GIF uses lossless LZW compression but with a 256-color palette. For photographic content, JPG is almost always smaller. GIF's advantage is animation." },
  { q: "Can I use this for animated GIFs?", a: "No — this tool creates a single-frame (static) GIF from your JPG. To create animated GIFs, use our GIF Maker tool." },
];

const relatedTools = [
  { name: "GIF to JPG", href: "/gif-to-jpg" },
  { name: "PNG to GIF", href: "/png-to-gif" },
  { name: "GIF Maker", href: "/gif-maker" },
  { name: "JPG to PNG", href: "/jpg-to-png" },
];

export default function JpgToGifPage() {
  return (
    <ImageFormatConverter
      fromFormat="JPG"
      toFormat="GIF"
      fromExts=".jpg,.jpeg,.JPG,.JPEG"
      toMime="image/gif"
      toExt="gif"
      useGifEncoder={true}
      hasQuality={false}
      isBulk={true}
      title="JPG to GIF Converter"
      description="Convert JPG images to GIF format online. Note: GIF has a 256-color limit — for photos, PNG or JPG are better choices. Free, private, instant."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
