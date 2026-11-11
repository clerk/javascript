import { CanvasTool, hash } from './canvas';

export type PixelLoaderSettings = {
  cellSize: number;
  gap: number;
  grid: number;
  speed: number;
  contrast: number;
  theme: 'dark' | 'light';
};
export const PIXEL_LOADER_DEFAULTS: PixelLoaderSettings = {
  cellSize: 9,
  gap: 2,
  grid: 4,
  speed: 1,
  contrast: 0.5,
  theme: 'dark',
};
const LEVELS = 4;
const SWAP_SECONDS = 0.55;
const SLIDE_SECONDS = 0.45;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
type Swap = { a: number; b: number; start: number };
export class PixelLoader extends CanvasTool<PixelLoaderSettings> {
  private slots: number[] = [];
  private levels: number[] = [];
  private count = 0;
  private swap: Swap | null = null;
  private nextSwap = 0;
  private seed = 0;
  private ensure(count: number) {
    if (count === this.count) {
      return;
    }
    this.count = count;
    this.slots = Array.from({ length: count }, (_, index) => index);
    this.levels = Array.from(
      { length: count },
      (_, index) => Math.floor(hash(index * 3.7 + 11) * LEVELS) / (LEVELS - 1),
    );
    this.swap = null;
  }
  private pick(total: number) {
    const a = Math.floor(hash(this.seed++ * 5.3 + this.t) * total);
    let b = Math.floor(hash(this.seed++ * 9.1 + this.t) * total);
    if (b === a) {
      b = (b + 1) % total;
    }
    return { a, b };
  }
  protected draw() {
    const s = this.settings;
    const { ctx, w, h } = this;
    const size = Math.round(s.grid);
    const total = size * size;
    this.ensure(total);
    const light = s.theme === 'light';
    const step = s.cellSize + s.gap;
    const span = size * step - s.gap;
    const originX = Math.round((w - span) / 2);
    const originY = Math.round((h - span) / 2);
    const speed = this.reducedMotion ? 0 : s.speed;
    if (speed > 0 && !this.swap && this.t >= this.nextSwap) {
      const { a, b } = this.pick(total);
      this.swap = { a, b, start: this.t };
    }
    let progress = 0;
    if (this.swap) {
      progress = ease(Math.min(1, ((this.t - this.swap.start) * speed) / SLIDE_SECONDS));
      if (progress >= 1) {
        const { a, b } = this.swap;
        [this.slots[a], this.slots[b]] = [this.slots[b], this.slots[a]];
        this.swap = null;
        this.nextSwap = this.t + SWAP_SECONDS / Math.max(speed, 0.1);
        progress = 0;
      }
    }
    const spread = s.contrast;
    for (let tile = 0; tile < total; tile++) {
      let slot = this.slots.indexOf(tile);
      let target = slot;
      if (this.swap) {
        if (slot === this.swap.a) {
          target = this.swap.b;
        } else if (slot === this.swap.b) {
          target = this.swap.a;
        }
      }
      const fromX = (slot % size) * step;
      const fromY = Math.floor(slot / size) * step;
      const toX = (target % size) * step;
      const toY = Math.floor(target / size) * step;
      const x = originX + fromX + (toX - fromX) * progress;
      const y = originY + fromY + (toY - fromY) * progress;
      const level = this.levels[tile];
      const tone = light ? Math.round(240 - level * spread * 34) : Math.round(46 + level * spread * 52);
      ctx.fillStyle = `rgb(${tone},${tone},${tone})`;
      ctx.fillRect(x, y, s.cellSize, s.cellSize);
      slot = target;
    }
  }
}
