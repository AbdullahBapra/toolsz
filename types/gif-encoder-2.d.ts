declare module "gif-encoder-2" {
  class GIFEncoder {
    constructor(
      width: number,
      height: number,
      algorithm?: "neuquant" | "octree" | "gifkit",
      transparent?: boolean
    );
    start(): void;
    addFrame(ctx: CanvasRenderingContext2D): void;
    finish(): void;
    out: { getData(): Uint8Array };
    setDelay(ms: number): void;
    setRepeat(count: number): void;
    setQuality(quality: number): void;
    setTransparent(color: number | null): void;
  }
  export default GIFEncoder;
}
