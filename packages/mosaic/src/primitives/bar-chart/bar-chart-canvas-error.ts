export class CanvasRenderError extends Error {
  constructor(message: string, cause: unknown) {
    super(message, { cause });
    this.name = 'CanvasRenderError';
  }
}
