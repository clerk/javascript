export type CursorPathKind = 'move' | 'drag';

export interface Point {
  x: number;
  y: number;
}

export interface CursorPath {
  kind: CursorPathKind;
  distance: number;
  angle: number;
  width: number;
  duration: number;
  lead: number;
  dwell: number;
  press: number;
  land: [number, number];
  points: number[];
}

export interface CursorSample extends Point {
  t: number;
}

export type Random = () => number;

export const SAMPLES = 48;

const FITTS_A = 120;
const FITTS_B = 150;
const SETTLED_PX = 3;
const STARTED_PX = 2;

export function seeded(seed: string): Random {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const between = (random: Random, min: number, max: number) => min + random() * (max - min);

const round = (value: number) => Math.round(value * 10000) / 10000;

function difficulty(distance: number, width: number) {
  return Math.log2(distance / Math.max(width, 8) + 1);
}

function fittsTime(distance: number, width: number) {
  return FITTS_A + FITTS_B * difficulty(distance, width);
}

function minJerk(t: number) {
  return t * t * t * (10 - 15 * t + 6 * t * t);
}

function synthesize(kind: CursorPathKind, distance: number, width: number, random: Random): CursorPath {
  const corrected = distance > 160;
  const miss = corrected ? (random() < 0.8 ? -between(random, 3, 8) : between(random, 1, 4)) / distance : 0;
  const split = corrected ? 0.88 : 1;
  const bow = between(random, 0.03, 0.08) * (random() < 0.5 ? -1 : 1);
  const points: number[] = [];
  for (let i = 0; i < SAMPLES; i++) {
    const t = i / (SAMPLES - 1);
    const v =
      t <= split ? (1 + miss) * minJerk((t / split) ** 0.76) : 1 + miss - miss * minJerk((t - split) / (1 - split));
    points.push(round(v), round(bow * Math.sin(Math.PI * Math.min(1, v) ** 0.8)));
  }
  return {
    kind,
    distance,
    angle: 0,
    width,
    duration: fittsTime(distance, width) * (corrected ? 1.08 : 1) * (kind === 'drag' ? 1.3 : 1),
    lead: kind === 'drag' ? between(random, 80, 140) : 0,
    dwell: between(random, 80, 150),
    press: between(random, 80, 110),
    land: [between(random, -0.6, 0.6), between(random, -0.6, 0.6)],
    points,
  };
}

function angleGap(a: number, b: number) {
  const gap = Math.abs(a - b) % (2 * Math.PI);
  return gap > Math.PI ? 2 * Math.PI - gap : gap;
}

export function choosePath(
  library: CursorPath[],
  kind: CursorPathKind,
  from: Point,
  to: Point,
  width: number,
  random: Random,
): CursorPath {
  const distance = Math.max(1, Math.hypot(to.x - from.x, to.y - from.y));
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const ranked = library
    .filter(path => path.kind === kind)
    .map(path => ({
      path,
      score: Math.abs(Math.log(path.distance / distance)) + angleGap(path.angle, angle) / Math.PI,
    }))
    .sort((a, b) => a.score - b.score);
  if (!ranked.length) {
    return synthesize(kind, distance, width, random);
  }
  const chosen = ranked[Math.floor(random() * Math.min(3, ranked.length))].path;
  const scale = difficulty(distance, width) / difficulty(chosen.distance, chosen.width);
  return { ...chosen, duration: FITTS_A + Math.max(0, chosen.duration - FITTS_A) * scale };
}

export function steady(path: CursorPath): CursorPath {
  return {
    ...path,
    points: path.points.map((value, i) => (i % 2 ? value * 0.15 : Math.min(1, value))),
    land: [path.land[0], path.land[1] * 0.3],
  };
}

export function trace(path: CursorPath, from: Point, to: Point) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const { points } = path;
  return (progress: number): Point => {
    const f = Math.min(1, Math.max(0, progress)) * (SAMPLES - 1);
    const i = Math.min(SAMPLES - 2, Math.floor(f));
    const k = f - i;
    const v = points[2 * i] + (points[2 * i + 2] - points[2 * i]) * k;
    const u = points[2 * i + 1] + (points[2 * i + 3] - points[2 * i + 1]) * k;
    return { x: from.x + v * dx - u * dy, y: from.y + v * dy + u * dx };
  };
}

export function landing(box: DOMRect, land: [number, number]): Point {
  return {
    x: box.left + box.width / 2 + (land[0] * box.width) / 4,
    y: box.top + box.height / 2 + (land[1] * box.height) / 4,
  };
}

export function normalize(
  kind: CursorPathKind,
  samples: CursorSample[],
  end: CursorSample,
  width: number,
  land: [number, number],
  press: number,
): CursorPath | null {
  const origin = samples[0];
  if (!origin) {
    return null;
  }
  const started = samples.findIndex(s => Math.hypot(s.x - origin.x, s.y - origin.y) > STARTED_PX);
  if (started < 1) {
    return null;
  }
  let settled = samples.length - 1;
  while (
    settled > started &&
    Math.hypot(samples[settled - 1].x - end.x, samples[settled - 1].y - end.y) <= SETTLED_PX
  ) {
    settled--;
  }
  const moving = samples.slice(started - 1, settled + 1);
  const a = moving[0];
  const dx = end.x - a.x;
  const dy = end.y - a.y;
  const distance = Math.hypot(dx, dy);
  const duration = moving[moving.length - 1].t - a.t;
  if (distance < 16 || duration <= 0) {
    return null;
  }
  const points: number[] = [];
  let j = 0;
  for (let i = 0; i < SAMPLES; i++) {
    const t = a.t + (duration * i) / (SAMPLES - 1);
    while (j < moving.length - 2 && moving[j + 1].t < t) {
      j++;
    }
    const p = moving[j];
    const q = moving[j + 1] ?? p;
    const k = q.t === p.t ? 0 : Math.min(1, Math.max(0, (t - p.t) / (q.t - p.t)));
    const x = p.x + (q.x - p.x) * k - a.x;
    const y = p.y + (q.y - p.y) * k - a.y;
    points.push(round((x * dx + y * dy) / distance ** 2), round((dx * y - dy * x) / distance ** 2));
  }
  points.splice(0, 2, 0, 0);
  points.splice(-2, 2, 1, 0);
  return {
    kind,
    distance: Math.round(distance),
    angle: round(Math.atan2(dy, dx)),
    width: Math.round(width),
    duration: Math.round(duration),
    lead: Math.round(a.t - origin.t),
    dwell: Math.round(end.t - moving[moving.length - 1].t),
    press: Math.round(press),
    land: [round(land[0]), round(land[1])],
    points,
  };
}
