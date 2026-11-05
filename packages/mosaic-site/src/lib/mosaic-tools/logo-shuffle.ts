import { MARK_FILLETS, MARK_PIECES, MARK_VIEWBOX } from '@/lib/brand/mark';

import { CanvasTool, hash, smoothstep } from './canvas';
export type LogoShuffleSettings = {
  theme: 'dark' | 'light';
  trigger: 'hover' | 'loop' | 'click' | 'static';
  color: 'white' | 'violet';
  speed: number;
  moves: number;
  size: number;
};
export const LOGO_SHUFFLE_DEFAULTS: LogoShuffleSettings = {
  theme: 'dark',
  trigger: 'loop',
  color: 'white',
  speed: 1,
  moves: 2,
  size: 0.3,
};
type Offsets = [number, number][];
const [VIEW_X, VIEW_Y, VIEW_W, VIEW_H] = MARK_VIEWBOX.split(' ').map(Number);
let shapes: { pieces: Path2D[]; fillets: Path2D[] } | null = null;
const getShapes = () => {
  shapes ??= { pieces: MARK_PIECES.map(d => new Path2D(d)), fillets: MARK_FILLETS.map(d => new Path2D(d)) };
  return shapes;
};
const HOME: Offsets = MARK_PIECES.map(() => [0, 0]);
const LEG_SLOTS = [0, 20, 40];
const TOP_SWAP = 30;
const STEP_SECONDS = 0.34;
const PERMUTATIONS = [
  [1, 2, 0],
  [2, 0, 1],
  [1, 0, 2],
  [0, 2, 1],
  [2, 1, 0],
];
const shuffleStep = (seed: number): Offsets => {
  const swap = hash(seed) < 0.5 ? TOP_SWAP : 0;
  const order = PERMUTATIONS[Math.floor(hash(seed + 1) * PERMUTATIONS.length)];
  return [
    [swap, 0],
    [-swap, 0],
    ...order.map((slot, leg): [number, number] => [
      LEG_SLOTS[slot] - LEG_SLOTS[leg],
      hash(seed + 5 + leg) < 0.5 ? -10 : 0,
    ]),
  ];
};
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
export class LogoShuffle extends CanvasTool<LogoShuffleSettings> {
  private running = false;
  private steps: Offsets[] = [];
  private step = 0;
  private stepT = 0;
  private from: Offsets = HOME;
  private holdT = 0;
  private wasInside = false;
  private presses = 0;
  private runs = 0;
  private fade = 1;
  private begin() {
    const moves = Math.max(1, Math.round(this.settings.moves));
    this.steps = Array.from({ length: moves }, (_, n) => shuffleStep(this.runs * 31.7 + n * 9.3));
    this.steps.push(HOME);
    this.runs++;
    this.step = 0;
    this.stepT = 0;
    this.from = HOME;
    this.running = true;
  }
  protected draw(dt: number) {
    const s = this.settings;
    const { ctx, w, h } = this;
    const inside = this.pointer.inside;
    const pressed = this.pointer.presses !== this.presses;
    this.presses = this.pointer.presses;
    if (!this.running && !this.reducedMotion) {
      this.holdT += dt;
      const ready =
        (s.trigger === 'loop' && this.holdT > 1.6 / s.speed) ||
        (s.trigger === 'hover' && inside && !this.wasInside) ||
        (s.trigger === 'click' && pressed);
      if (ready) {
        this.begin();
      }
    }
    this.wasInside = inside;
    let current = HOME;
    if (this.running) {
      this.stepT += (dt * s.speed) / STEP_SECONDS;
      if (this.stepT >= 1) {
        this.from = this.steps[this.step];
        this.step++;
        this.stepT = 0;
        if (this.step >= this.steps.length) {
          this.running = false;
          this.holdT = 0;
        }
      }
    }
    if (this.running) {
      const to = this.steps[this.step];
      current = this.from.map(([fx, fy], index): [number, number] => {
        const e = ease(Math.min(1, Math.max(0, (this.stepT - index * 0.05) / 0.8)));
        return [fx + (to[index][0] - fx) * e, fy + (to[index][1] - fy) * e];
      });
    }
    this.fade += ((this.running ? 0 : 1) - this.fade) * (1 - Math.exp(-dt * (this.running ? 40 : 14)));
    const scale = Math.min((w * s.size) / VIEW_W, (h * s.size) / VIEW_H) * 1.6;
    ctx.save();
    ctx.translate(w / 2 - (VIEW_W / 2 + VIEW_X) * scale, h / 2 - (VIEW_H / 2 + VIEW_Y) * scale);
    ctx.scale(scale, scale);
    ctx.fillStyle = s.color === 'violet' ? '#6C47FF' : s.theme === 'light' ? '#0a0a0a' : '#ffffff';
    getShapes().pieces.forEach((path, index) => {
      ctx.save();
      ctx.translate(current[index][0], current[index][1]);
      ctx.fill(path);
      ctx.restore();
    });
    ctx.globalAlpha = smoothstep(0, 1, this.fade);
    for (const path of getShapes().fillets) {
      ctx.fill(path);
    }
    ctx.restore();
  }
}
