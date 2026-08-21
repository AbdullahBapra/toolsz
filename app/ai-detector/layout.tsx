import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Image Detector — Neural Network + 10 Signals | Real vs AI-Generated | Toolsz",
  description:
    "Upload any image to detect if it's AI-generated or a real photo. Runs a CLIP neural network model + 10 heuristic signals: EXIF camera data, DCT frequency artifacts, noise fingerprints, pixel smoothness, and AI dimension matching. Free, private, nothing uploaded.",
  keywords: [
    "ai image detector","is this image ai generated","ai photo detector free",
    "detect ai generated image","real or fake image checker","ai art detector",
    "midjourney detector","stable diffusion detector","dall-e image checker",
    "neural network image detector","clip image classification","ai vs real photo",
    "deepfake image detector","image authenticity checker","ai image checker online",
  ],
  openGraph: {
    title: "AI Image Detector — Neural Network Analysis",
    description: "CLIP neural network + 10 heuristic signals to detect AI-generated images. 100% private, nothing uploaded.",
    type: "website",
  },
  alternates: { canonical: "https://www.toolsz.co/ai-detector" },
};

export default function ToolLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
