import * as THREE from 'three';

import { MARK_PATHS } from '@/lib/brand/mark';
import { LOGO_PARTS } from '@/lib/mosaic-logo/clerk-logo';

import { context2d, type LabTool } from './canvas';
export type MosaicShaderSettings = {
  shape: 'clerk' | 'mark';
  material: 'stone' | 'ceramic' | 'metal' | 'glass' | 'gold';
  tint: 'natural' | 'violet' | 'graphite' | 'white';
  theme: 'dark' | 'light';
  tiles: number;
  grout: number;
  jitter: number;
  round: number;
  bevel: number;
  bump: number;
  facet: number;
  variation: number;
  roughness: number;
  halo: number;
  light: number;
  lift: number;
  tintLevel: number;
  secondaryTone: number;
  ambient: number;
  size: number;
  autoplay: boolean;
  transparent: boolean;
};
export const MOSAIC_SHADER_DEFAULTS: MosaicShaderSettings = {
  shape: 'clerk',
  material: 'stone',
  tint: 'natural',
  theme: 'dark',
  tiles: 30,
  grout: 0.14,
  jitter: 0.5,
  round: 0.22,
  bevel: 0.45,
  bump: 0.5,
  facet: 0.25,
  variation: 0.5,
  roughness: 0.35,
  halo: 0,
  light: 1,
  lift: 0.6,
  tintLevel: 1,
  secondaryTone: 0.55,
  ambient: 0,
  size: 0.78,
  autoplay: true,
  transparent: false,
};
const MATERIALS = { stone: 0, ceramic: 1, metal: 2, glass: 3, gold: 4 } as const;
const NATURAL_TINT: Record<MosaicShaderSettings['material'], [number, number, number]> = {
  stone: [0.64, 0.62, 0.58],
  ceramic: [0.93, 0.93, 0.92],
  metal: [0.82, 0.84, 0.89],
  glass: [0.55, 0.72, 0.95],
  gold: [1.0, 0.76, 0.3],
};
const TINTS: Record<Exclude<MosaicShaderSettings['tint'], 'natural'>, [number, number, number]> = {
  violet: [0.42, 0.28, 1.0],
  graphite: [0.17, 0.17, 0.18],
  white: [0.97, 0.97, 0.97],
};
const VERTEX = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;
const FRAGMENT = `
precision highp float;
varying vec2 vUv;

uniform vec2 uRes;
uniform sampler2D uMask;
uniform float uTiles, uScale, uGrout, uJitter, uRound, uBevel, uBump, uFacet, uVar;
uniform float uMaterial, uRough, uHalo, uDark, uLightI, uHover, uClear, uSecondary, uAmbient;
uniform vec3 uTint;
uniform vec3 uLight;
uniform vec2 uPointer;

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}
float fbm(vec2 p) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 4; i++) {
    s += a * vnoise(p);
    p *= 2.03;
    a *= 0.5;
  }
  return s;
}
float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
mat2 rot(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

vec3 envMap(vec3 R) {
  float up = smoothstep(-0.7, 0.9, R.y);
  vec3 dk = mix(vec3(0.02, 0.022, 0.03), vec3(0.3, 0.34, 0.45), up);
  vec3 lt = mix(vec3(0.74, 0.76, 0.8), vec3(1.0), up);
  vec3 base = mix(lt, dk, uDark);
  float b1 = smoothstep(0.22, 0.0, abs(R.x - 0.55)) * smoothstep(0.0, 0.5, R.y);
  float b2 = smoothstep(0.18, 0.0, abs(R.x + 0.6)) * smoothstep(0.1, 0.6, R.y);
  vec3 lights = (b1 * 1.4 + b2 * 0.9) * vec3(1.0, 0.97, 0.92);
  vec3 shadows = -(b1 * 0.35 + b2 * 0.25) * vec3(1.0);
  return max(base + mix(shadows, lights, uDark), 0.0);
}

void main() {
  vec2 p = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  vec3 bg = mix(vec3(0.957, 0.957, 0.945), vec3(0.016), uDark);
  bg *= 1.0 - 0.2 * smoothstep(0.3, 1.1, length(p)) * mix(0.35, 1.0, uDark);

  vec2 g = p / uScale * uTiles;
  vec2 id = floor(g);
  vec2 f = fract(g) - 0.5;
  vec2 cuv = (id + 0.5) / uTiles + 0.5;

  float o = 0.25 / uTiles;
  vec4 s0 = texture2D(uMask, cuv + vec2(-o, -o));
  vec4 s1 = texture2D(uMask, cuv + vec2(o, -o));
  vec4 s2 = texture2D(uMask, cuv + vec2(-o, o));
  vec4 s3 = texture2D(uMask, cuv + vec2(o, o));
  float cov = (s0.a + s1.a + s2.a + s3.a) * 0.25;
  float tone = (s0.r * s0.a + s1.r * s1.a + s2.r * s2.a + s3.r * s3.a) / max(s0.a + s1.a + s2.a + s3.a, 0.001);

  float ghostRoll = hash21(id + 7.7);
  float ghost = step(ghostRoll, uHalo * 0.35) * step(cov, 0.5);
  float vis = cov > 0.5 ? 1.0 : ghost * 0.22;
  if (vis <= 0.0) {
    gl_FragColor = uClear > 0.5 ? vec4(0.0) : vec4(bg, 1.0);
    return;
  }

  vec2 pc = uPointer / uScale * uTiles;
  float lift = uHover * smoothstep(3.5, 0.0, length(id + 0.5 - pc));

  vec2 h2 = hash22(id);
  float h1 = hash21(id + 3.1);
  float ang = (h1 - 0.5) * 0.35 * uJitter;
  float halfSize = 0.5 * (1.0 - uGrout) * (1.0 + (h2.x - 0.5) * 0.16 * uJitter) + 0.035 * lift;
  vec2 off = (h2 - 0.5) * 2.0 * uJitter * max(0.0, 0.5 - halfSize) * 0.8;
  mat2 R2 = rot(ang);
  vec2 q = R2 * (f - off);
  float r = clamp(uRound, 0.0, 1.0) * halfSize;

  float sdf = sdRoundBox(q, vec2(halfSize), r);
  float aa = uTiles / (uRes.y * uScale);
  float inside = 1.0 - smoothstep(-aa, aa, sdf);
  if (inside <= 0.0) {
    gl_FragColor = uClear > 0.5 ? vec4(0.0) : vec4(bg, 1.0);
    return;
  }

  float hgt = smoothstep(0.0, uBevel * halfSize + 0.0001, -sdf);

  float e = 0.004;
  vec2 grad = vec2(
    sdRoundBox(q + vec2(e, 0.0), vec2(halfSize), r) - sdRoundBox(q - vec2(e, 0.0), vec2(halfSize), r),
    sdRoundBox(q + vec2(0.0, e), vec2(halfSize), r) - sdRoundBox(q - vec2(0.0, e), vec2(halfSize), r)
  ) / (2.0 * e);
  vec2 nxy = (transpose(R2) * grad) * (1.0 - hgt) * 1.3;

  vec2 facet = (hash22(id + 11.3) - 0.5) * 2.0 * uFacet * 0.45;
  vec2 bumpXY = vec2(0.0);
  if (uMaterial < 0.5) {
    float s = 48.0;
    float n0 = fbm(p * s);
    bumpXY = vec2(fbm(p * s + vec2(0.02, 0.0)) - n0, fbm(p * s + vec2(0.0, 0.02)) - n0) * uBump * 22.0;
  } else if (uMaterial < 1.5) {
    bumpXY = vec2(vnoise(p * 14.0 + h1) - 0.5, vnoise(p * 14.0 + h2.x * 7.0 + 3.0) - 0.5) * uBump * 0.25;
  } else if (uMaterial < 2.5) {
    float streak = vnoise(vec2(p.x * 4.0, p.y * 220.0 + h1 * 50.0));
    bumpXY = vec2(0.0, (streak - 0.5) * uBump * 0.6);
  } else if (uMaterial < 3.5) {
    bumpXY = vec2(vnoise(p * 10.0 + h1 * 5.0) - 0.5, vnoise(p * 10.0 + h2.y * 9.0) - 0.5) * uBump * 0.5;
  } else {
    float n0 = fbm(p * 30.0);
    bumpXY = vec2(fbm(p * 30.0 + vec2(0.02, 0.0)) - n0, fbm(p * 30.0 + vec2(0.0, 0.02)) - n0) * uBump * 8.0;
  }

  vec2 toPointer = pc - (id + 0.5);
  vec2 tilt = lift * 0.25 * normalize(toPointer + vec2(0.0001));

  vec3 N = normalize(vec3(nxy + facet + bumpXY + tilt, 1.0));
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 L = normalize(vec3(uLight.xy, 0.55) - vec3(p, 0.0));
  vec3 H = normalize(L + V);
  float ndl = max(dot(N, L), 0.0);
  float ndh = max(dot(N, H), 0.0);
  vec3 Rv = reflect(-V, N);

  float amb = mix(0.55, 0.12, uDark) + uAmbient;
  float lightI = uLightI * mix(0.6, 1.0, uDark);
  vec3 albedo = uTint * (1.0 - uVar * 0.35 * h1);
  albedo *= tone > 0.75 ? 1.0 : uSecondary;

  vec3 col;
  if (uMaterial < 0.5) {
    float n = fbm(p * 60.0 + id * 3.1);
    vec3 a = albedo * (0.7 + 0.5 * n);
    col = a * (amb + ndl * lightI * 0.95) + vec3(pow(ndh, 12.0) * 0.07 * lightI * (1.0 - uRough * 0.8));
  } else if (uMaterial < 1.5) {
    col = albedo * (amb + ndl * lightI * 0.9)
      + vec3(pow(ndh, mix(180.0, 30.0, uRough)) * lightI * 0.9)
      + envMap(Rv) * 0.12 * (1.0 - uRough);
  } else if (uMaterial < 2.5) {
    col = albedo * envMap(Rv) * (1.0 - 0.3 * uRough)
      + albedo * ndl * lightI * 0.2
      + vec3(pow(ndh, mix(160.0, 25.0, uRough)) * lightI * 0.8);
  } else if (uMaterial < 3.5) {
    vec3 through = mix(bg, uTint, 0.28);
    float fres = pow(1.0 - N.z, 2.5) + 0.04;
    col = through * 0.85
      + envMap(Rv) * (0.12 + 0.9 * fres)
      + uTint * (1.0 - hgt) * 0.35
      + vec3(pow(ndh, mix(220.0, 40.0, uRough)) * lightI * 1.3);
    col += uTint * 0.06 * sin((p.x + p.y * 0.6) * 80.0 + h1 * 6.28);
  } else {
    col = albedo * (amb * 0.6 + ndl * lightI * 0.5)
      + albedo * envMap(Rv) * 0.55
      + vec3(1.0, 0.9, 0.6) * pow(ndh, mix(120.0, 20.0, uRough)) * lightI * 1.1;
  }

  col *= mix(0.62, 1.0, hgt);
  col = clamp(col, 0.0, 1.0);

  float cover = inside * vis;
  gl_FragColor = uClear > 0.5 ? vec4(col * cover, cover) : vec4(mix(bg, col, cover), 1.0);
}
`;
const MASK_SIZE = 1024;
function buildMask(shape: MosaicShaderSettings['shape']) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = MASK_SIZE;
  const ctx = context2d(canvas);
  const pad = 0.94;
  if (shape === 'clerk') {
    const scale = (MASK_SIZE * pad) / 18;
    ctx.translate(MASK_SIZE / 2 - 9 * scale, MASK_SIZE / 2 - 9 * scale);
    ctx.scale(scale, scale);
    for (const part of LOGO_PARTS) {
      ctx.fillStyle = part.tone === 1 ? '#ffffff' : '#808080';
      ctx.fill(new Path2D(part.d));
    }
  } else {
    const scale = (MASK_SIZE * pad) / 50;
    ctx.translate(MASK_SIZE / 2 - 25 * scale, MASK_SIZE / 2 - 20 * scale);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#ffffff';
    for (const d of MARK_PATHS) {
      ctx.fill(new Path2D(d));
    }
  }
  return canvas;
}
export class MosaicShader implements LabTool<MosaicShaderSettings> {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private material: THREE.ShaderMaterial;
  private mask: THREE.CanvasTexture | null = null;
  private maskShape: MosaicShaderSettings['shape'] | null = null;
  private pointer = new THREE.Vector2();
  private smoothPointer = new THREE.Vector2();
  private light = new THREE.Vector2(-0.3, 0.35);
  private inside = false;
  private hover = 0;
  private lastMove = -Infinity;
  private clock = new THREE.Clock();
  private raf = 0;
  private observer: ResizeObserver;
  constructor(
    private container: HTMLElement,
    private settings: MosaicShaderSettings,
  ) {
    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none';
    container.appendChild(this.renderer.domElement);
    this.material = new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: {
        uRes: { value: new THREE.Vector2(1, 1) },
        uMask: { value: null },
        uTiles: { value: 30 },
        uScale: { value: 0.78 },
        uGrout: { value: 0.14 },
        uJitter: { value: 0.5 },
        uRound: { value: 0.22 },
        uBevel: { value: 0.45 },
        uBump: { value: 0.5 },
        uFacet: { value: 0.25 },
        uVar: { value: 0.5 },
        uMaterial: { value: 0 },
        uRough: { value: 0.35 },
        uHalo: { value: 0 },
        uDark: { value: 1 },
        uLightI: { value: 1 },
        uHover: { value: 0 },
        uClear: { value: 0 },
        uSecondary: { value: 0.55 },
        uAmbient: { value: 0 },
        uTint: { value: new THREE.Vector3(1, 1, 1) },
        uLight: { value: new THREE.Vector3() },
        uPointer: { value: new THREE.Vector2() },
      },
      depthTest: false,
      depthWrite: false,
      transparent: true,
      premultipliedAlpha: true,
    });
    this.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material));
    container.addEventListener('pointermove', this.onMove);
    container.addEventListener('pointerdown', this.onMove);
    container.addEventListener('pointerleave', this.onLeave);
    this.observer = new ResizeObserver(this.resize);
    this.observer.observe(container);
    this.resize();
    this.applySettings();
    this.clock.start();
    this.raf = requestAnimationFrame(this.frame);
  }
  update(next: MosaicShaderSettings) {
    this.settings = next;
    this.applySettings();
  }
  dispose() {
    cancelAnimationFrame(this.raf);
    this.observer.disconnect();
    this.container.removeEventListener('pointermove', this.onMove);
    this.container.removeEventListener('pointerdown', this.onMove);
    this.container.removeEventListener('pointerleave', this.onLeave);
    this.mask?.dispose();
    this.material.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
  private applySettings() {
    const s = this.settings;
    const u = this.material.uniforms as Record<
      string,
      {
        value: unknown;
      }
    >;
    if (this.maskShape !== s.shape) {
      this.mask?.dispose();
      this.mask = new THREE.CanvasTexture(buildMask(s.shape));
      this.mask.minFilter = THREE.LinearFilter;
      this.mask.generateMipmaps = false;
      u.uMask.value = this.mask;
      this.maskShape = s.shape;
    }
    const tint = s.tint === 'natural' ? NATURAL_TINT[s.material] : TINTS[s.tint];
    (u.uTint.value as THREE.Vector3).set(...tint).multiplyScalar(s.tintLevel ?? 1);
    u.uMaterial.value = MATERIALS[s.material];
    u.uTiles.value = s.tiles;
    u.uScale.value = s.size;
    u.uGrout.value = s.grout;
    u.uJitter.value = s.jitter;
    u.uRound.value = s.round;
    u.uBevel.value = s.bevel;
    u.uBump.value = s.bump;
    u.uFacet.value = s.facet;
    u.uVar.value = s.variation;
    u.uRough.value = s.roughness;
    u.uHalo.value = s.halo;
    u.uDark.value = s.theme === 'dark' ? 1 : 0;
    u.uLightI.value = s.light;
    u.uClear.value = s.transparent ? 1 : 0;
    u.uSecondary.value = s.secondaryTone ?? 0.55;
    u.uAmbient.value = s.ambient ?? 0;
  }
  private toScene(event: PointerEvent, out: THREE.Vector2) {
    const rect = this.container.getBoundingClientRect();
    const aspect = rect.width / rect.height;
    out.set(((event.clientX - rect.left) / rect.width - 0.5) * aspect, 0.5 - (event.clientY - rect.top) / rect.height);
  }
  private onMove = (event: PointerEvent) => {
    this.toScene(event, this.pointer);
    this.inside = true;
    this.lastMove = this.clock.elapsedTime;
  };
  private onLeave = () => {
    this.inside = false;
    this.lastMove = this.clock.elapsedTime;
  };
  private resize = () => {
    const width = this.container.clientWidth || 1;
    const height = this.container.clientHeight || 1;
    this.renderer.setSize(width, height, false);
    const size = this.renderer.getDrawingBufferSize(new THREE.Vector2());
    (this.material.uniforms.uRes.value as THREE.Vector2).set(size.x, size.y);
  };
  private frame = () => {
    this.raf = requestAnimationFrame(this.frame);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.elapsedTime;
    const s = this.settings;
    let target = this.pointer;
    if (!this.inside && s.autoplay && t - this.lastMove > 1.5) {
      target = new THREE.Vector2(Math.cos(t * 0.5) * 0.45, Math.sin(t * 0.7) * 0.3);
    }
    const follow = 1 - Math.exp(-dt * 6);
    this.light.lerp(target, follow);
    this.smoothPointer.lerp(this.pointer, 1 - Math.exp(-dt * 14));
    this.hover += ((this.inside ? s.lift : 0) - this.hover) * (1 - Math.exp(-dt * 6));
    const u = this.material.uniforms;
    (u.uLight.value as THREE.Vector3).set(this.light.x, this.light.y, 0);
    (u.uPointer.value as THREE.Vector2).copy(this.smoothPointer);
    u.uHover.value = this.hover;
    this.renderer.render(this.scene, this.camera);
  };
}
