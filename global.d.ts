declare module "qr-scanner" {
  export default class QrScanner {
    static scanImage(
      source: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | Blob | ImageData | File | URL | string,
      options?: unknown
    ): Promise<any>;
  }
}
