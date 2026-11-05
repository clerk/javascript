import { CanvasTool, hash } from './canvas';
export type GridRippleSettings = {
  cellSize: number;
  gap: number;
  speed: number;
  width: number;
  decay: number;
  intensity: number;
  gridAlpha: number;
  emit: 'move' | 'click' | 'both';
  fillMode: 'solid' | 'tones' | 'violet';
  theme: 'dark' | 'light';
  pop: boolean;
  autoplay: boolean;
};
export const GRID_RIPPLE_DEFAULTS: GridRippleSettings = {
  cellSize: 56,
  gap: 2,
  speed: 9,
  width: 0.5,
  decay: 1.8,
  intensity: 0.12,
  gridAlpha: 0.06,
  emit: 'click',
  fillMode: 'tones',
  theme: 'dark',
  pop: true,
  autoplay: true,
};
type Ripple = {
  x: number;
  y: number;
  start: number;
  amp: number;
  speedMul: number;
  widthMul: number;
  k1: number;
  k2: number;
  p1: number;
  p2: number;
  a1: number;
  a2: number;
};
const STONE_DARK = [255, 232, 207, 184];
const STONE_LIGHT = [10, 40, 70, 100];
const MAX_RIPPLES = 18;
export class GridRipple extends CanvasTool<GridRippleSettings> {
  private ripples: Ripple[] = [];
  private lastSpawn = { x: -1e4, y: -1e4, t: -Infinity };
  private presses = 0;
  private nextAuto = 0;
  private spawn(x: number, y: number, amp: number) {
    const seed = this.t * 91.7 + x * 0.37 + y * 0.53;
    this.ripples.push({
      x,
      y,
      start: this.t,
      amp: amp * (0.75 + 0.25 * hash(seed)),
      speedMul: 0.8 + 0.4 * hash(seed + 1),
      widthMul: 0.8 + 0.7 * hash(seed + 2),
      k1: 2 + Math.floor(hash(seed + 3) * 3),
      k2: 4 + Math.floor(hash(seed + 4) * 4),
      p1: hash(seed + 5) * Math.PI * 2,
      p2: hash(seed + 6) * Math.PI * 2,
      a1: 0.12 + 0.2 * hash(seed + 7),
      a2: 0.05 + 0.1 * hash(seed + 8),
    });
    if (this.ripples.length > MAX_RIPPLES) {
      this.ripples.shift();
    }
  }
  protected draw() {
    const s = this.settings;
    const { ctx, w, h } = this;
    const size = s.cellSize;
    const p = this.pointer;
    if (p.inside && (s.emit === 'move' || s.emit === 'both')) {
      const moved = Math.hypot(p.x - this.lastSpawn.x, p.y - this.lastSpawn.y);
      if (moved > size * 1.1 && this.t - this.lastSpawn.t > 0.1) {
        this.spawn(p.x, p.y, 0.3);
        this.lastSpawn = { x: p.x, y: p.y, t: this.t };
      }
    }
    if (p.presses !== this.presses) {
      if (s.emit === 'click' || s.emit === 'both') {
        this.spawn(p.x, p.y, 1);
      }
      this.presses = p.presses;
    }
    if (s.autoplay && this.t > this.nextAuto) {
      this.spawn(hash(this.t * 3.1) * w, hash(this.t * 7.7) * h, 0.9);
      this.nextAuto = this.t + 2 + hash(this.t) * 1.5;
    }
    const reach = Math.hypot(w, h) / size;
    this.ripples = this.ripples.filter(r => {
      const age = this.t - r.start;
      return r.amp * Math.exp(-age * s.decay) > 0.02 && age * s.speed * r.speedMul < reach + 4;
    });
    const light = s.theme === 'light';
    const ink = light ? '10,10,10' : '255,255,255';
    const stone = light ? STONE_LIGHT : STONE_DARK;
    if (s.gridAlpha > 0) {
      ctx.strokeStyle = `rgba(${ink},${s.gridAlpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= w; x += size) {
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, h);
      }
      for (let y = 0; y <= h; y += size) {
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(w, y + 0.5);
      }
      ctx.stroke();
      const fade = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.hypot(w, h) / 2);
      fade.addColorStop(0.2, 'rgba(0,0,0,0)');
      fade.addColorStop(0.85, 'rgba(0,0,0,1)');
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = fade;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    }
    const cols = Math.ceil(w / size);
    const rows = Math.ceil(h / size);
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const cx = (i + 0.5) * size;
        const cy = (j + 0.5) * size;
        const rnd = hash(i * 13.7 + j * 91.3);
        let v = 0;
        for (const r of this.ripples) {
          const age = this.t - r.start;
          const radius = age * s.speed * r.speedMul;
          const dx = cx - r.x;
          const dy = cy - r.y;
          const theta = Math.atan2(dy, dx);
          const warp = 1 + r.a1 * Math.sin(theta * r.k1 + r.p1) + r.a2 * Math.sin(theta * r.k2 + r.p2);
          const d = (Math.hypot(dx, dy) / size) * warp;
          const off = (d - radius) / (s.width * r.widthMul) + (rnd - 0.5) * 0.8;
          v += r.amp * Math.exp(-age * s.decay) * Math.exp(-off * off);
        }
        v = Math.min(1, v);
        if (v < 0.15) {
          continue;
        }
        const side = (size - s.gap) * (s.pop ? 0.55 + 0.45 * v : 1);
        const x = i * size + (size - side) / 2;
        const y = j * size + (size - side) / 2;
        let color = ink;
        if (s.fillMode === 'tones') {
          const t = stone[Math.floor(rnd * stone.length)];
          color = `${t},${t},${t}`;
        } else if (s.fillMode === 'violet') {
          color = rnd < 0.35 ? '108,71,255' : ink;
        }
        ctx.fillStyle = `rgba(${color},${v * s.intensity})`;
        ctx.fillRect(x, y, side, side);
      }
    }
  }
}
