declare module "imagetracerjs" {
  interface ImageData {
    width: number;
    height: number;
    data: Uint8ClampedArray;
  }

  interface TracerOptions {
    numberofcolors?: number;
    blurradius?: number;
    blurdelta?: number;
    strokewidth?: number;
    linefilter?: boolean;
    rightangleenhance?: boolean;
    viewbox?: boolean;
    desc?: boolean;
    lcpr?: number;
    qcpr?: number;
    [key: string]: unknown;
  }

  const ImageTracer: {
    imagedataToSVG(imagedata: ImageData, options?: TracerOptions): string;
    imageToSVG(url: string, callback: (svgstr: string) => void, options?: TracerOptions): void;
    canvasToSVG(canvas: HTMLCanvasElement, options?: TracerOptions): string;
  };

  export default ImageTracer;
}
