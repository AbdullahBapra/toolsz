import ImageFormatConverter from "@/app/components/ImageFormatConverter";

const faqs = [
  { q: "Why convert GIF to JPG?", a: "JPG produces much smaller file sizes for photographic content and is universally supported everywhere. If you have a GIF that's a photo or screenshot (not an animation), converting to JPG typically reduces the size by 60-80%." },
  { q: "What happens to GIF transparency in JPG?", a: "JPG does not support transparency. Transparent areas in the GIF will be filled with white in the JPG output. If this is a problem, use PNG instead (which supports full transparency)." },
  { q: "Does converting GIF to JPG reduce quality?", a: "JPG introduces some compression artifacts (it's a lossy format). The conversion uses 92% quality by default, which is visually indistinguishable from the original for most content. GIF already has quality limitations (256 colors), so JPG may actually look smoother for photos." },
  { q: "What about animated GIFs?", a: "This tool converts the first frame of an animated GIF to a static JPG image. It does not support converting animated GIFs to animated formats." },
];

const relatedTools = [
  { name: "JPG to GIF", href: "/jpg-to-gif" },
  { name: "GIF to PNG", href: "/gif-to-png" },
  { name: "GIF to WebP", href: "/gif-to-webp" },
  { name: "PNG to JPG", href: "/png-to-jpg" },
];

export default function GifToJpgPage() {
  return (
    <ImageFormatConverter
      fromFormat="GIF"
      toFormat="JPG"
      fromExts=".gif,.GIF"
      toMime="image/jpeg"
      toExt="jpg"
      fillWhiteBg={true}
      hasQuality={true}
      defaultQuality={0.92}
      isBulk={true}
      title="GIF to JPG Converter"
      description="Convert GIF images to JPG format online. Smaller file sizes, universal compatibility. Transparent areas filled with white. Free, private, instant."
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
