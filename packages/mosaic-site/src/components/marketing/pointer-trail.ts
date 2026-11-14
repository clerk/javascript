import type { Uniforms } from '@/components/shader';

export const TRAIL_POINTS = 32;

const settings = {
  stiffness: 400,
  damping: 0.86,
  follow: 0.72,
  radius: 193,
  taper: 0.98,
  fade: 19.5,
  wobble: 0.03,
};

const points: Array<[number, number, number]> = Array.from({ length: TRAIL_POINTS }, () => [-1e4, -1e4, 0]);
const head = { x: -1e4, y: -1e4, vx: 0, vy: 0, targetX: -1e4, targetY: -1e4, started: false };
let lastStep = 0;
let listeners = 0;

export const TRAIL_POINTS_UNIFORM: Uniforms[string] = { type: 'uniform3fv', value: points };
export const TRAIL_ENERGY_UNIFORM: { type: 'uniform1f'; value: number } = { type: 'uniform1f', value: 0 };
const TOUCH_RADIUS_SCALE = 1.8;

export const TRAIL_RADIUS_UNIFORM: { type: 'uniform1f'; value: number } = {
  type: 'uniform1f',
  value: settings.radius,
};

export const TRAIL_ORIGIN_UNIFORM: { type: 'uniform3f'; value: [number, number, number] } = {
  type: 'uniform3f',
  value: [0, 0, 0],
};

function jumpTo(x: number, y: number) {
  head.started = true;
  head.x = x;
  head.y = y;
  head.vx = 0;
  head.vy = 0;
  head.targetX = x;
  head.targetY = y;
  for (const point of points) {
    point[0] = x;
    point[1] = y;
    point[2] = 0;
  }
}

function onPointerDown(event: PointerEvent) {
  if (event.pointerType === 'mouse') {
    return;
  }
  TRAIL_RADIUS_UNIFORM.value = settings.radius * TOUCH_RADIUS_SCALE;
  jumpTo(event.clientX, event.clientY);
}

function onTouchStart(event: TouchEvent) {
  const touch = event.touches[0];
  if (touch) {
    TRAIL_RADIUS_UNIFORM.value = settings.radius * TOUCH_RADIUS_SCALE;
    jumpTo(touch.clientX, touch.clientY);
  }
}

function onTouchMove(event: TouchEvent) {
  const touch = event.touches[0];
  if (touch) {
    head.targetX = touch.clientX;
    head.targetY = touch.clientY;
  }
}

function onPointerMove(event: PointerEvent) {
  TRAIL_RADIUS_UNIFORM.value = settings.radius * (event.pointerType === 'mouse' ? 1 : TOUCH_RADIUS_SCALE);
  head.targetX = event.clientX;
  head.targetY = event.clientY;
  if (head.started) {
    return;
  }
  head.started = true;
  head.x = event.clientX;
  head.y = event.clientY;
  for (const point of points) {
    point[0] = event.clientX;
    point[1] = event.clientY;
  }
}

export function startTrail() {
  if (listeners === 0) {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
  }
  listeners += 1;
  return () => {
    listeners -= 1;
    if (listeners === 0) {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    }
  };
}

const origin = { element: null as Element | null, left: 0, top: 0, stale: true };
let originObserver: ResizeObserver | null = null;

function markOriginStale() {
  origin.stale = true;
}

function readOrigin(element: Element) {
  if (origin.element !== element) {
    originObserver?.disconnect();
    origin.element = element;
    originObserver = new ResizeObserver(markOriginStale);
    originObserver.observe(element);
    originObserver.observe(document.documentElement);
    origin.stale = true;
  }
  if (origin.stale) {
    const rect = element.getBoundingClientRect();
    origin.left = rect.left + window.scrollX;
    origin.top = rect.top + window.scrollY;
    origin.stale = false;
  }
  return [origin.left - window.scrollX, origin.top - window.scrollY];
}

export function stepTrail(element: Element | null) {
  const now = performance.now() / 1000;
  const dt = Math.min(now - lastStep, 0.05);
  lastStep = now;
  if (element) {
    const [left, top] = readOrigin(element);
    TRAIL_ORIGIN_UNIFORM.value = [left, top, now % 1000];
  }
  if (dt <= 0 || !head.started) {
    return;
  }

  const k = settings.stiffness;
  const c = 2 * settings.damping * Math.sqrt(k);
  const substeps = 4;
  const h = dt / substeps;
  for (let s = 0; s < substeps; s += 1) {
    head.vx += (k * (head.targetX - head.x) - c * head.vx) * h;
    head.vy += (k * (head.targetY - head.y) - c * head.vy) * h;
    head.x += head.vx * h;
    head.y += head.vy * h;
  }

  const alpha = 1 - Math.pow(1 - settings.follow, dt * 60);
  const inherit = 1 - Math.pow(1 - settings.follow * 0.5, dt * 60);
  for (let i = TRAIL_POINTS - 1; i > 0; i -= 1) {
    const point = points[i];
    const ahead = points[i - 1];
    point[0] += (ahead[0] - point[0]) * alpha;
    point[1] += (ahead[1] - point[1]) * alpha;
    point[2] += (ahead[2] - point[2]) * inherit;
    point[2] *= Math.exp(-dt * settings.fade * (i / (TRAIL_POINTS - 1)));
  }

  const speed = Math.hypot(head.vx, head.vy);
  const target = Math.min(Math.max((speed - 30) / 570, 0), 1);
  const rate = target > points[0][2] ? 10 : 4;
  points[0][0] = head.x;
  points[0][1] = head.y;
  points[0][2] += (target - points[0][2]) * (1 - Math.exp(-dt * rate));
  let energy = 0;
  for (const point of points) {
    energy = Math.max(energy, point[2]);
  }
  TRAIL_ENERGY_UNIFORM.value = energy;
}

export const TRAIL_GLSL = `
uniform vec3 u_trail[${TRAIL_POINTS}];
uniform vec3 u_trail_origin;
uniform float u_trail_energy;
uniform float u_trail_radius;

float trailHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float trailNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(trailHash(i), trailHash(i + vec2(1.0, 0.0)), u.x),
    mix(trailHash(i + vec2(0.0, 1.0)), trailHash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float trailWobble(vec2 point) {
  return 1.0 + ${settings.wobble} * (trailNoise(point * 0.012 + u_trail_origin.z * 0.6) - 0.5);
}

float trailWeight(vec2 point, int i, float wobble) {
  float taper = 1.0 - float(i) / ${TRAIL_POINTS - 1}.0;
  float radius = u_trail_radius * mix(${settings.taper}, 1.0, taper);
  float d = distance(point, u_trail[i].xy - u_trail_origin.xy) / (radius * 0.5 * wobble);
  float spacing = i == 0 ? radius : distance(u_trail[i].xy, u_trail[i - 1].xy);
  return u_trail[i].z * clamp(spacing / (radius * 0.3), 0.0, 1.0) * exp(-d * d);
}

float trailReveal(vec2 point) {
  if (u_trail_energy < 0.001) {
    return 0.0;
  }
  float miss = 1.0;
  float wobble = trailWobble(point);
  for (int i = 0; i < ${TRAIL_POINTS}; i++) {
    miss *= 1.0 - trailWeight(point, i, wobble);
  }
  return 1.0 - miss;
}
`;
