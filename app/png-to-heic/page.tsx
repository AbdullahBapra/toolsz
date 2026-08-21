import PdfConverterStub from "@/app/components/PdfConverterStub";

const faqs = [
  { q: "Why would I convert PNG to HEIC?", a: "HEIC (used by iPhones) offers better compression than PNG — typically 50% smaller at equivalent quality. However, HEIC has limited software support outside Apple ecosystems. Converting to HEIC only makes sense if you specifically need this format for iOS/macOS workflows." },
  { q: "Why can't browsers encode HEIC?", a: "HEIC uses the HEVC (H.265) video codec for compression, which requires hardware encoding support and licensing. Browser vendors haven't implemented HEIC encoding — they focus on open formats like WebP and AVIF instead." },
  { q: "What software can convert PNG to HEIC?", a: "On Mac: use the Preview app (export as HEIC) or Shortcuts app. On Windows: the Photos app with the HEVC Video Extensions installed. iPhone shortcuts can also batch-convert. For Windows command line, FFmpeg with proper codecs can handle HEIC encoding." },
  { q: "Is there a better alternative to HEIC?", a: "Yes — AVIF is an open-source format that achieves similar or better compression than HEIC, without the Apple ecosystem limitation. Our PNG to AVIF converter (free, browser-based) is a modern alternative to HEIC." },
];

const relatedTools = [
  { name: "PNG to AVIF (better open alternative)", href: "/png-to-avif" },
  { name: "PNG to WebP (smaller, universal)", href: "/png-to-webp" },
  { name: "HEIC to PNG (reverse)", href: "/heic-to-jpg" },
];

export default function PngToHeicPage() {
  return (
    <PdfConverterStub
      title="PNG to HEIC Converter"
      description="Convert PNG to HEIC format. Browsers cannot encode HEIC — use Mac Preview, iPhone Shortcuts, or consider AVIF (better alternative)."
      reason="HEIC encoding requires the HEVC codec which browsers don't implement. On Mac, use Preview app (File → Export → HEIC). Consider AVIF as a modern open alternative — our PNG to AVIF converter works entirely in the browser."
      alternatives={[
        { name: "PNG to AVIF (open alternative, browser)", href: "/png-to-avif" },
        { name: "PNG to WebP (smaller, browser)", href: "/png-to-webp" },
        { name: "Mac Preview (File → Export → HEIC)", href: "https://support.apple.com/guide/preview/welcome/mac", external: true },
        { name: "HEIC to PNG (reverse conversion)", href: "/heic-to-jpg" },
      ]}
      faqs={faqs}
      relatedTools={relatedTools}
    />
  );
}
