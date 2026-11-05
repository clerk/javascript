import { CanvasTool, hash, smoothstep } from './canvas';
export type CellTrailSettings = {
  cellSize: number;
  gap: number;
  trail: number;
  spread: number;
  fillMode: 'solid' | 'tones' | 'violet';
  pop: boolean;
  dashedGrid: boolean;
  autoplay: boolean;
  theme: 'dark' | 'light';
  intensity: number;
  gridAlpha: number;
};
export const CELL_TRAIL_DEFAULTS: CellTrailSettings = {
  cellSize: 96,
  gap: 3,
  trail: 0.7,
  spread: 0.4,
  fillMode: 'tones',
  pop: true,
  dashedGrid: true,
  autoplay: true,
  theme: 'dark',
  intensity: 0.1,
  gridAlpha: 0.04,
};
const STONE_DARK = [255, 232, 207, 184];
const STONE_LIGHT = [10, 40, 70, 100];
export class CellTrail extends CanvasTool<CellTrailSettings> {
  private heat = new Float32Array(0);
  private cols = 0;
  private rows = 0;
  private smooth = { x: 0, y: 0 };
  protected onSettings(next: CellTrailSettings, prev: CellTrailSettings) {
    if (next.cellSize !== prev.cellSize || this.heat.length === 0) {
      this.layout();
    }
  }
  protected onResize() {
    this.layout();
  }
  private layout() {
    const size = this.settings.cellSize;
    this.cols = Math.ceil(this.w / size);
    this.rows = Math.ceil(this.h / size);
    this.heat = new Float32Array(this.cols * this.rows);
  }
  protected draw(dt: number) {
    const s = this.settings;
    const { ctx, w, h } = this;
    const size = s.cellSize;
    let px = this.pointer.x;
    let py = this.pointer.y;
    let active = this.pointer.inside;
    if (s.autoplay && this.t - this.pointer.lastMove > 2) {
      px = w / 2 + Math.cos(this.t * 0.9) * w * 0.32;
      py = h / 2 + Math.sin(this.t * 1.3) * h * 0.28;
      active = true;
    }
    if (active) {
      this.smooth.x += (px - this.smooth.x) * (1 - Math.exp(-dt * 14));
      this.smooth.y += (py - this.smooth.y) * (1 - Math.exp(-dt * 14));
    }
    const decay = dt / Math.max(0.05, s.trail);
    const cx = this.smooth.x / size;
    const cy = this.smooth.y / size;
    for (let j = 0; j < this.rows; j++) {
      for (let i = 0; i < this.cols; i++) {
        const k = j * this.cols + i;
        let heat = this.heat[k] - decay;
        if (active) {
          const d = Math.hypot(i + 0.5 - cx, j + 0.5 - cy);
          const reach = 0.55 + s.spread;
          if (d < reach) {
            heat = Math.max(heat, 1 - smoothstep(0.4, reach, d) * 0.55);
          }
        }
        this.heat[k] = Math.max(0, heat);
      }
    }
    const light = s.theme === 'light';
    const ink = light ? '10,10,10' : '255,255,255';
    const stone = light ? STONE_LIGHT : STONE_DARK;
    ctx.strokeStyle = `rgba(${ink},${s.gridAlpha})`;
    ctx.lineWidth = 1;
    ctx.setLineDash(s.dashedGrid ? [4, 4] : []);
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
    ctx.setLineDash([]);
    for (let j = 0; j < this.rows; j++) {
      for (let i = 0; i < this.cols; i++) {
        const heat = this.heat[j * this.cols + i];
        if (heat < 0.01) {
          continue;
        }
        const r = hash(i * 13.7 + j * 91.3);
        const scale = s.pop ? smoothstep(0, 0.6, heat) : 1;
        const side = (size - s.gap) * scale;
        if (side < 0.5) {
          continue;
        }
        const x = i * size + (size - side) / 2;
        const y = j * size + (size - side) / 2;
        let color = ink;
        if (s.fillMode === 'tones') {
          const v = stone[Math.floor(r * stone.length)];
          color = `${v},${v},${v}`;
        } else if (s.fillMode === 'violet') {
          color = r < 0.35 ? '108,71,255' : ink;
        }
        ctx.fillStyle = `rgba(${color},${(s.pop ? Math.min(1, heat * 1.4) : heat) * s.intensity})`;
        ctx.fillRect(x, y, side, side);
      }
    }
  }
}
