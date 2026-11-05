import { MARK_PATHS, MARK_VIEWBOX } from '@/lib/brand/mark';

import { CanvasTool, context2d, hash, smoothstep } from './canvas';
export type PixelResolveSettings = {
  text: string;
  shape: 'text' | 'logo';
  fontSize: number;
  tileSize: number;
  grout: number;
  speed: number;
  trigger: 'hover' | 'lens' | 'loop' | 'static';
  lensRadius: number;
  color: 'white' | 'violet' | 'gradient';
  theme: 'dark' | 'light';
};
export const PIXEL_RESOLVE_DEFAULTS: PixelResolveSettings = {
  text: 'Mosaic',
  shape: 'text',
  fontSize: 150,
  tileSize: 10,
  grout: 1,
  speed: 1,
  trigger: 'loop',
  lensRadius: 150,
  color: 'white',
  theme: 'dark',
};
type Tile = {
  tx: number;
  ty: number;
  sx: number;
  sy: number;
  r: number;
  g: number;
  b: number;
  rowDelay: number;
  colDelay: number;
  tone: number;
};
const [VIEW_X, VIEW_Y, VIEW_W, VIEW_H] = MARK_VIEWBOX.split(' ').map(Number);
let markShapes: Path2D[] | null = null;
const getMarkShapes = () => {
  markShapes ??= MARK_PATHS.map(d => new Path2D(d));
  return markShapes;
};
export class PixelResolve extends CanvasTool<PixelResolveSettings> {
  private textLayer = document.createElement('canvas');
  private small = document.createElement('canvas');
  private tiles: Tile[] = [];
  private progress = 0;
  private lens = 0;
  private lensPos = { x: 0, y: 0 };
  private cycle = 0;
  private fresh = true;
  protected onSettings(next: PixelResolveSettings, prev: PixelResolveSettings) {
    if (
      next.text !== prev.text ||
      next.shape !== prev.shape ||
      next.fontSize !== prev.fontSize ||
      next.tileSize !== prev.tileSize ||
      next.color !== prev.color ||
      next.theme !== prev.theme ||
      this.tiles.length === 0
    ) {
      this.build();
    }
  }
  protected onResize() {
    this.build();
  }
  private drawLayer() {
    const { text, shape, fontSize, color, theme } = this.settings;
    const ink = theme === 'light' ? '#0a0a0a' : '#ffffff';
    const width = Math.round(this.w * this.dpr);
    const height = Math.round(this.h * this.dpr);
    this.textLayer.width = width;
    this.textLayer.height = height;
    const ctx = context2d(this.textLayer);
    ctx.clearRect(0, 0, width, height);
    ctx.scale(this.dpr, this.dpr);
    if (color === 'violet') {
      ctx.fillStyle = '#6C47FF';
    } else if (color === 'gradient') {
      const gradient = ctx.createLinearGradient(0, 0, this.w, 0);
      gradient.addColorStop(0.2, ink);
      gradient.addColorStop(0.8, '#8f74ff');
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = ink;
    }
    if (shape === 'logo') {
      const scale = Math.min((fontSize * 1.3) / VIEW_H, (this.w * 0.9) / VIEW_W);
      ctx.translate(this.w / 2 - (VIEW_W / 2 + VIEW_X) * scale, this.h / 2 - (VIEW_H / 2 + VIEW_Y) * scale);
      ctx.scale(scale, scale);
      for (const path of getMarkShapes()) {
        ctx.fill(path);
      }
      return;
    }
    const family = getComputedStyle(this.container).getPropertyValue('--font-heading').trim();
    let size = fontSize;
    const setFont = () => (ctx.font = `600 ${size}px ${family || 'Geist'}, system-ui, sans-serif`);
    setFont();
    const maxWidth = this.w * 0.9;
    const measured = ctx.measureText(text).width;
    if (measured > maxWidth) {
      size = (size * maxWidth) / measured;
      setFont();
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = `${-size * 0.04}px`;
    ctx.fillText(text, this.w / 2, this.h / 2);
  }
  private build() {
    this.drawLayer();
    const size = Math.max(3, this.settings.tileSize);
    const cols = Math.ceil(this.w / size);
    const rows = Math.ceil(this.h / size);
    this.small.width = cols;
    this.small.height = rows;
    const sctx = context2d(this.small, { willReadFrequently: true });
    sctx.imageSmoothingEnabled = true;
    sctx.imageSmoothingQuality = 'high';
    sctx.clearRect(0, 0, cols, rows);
    sctx.drawImage(this.textLayer, 0, 0, this.w / size, this.h / size);
    const data = sctx.getImageData(0, 0, cols, rows).data;
    const tiles: Tile[] = [];
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const k = (j * cols + i) * 4;
        if (data[k + 3] < 100) {
          continue;
        }
        const n = tiles.length;
        tiles.push({
          tx: i * size,
          ty: j * size,
          sx: 0,
          sy: 0,
          r: data[k],
          g: data[k + 1],
          b: data[k + 2],
          rowDelay: hash(j * 3.7 + 1.1),
          colDelay: hash(i * 5.3 + 2.9),
          tone: 0.45 + hash(n * 2.3 + 6.1) * 0.4,
        });
      }
    }
    this.tiles = tiles;
    this.scatter();
  }
  private scatter() {
    const size = Math.max(3, this.settings.tileSize);
    const count = this.tiles.length;
    if (count === 0) {
      return;
    }
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const tile of this.tiles) {
      minX = Math.min(minX, tile.tx);
      maxX = Math.max(maxX, tile.tx);
      minY = Math.min(minY, tile.ty);
      maxY = Math.max(maxY, tile.ty);
    }
    const spanX = (maxX - minX) / size + 1;
    const spanY = (maxY - minY) / size + 1;
    const blockCols = Math.max(1, Math.ceil(Math.sqrt((count * spanX) / spanY)));
    const blockRows = Math.ceil(count / blockCols);
    const originX = Math.round((minX + maxX) / 2 / size - (blockCols - 1) / 2) * size;
    const originY = Math.round((minY + maxY) / 2 / size - (blockRows - 1) / 2) * size;
    const order = this.tiles.map((_, n) => n);
    for (let n = count - 1; n > 0; n--) {
      const m = Math.floor(hash(n * 3.1 + this.cycle * 101.7) * (n + 1));
      [order[n], order[m]] = [order[m], order[n]];
    }
    order.forEach((tileIndex, slot) => {
      const tile = this.tiles[tileIndex];
      tile.sx = originX + (slot % blockCols) * size;
      tile.sy = originY + Math.floor(slot / blockCols) * size;
    });
  }
  protected draw(dt: number) {
    const s = this.settings;
    const { ctx } = this;
    const size = Math.max(3, s.tileSize);
    const pointerHere = this.pointer.inside;
    let target = 0;
    if (s.trigger === 'hover') {
      target = pointerHere ? 1 : 0;
    } else if (s.trigger === 'loop') {
      const phase = (this.t * 0.22 * s.speed) % 1;
      target = smoothstep(0.05, 0.5, phase) * (1 - smoothstep(0.78, 0.97, phase));
    } else if (s.trigger === 'static') {
      target = 1;
    }
    if (s.trigger === 'loop' || s.trigger === 'static') {
      this.progress = target;
    } else {
      this.progress += (target - this.progress) * (1 - Math.exp(-dt * 1.6 * s.speed));
    }
    if (this.progress < 0.001 && !this.fresh) {
      this.cycle++;
      this.scatter();
      this.fresh = true;
    } else if (this.progress > 0.02) {
      this.fresh = false;
    }
    this.lens += ((pointerHere ? 1 : 0) - this.lens) * (1 - Math.exp(-dt * 8 * s.speed));
    if (pointerHere) {
      this.lensPos.x += (this.pointer.x - this.lensPos.x) * (1 - Math.exp(-dt * 16));
      this.lensPos.y += (this.pointer.y - this.lensPos.y) * (1 - Math.exp(-dt * 16));
    }
    const radius = s.lensRadius * smoothstep(0, 1, this.lens);
    const side = Math.max(1, size - s.grout);
    for (const tile of this.tiles) {
      let ex: number;
      let ey: number;
      if (this.reducedMotion) {
        ex = 1;
        ey = 1;
      } else if (s.trigger === 'lens') {
        const d = Math.hypot(tile.tx + size / 2 - this.lensPos.x, tile.ty + size / 2 - this.lensPos.y);
        ex = smoothstep(0, 1, this.lens * (1 - smoothstep(radius * 0.5, radius, d)));
        ey = ex;
      } else {
        ex = smoothstep(0, 1, (this.progress - tile.rowDelay * 0.35) / 0.4);
        ey = smoothstep(0, 1, (this.progress - 0.3 - tile.colDelay * 0.3) / 0.4);
      }
      const x = tile.sx + (tile.tx - tile.sx) * ex;
      const y = tile.sy + (tile.ty - tile.sy) * ey;
      const alpha = tile.tone + (1 - tile.tone) * ey;
      ctx.fillStyle = `rgba(${tile.r},${tile.g},${tile.b},${alpha})`;
      ctx.fillRect(x + (size - side) / 2, y + (size - side) / 2, side, side);
    }
    if (s.trigger === 'lens' && this.lens > 0.01) {
      ctx.strokeStyle = s.theme === 'light' ? 'rgba(10,10,10,0.2)' : 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(this.lensPos.x, this.lensPos.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}
