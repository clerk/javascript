export interface LabTool<S> {
  update(settings: S): void;
  dispose(): void;
}
export type ToolSettings = Record<string, string | number | boolean>;
export function context2d(canvas: HTMLCanvasElement, options?: CanvasRenderingContext2DSettings) {
  const ctx = canvas.getContext('2d', options);
  if (!ctx) {
    throw new Error('2D canvas is not available');
  }
  return ctx;
}
export const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export abstract class CanvasTool<S> implements LabTool<S> {
  protected canvas = document.createElement('canvas');
  protected ctx = context2d(this.canvas);
  protected w = 1;
  protected h = 1;
  protected dpr = 1;
  protected t = 0;
  protected pointer = {
    x: -1e4,
    y: -1e4,
    inside: false,
    lastMove: -Infinity,
    presses: 0,
  };
  protected reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private raf = 0;
  private last = 0;
  private observer: ResizeObserver;
  constructor(
    protected container: HTMLElement,
    protected settings: S,
  ) {
    this.canvas.style.cssText = 'display:block;width:100%;height:100%;touch-action:none';
    container.appendChild(this.canvas);
    container.addEventListener('pointermove', this.onMove);
    container.addEventListener('pointerdown', this.onDown);
    container.addEventListener('pointerleave', this.onLeave);
    this.observer = new ResizeObserver(this.resize);
    this.observer.observe(container);
  }
  start() {
    this.resize();
    this.onSettings(this.settings, this.settings);
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }
  update(next: S) {
    const prev = this.settings;
    this.settings = next;
    this.onSettings(next, prev);
  }
  dispose() {
    cancelAnimationFrame(this.raf);
    this.observer.disconnect();
    this.container.removeEventListener('pointermove', this.onMove);
    this.container.removeEventListener('pointerdown', this.onDown);
    this.container.removeEventListener('pointerleave', this.onLeave);
    this.canvas.remove();
  }
  protected onSettings(_next: S, _prev: S) {}
  protected onResize() {}
  protected abstract draw(dt: number): void;
  private onMove = (event: PointerEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = event.clientX - rect.left;
    this.pointer.y = event.clientY - rect.top;
    this.pointer.inside = true;
    this.pointer.lastMove = this.t;
  };
  private onDown = (event: PointerEvent) => {
    this.onMove(event);
    this.pointer.presses++;
  };
  private onLeave = () => {
    this.pointer.inside = false;
    this.pointer.lastMove = this.t;
  };
  private resize = () => {
    const rect = this.container.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = Math.max(1, Math.round(rect.width));
    this.h = Math.max(1, Math.round(rect.height));
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    this.onResize();
  };
  private loop = (now: number) => {
    this.raf = requestAnimationFrame(this.loop);
    const dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;
    this.t += dt;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.ctx.clearRect(0, 0, this.w, this.h);
    this.draw(dt);
  };
}
