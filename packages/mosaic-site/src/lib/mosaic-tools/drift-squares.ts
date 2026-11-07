import { CanvasTool, hash, smoothstep } from './canvas';
export type DriftSquaresSettings = {
  text: string;
  count: number;
  minSize: number;
  maxSize: number;
  speed: number;
  dash: number;
  repel: number;
  settle: 'never' | 'hover' | 'loop';
  fill: boolean;
  accent: boolean;
  theme: 'dark' | 'light';
};
export const DRIFT_SQUARES_DEFAULTS: DriftSquaresSettings = {
  text: 'Rearrange everything',
  count: 26,
  minSize: 28,
  maxSize: 110,
  speed: 1,
  dash: 5,
  repel: 150,
  settle: 'hover',
  fill: false,
  accent: true,
  theme: 'dark',
};
type Square = {
  bx: number;
  by: number;
  size: number;
  rot: number;
  ax: number;
  ay: number;
  fx: number;
  fy: number;
  fr: number;
  phase: number;
  tone: number;
  accent: boolean;
  gx: number;
  gy: number;
  offX: number;
  offY: number;
};
export class DriftSquares extends CanvasTool<DriftSquaresSettings> {
  private squares: Square[] = [];
  private settleAmount = 0;
  protected onSettings(next: DriftSquaresSettings, prev: DriftSquaresSettings) {
    if (
      next.count !== prev.count ||
      next.minSize !== prev.minSize ||
      next.maxSize !== prev.maxSize ||
      this.squares.length === 0
    ) {
      this.build();
    }
  }
  protected onResize() {
    this.build();
  }
  private build() {
    const { count, minSize, maxSize } = this.settings;
    const squares: Square[] = [];
    const cell = Math.max(minSize, maxSize) * 0.9;
    const cols = Math.max(2, Math.floor(this.w / cell));
    const rows = Math.max(2, Math.floor(this.h / cell));
    const ox = (this.w - cols * cell) / 2 + cell / 2;
    const oy = (this.h - rows * cell) / 2 + cell / 2;
    for (let i = 0; i < count; i++) {
      const r = (n: number) => hash(i * 7.31 + n);
      const bx = r(1) * this.w;
      let by = r(2) * this.h;
      const nx = (bx - this.w / 2) / (this.w / 2);
      const ny = (by - this.h / 2) / (this.h / 2);
      if (Math.abs(ny) < 0.28 && Math.abs(nx) < 0.62) {
        by += (ny >= 0 ? 1 : -1) * this.h * 0.3;
        by = Math.min(this.h - 20, Math.max(20, by));
      }
      const gx = Math.min(cols - 1, Math.max(0, Math.round((bx - ox) / cell)));
      const gy = Math.min(rows - 1, Math.max(0, Math.round((by - oy) / cell)));
      squares.push({
        bx,
        by,
        size: minSize + r(3) * (maxSize - minSize),
        rot: (r(4) - 0.5) * 0.9,
        ax: 10 + r(5) * 26,
        ay: 10 + r(6) * 26,
        fx: 0.25 + r(7) * 0.5,
        fy: 0.25 + r(8) * 0.5,
        fr: 0.2 + r(9) * 0.4,
        phase: r(10) * 6.283,
        tone: 0.5 + r(11) * 0.5,
        accent: r(12) < 0.14,
        gx: ox + gx * cell,
        gy: oy + gy * cell,
        offX: 0,
        offY: 0,
      });
    }
    this.squares = squares;
  }
  protected draw(dt: number) {
    const s = this.settings;
    const { ctx, w, h } = this;
    let target = 0;
    if (s.settle === 'hover') {
      target = this.pointer.inside ? 1 : 0;
    } else if (s.settle === 'loop') {
      const phase = (this.t * 0.22 * s.speed) % 1;
      target = smoothstep(0.15, 0.4, phase) * (1 - smoothstep(0.65, 0.9, phase));
    }
    this.settleAmount += (target - this.settleAmount) * (1 - Math.exp(-dt * 4 * s.speed));
    const settle = smoothstep(0, 1, this.settleAmount);
    const t = this.reducedMotion ? 0 : this.t * s.speed;
    for (const sq of this.squares) {
      let x = sq.bx + Math.sin(t * sq.fx + sq.phase) * sq.ax;
      let y = sq.by + Math.cos(t * sq.fy + sq.phase) * sq.ay;
      const rot = sq.rot + Math.sin(t * sq.fr + sq.phase) * 0.35;
      let tx = 0;
      let ty = 0;
      if (this.pointer.inside && s.repel > 0) {
        const dx = x - this.pointer.x;
        const dy = y - this.pointer.y;
        const d = Math.hypot(dx, dy) || 1;
        if (d < s.repel) {
          const push = (1 - d / s.repel) ** 2 * s.repel * 0.5;
          tx = (dx / d) * push;
          ty = (dy / d) * push;
        }
      }
      sq.offX += (tx - sq.offX) * (1 - Math.exp(-dt * 8));
      sq.offY += (ty - sq.offY) * (1 - Math.exp(-dt * 8));
      x += sq.offX;
      y += sq.offY;
      x += (sq.gx - x) * settle;
      y += (sq.gy - y) * settle;
      const angle = rot * (1 - settle);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      const half = sq.size / 2;
      const color = s.accent && sq.accent ? '108,71,255' : s.theme === 'light' ? '10,10,10' : '255,255,255';
      if (s.fill && settle > 0.02) {
        ctx.fillStyle = `rgba(${color},${0.9 * settle * sq.tone})`;
        ctx.fillRect(-half, -half, sq.size, sq.size);
      }
      ctx.strokeStyle = `rgba(${color},${0.55 * sq.tone + 0.15})`;
      ctx.lineWidth = 1;
      ctx.setLineDash(settle > 0.5 && s.fill ? [] : [s.dash, s.dash]);
      ctx.strokeRect(-half, -half, sq.size, sq.size);
      ctx.restore();
    }
    const family = getComputedStyle(this.container).getPropertyValue('--font-heading').trim() || 'Geist';
    const size = Math.min(w * 0.09, 64);
    ctx.fillStyle = s.theme === 'light' ? '#0a0a0a' : '#ffffff';
    ctx.font = `600 ${size}px ${family}, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = `${-size * 0.04}px`;
    ctx.fillText(s.text, w / 2, h / 2);
  }
}
