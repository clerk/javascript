'use client';
import { useMotionValue, useSpring } from 'motion/react';
import * as React from 'react';
import { createPortal } from 'react-dom';

import bake from '@/components/marketing/mosaic-bake.json';
import {
  BAKE_BLUR,
  BAKE_EDGE_MAX,
  FALLBACK_PALETTE,
  type Palette,
  readPalette,
  useSceneLayout,
} from '@/components/marketing/mosaic-shared';
import {
  startTrail,
  stepTrail,
  TRAIL_ENERGY_UNIFORM,
  TRAIL_GLSL,
  TRAIL_ORIGIN_UNIFORM,
  TRAIL_POINTS,
  TRAIL_POINTS_UNIFORM,
} from '@/components/marketing/pointer-trail';
import { Shader, type Uniforms } from '@/components/shader';
import { type Mode, useMode } from '@/components/use-mode';

export const MOSAIC_MASK_URL = `/mosaic/mask.webp?v=${bake.version}`;
export const MOSAIC_SURFACE_URL = `/mosaic/surface.webp?v=${bake.version}`;
export const MOSAIC_SKELETON_URL = `/mosaic/skeleton.webp?v=${bake.version}`;
const MOSAIC_REVEAL_URL = `/mosaic/reveal.webp?v=${bake.version}`;

const TEXTURES = [MOSAIC_SURFACE_URL, MOSAIC_MASK_URL, MOSAIC_SKELETON_URL, MOSAIC_REVEAL_URL];

type Reveal = {
  duration: number;
  from: number;
  to: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  amp: number;
  film: number;
  filmSpread: number;
  saturation: number;
  decay: number;
  originX: number;
  originY: number;
  rings: number;
  grow: number;
  gapGlow: number;
  grain: number;
  grainScale: number;
  blur: number;
  linear: number;
  angle: number;
  edge: number;
  scrub: number;
  progress: number;
};

const REVEAL_DEFAULTS: Reveal = {
  duration: 1900,
  from: -0.02,
  to: 1.2,
  x1: 0.25,
  y1: 0.45,
  x2: 0.55,
  y2: 0.95,
  width: 190,
  amp: 12,
  film: 0.75,
  filmSpread: 0.25,
  saturation: 0.7,
  decay: 1,
  originX: -0.1,
  originY: -0.1,
  rings: 0.6,
  grow: 1.4,
  gapGlow: 0.55,
  grain: 0.5,
  grainScale: 0.004,
  blur: 18,
  linear: 0,
  angle: 28,
  edge: 0.6,
  scrub: 0,
  progress: 0.5,
};

const REVEAL_SLIDERS: Array<{ key: keyof Reveal; min: number; max: number; step: number }> = [
  { key: 'scrub', min: 0, max: 1, step: 1 },
  { key: 'progress', min: 0, max: 1, step: 0.005 },
  { key: 'duration', min: 300, max: 4000, step: 50 },
  { key: 'from', min: -1, max: 0.5, step: 0.01 },
  { key: 'to', min: 0.5, max: 2, step: 0.01 },
  { key: 'x1', min: 0, max: 1, step: 0.01 },
  { key: 'y1', min: -0.5, max: 1.5, step: 0.01 },
  { key: 'x2', min: 0, max: 1, step: 0.01 },
  { key: 'y2', min: -0.5, max: 1.5, step: 0.01 },
  { key: 'originX', min: -0.5, max: 1.5, step: 0.01 },
  { key: 'originY', min: -0.5, max: 1.5, step: 0.01 },
  { key: 'linear', min: 0, max: 1, step: 0.01 },
  { key: 'angle', min: -180, max: 180, step: 1 },
  { key: 'width', min: 10, max: 400, step: 1 },
  { key: 'edge', min: 0.02, max: 2, step: 0.01 },
  { key: 'amp', min: 0, max: 60, step: 0.5 },
  { key: 'film', min: 0, max: 1.5, step: 0.01 },
  { key: 'filmSpread', min: 0, max: 2, step: 0.01 },
  { key: 'saturation', min: 0, max: 1, step: 0.01 },
  { key: 'decay', min: 0, max: 4, step: 0.05 },
  { key: 'rings', min: 0, max: 1.5, step: 0.01 },
  { key: 'grow', min: 0, max: 3, step: 0.05 },
  { key: 'gapGlow', min: 0, max: 1, step: 0.01 },
  { key: 'grain', min: 0, max: 2, step: 0.01 },
  { key: 'grainScale', min: 0.005, max: 0.2, step: 0.005 },
  { key: 'blur', min: 0, max: 18, step: 0.5 },
];

type Sheen = {
  sheen: number;
  scale: number;
  octaves: number;
  drift: number;
  hueSpread: number;
  flow: number;
  warp: number;
  angle: number;
  fresnelHue: number;
  base: number;
  edge: number;
  glint: number;
};

const SHEEN_DEFAULTS: Sheen = {
  sheen: bake.settings.sheen,
  scale: bake.settings.sheenScale,
  octaves: 5,
  drift: 3.8,
  hueSpread: 2.4,
  flow: 4.2,
  warp: 540,
  angle: bake.settings.sheenAngle,
  fresnelHue: 0,
  base: bake.settings.sheenBase,
  edge: bake.settings.sheenEdge,
  glint: bake.settings.sheenGlint,
};

const SHEEN_SLIDERS: Array<{ key: keyof Sheen; min: number; max: number; step: number }> = [
  { key: 'sheen', min: 0, max: 0.5, step: 0.005 },
  { key: 'scale', min: 20, max: 1000, step: 5 },
  { key: 'octaves', min: 1, max: 6, step: 1 },
  { key: 'drift', min: 0, max: 6, step: 0.05 },
  { key: 'hueSpread', min: 0, max: 8, step: 0.05 },
  { key: 'flow', min: 0, max: 10, step: 0.1 },
  { key: 'warp', min: 0, max: 800, step: 5 },
  { key: 'angle', min: 0, max: 4, step: 0.05 },
  { key: 'fresnelHue', min: 0, max: 6, step: 0.05 },
  { key: 'base', min: 0, max: 4, step: 0.05 },
  { key: 'edge', min: 0, max: 8, step: 0.05 },
  { key: 'glint', min: 0, max: 2, step: 0.01 },
];

const SHOW_REVEAL_PANEL = false;
const SHOW_SHEEN_PANEL = false;
const SWEEP_MS = 1800;
const MIN_SWEEPS = 1.5;

let ready = false;
let loaded = false;
const readyListeners = new Set<() => void>();
function setReady() {
  ready = true;
  readyListeners.forEach(listener => listener());
}
function markReady() {
  if (loaded) {
    return;
  }
  loaded = true;
  const sweep = document
    .querySelector('.mosaic-skeleton')
    ?.getAnimations({ subtree: true })
    .find(animation => animation instanceof CSSAnimation && animation.animationName === 'mosaic-skeleton-sweep');
  const elapsed = typeof sweep?.currentTime === 'number' ? sweep.currentTime : null;
  if (elapsed === null || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setReady();
    return;
  }
  window.setTimeout(setReady, Math.max(0, MIN_SWEEPS * SWEEP_MS - elapsed));
}
function replayReveal() {
  ready = false;
  readyListeners.forEach(listener => listener());
  window.setTimeout(setReady, 600);
}
function subscribeReady(listener: () => void) {
  readyListeners.add(listener);
  return () => readyListeners.delete(listener);
}
function useMosaicReady() {
  return React.useSyncExternalStore(
    subscribeReady,
    () => ready,
    () => false,
  );
}

const SKELETON_MASK = `url("${MOSAIC_SKELETON_URL}")`;

export function MosaicSkeleton() {
  const shown = !useMosaicReady();
  return (
    <div
      aria-hidden='true'
      className='mosaic-skeleton dark:bg-gray-850 bg-gray-150 pointer-events-none absolute -z-10 transition-opacity duration-300 ease-out'
      style={{
        left: `calc(50% + ${bake.offsetX}px)`,
        top: `calc(50% + ${bake.offsetY}px)`,
        width: bake.width,
        height: bake.height,
        maskImage: SKELETON_MASK,
        WebkitMaskImage: SKELETON_MASK,
        maskSize: '100% 100%',
        WebkitMaskSize: '100% 100%',
        opacity: shown ? 1 : 0,
        ['--mosaic-sweep' as string]: `${SWEEP_MS}ms`,
      }}
    />
  );
}

const source = `#version 300 es
precision highp float;

in vec2 fragCoord;
out vec4 outColor;

uniform mediump vec2 u_resolution;
uniform sampler2D u_texture_0;
uniform sampler2D u_texture_1;
uniform sampler2D u_texture_2;
uniform sampler2D u_texture_3;

uniform float u_origin_x;
uniform float u_origin_y;
uniform float u_scene_w;
uniform float u_center_x;
uniform float u_center_y;
uniform float u_zoom;
uniform vec3 u_tile_low;
uniform vec3 u_tile_high;
uniform vec3 u_logo_low;
uniform vec3 u_logo_high;
uniform vec3 u_page_color;
uniform float u_logo_mix;
uniform float u_base_mix;
uniform float u_depth;
uniform float u_depth_reach;
uniform float u_light_x;
uniform float u_light_y;
uniform float u_light_z;
uniform float u_camera;
uniform float u_diffuse;
uniform float u_shadow;
uniform float u_specular;
uniform float u_spec_size;
uniform float u_fresnel;
uniform float u_fresnel_power;
uniform float u_rim;
uniform float u_prism;
uniform float u_prism_width;
uniform float u_prism_spread;
uniform float u_prism_side;
uniform float u_shadow_strength;
uniform float u_shadow_height;
uniform float u_shadow_soft;
uniform float u_reveal;
uniform float u_reveal_max;
uniform float u_front;
uniform float u_reveal_max_linear;
uniform float u_linear_offset;
uniform float u_linear;
uniform float u_angle;
uniform float u_edge;
uniform float u_film_spread;
uniform float u_grain;
uniform float u_grain_scale;
uniform float u_blur;
uniform float u_saturation;
uniform float u_decay;
uniform float u_wave_x;
uniform float u_wave_y;
uniform float u_rings;
uniform float u_grow;
uniform float u_gap_glow;
uniform float u_time;
uniform float u_sheen;
uniform float u_sheen_scale;
uniform float u_sheen_angle;
uniform float u_sheen_warp;
uniform float u_sheen_glint;
uniform float u_sheen_base;
uniform float u_sheen_edge;
uniform float u_sheen_octaves;
uniform float u_sheen_drift;
uniform float u_sheen_hue;
uniform float u_sheen_flow;
uniform float u_sheen_fresnel_hue;
${TRAIL_GLSL}
uniform float u_film_light;
uniform float u_wave_width;
uniform float u_wave_amp;
uniform float u_wave_film;
uniform vec3 u_skeleton_color;

const float TAU = 6.28318530718;
const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);
const vec3 MAGENTA = vec3(0.93, 0.55, 1.0);
const vec3 VIOLET = vec3(0.66, 0.6, 1.0);
const vec3 CYAN = vec3(0.6, 0.88, 1.0);
const float EDGE_MAX = ${BAKE_EDGE_MAX}.0;
const float BAKE_BLUR = ${BAKE_BLUR}.0;

vec2 trailLight(vec2 point) {
  vec2 sum = vec2(0.0);
  float total = 0.0;
  float wobble = trailWobble(point);
  for (int i = 0; i < ${TRAIL_POINTS}; i++) {
    float weight = trailWeight(point, i, wobble);
    sum += (u_trail[i].xy - u_trail_origin.xy) * weight;
    total += weight;
  }
  return total > 0.0 ? sum / total : point;
}

float hash1(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash1(i), hash1(i + vec2(1.0, 0.0)), u.x), mix(hash1(i + vec2(0.0, 1.0)), hash1(i + vec2(1.0, 1.0)), u.x), u.y);
}

float sheenFbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 6; i++) {
    if (float(i) >= u_sheen_octaves) {
      break;
    }
    value += valueNoise(p) * amplitude;
    p = p * 2.03 + 17.0;
    amplitude *= 0.5;
  }
  return value;
}

float edgeAt(vec2 point) {
  return clamp(texture(u_texture_0, point / u_resolution).a * 2.0 - 1.0, 0.0, 1.0);
}

float occluderAt(vec2 point) {
  vec2 uv = point / u_resolution;
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) {
    return 0.0;
  }
  float edge = clamp(texture(u_texture_0, uv).a * 2.0 - 1.0, 0.0, 1.0) * EDGE_MAX;
  return smoothstep(-0.5, max(u_shadow_soft, 0.5), edge) * texture(u_texture_1, uv).a;
}

void main() {
  vec2 center = vec2(u_wave_x, u_wave_y);
  vec2 rel = fragCoord - center;
  float radial = length(rel);
  vec2 axis = vec2(cos(radians(u_angle)), sin(radians(u_angle)));
  float along = dot(rel, axis) + u_linear_offset;
  float dist = mix(radial, along, u_linear);
  vec2 dir = normalize(mix(rel / max(radial, 0.001), axis, u_linear) + 0.00001);
  float front = u_front * mix(u_reveal_max, u_reveal_max_linear, u_linear);
  float energy = pow(max(1.0 - u_reveal, 0.0), u_decay);
  float k = (dist - front) / (u_wave_width * (1.0 + u_grow * u_reveal));
  float waving = step(0.0001, u_reveal) * (1.0 - step(0.9999, u_reveal));
  float pulse = exp(-k * k * 2.5) * waving;
  float trail = k < 0.0 ? sin(-k * 3.2) * exp(k * 0.55) * u_rings * waving : 0.0;
  vec2 at = fragCoord - dir * (pulse + trail) * u_wave_amp * energy;
  vec2 uv = at / u_resolution;
  vec4 surfaceData = texture(u_texture_0, uv);
  float alpha = texture(u_texture_1, uv).a;
  vec3 baked = texture(u_texture_3, uv).rgb;
  float skeletonAlpha = texture(u_texture_2, uv).a;
  float frost = clamp(pulse * u_blur / BAKE_BLUR, 0.0, 1.0);
  alpha = mix(alpha, baked.r, frost);
  skeletonAlpha = mix(skeletonAlpha, baked.g, frost);
  vec2 scene = at + vec2(u_origin_x, u_origin_y);
  vec3 toLight = normalize(vec3(u_light_x * u_scene_w, -u_light_y, u_light_z) - vec3(scene, 0.0));
  vec3 color = vec3(0.0);

  if (alpha > 0.0) {
    vec2 nxy = surfaceData.rg * 2.0 - 1.0;
    vec3 surface = normalize(vec3(nxy, sqrt(max(1.0 - dot(nxy, nxy), 0.0))));
    float packed = floor(surfaceData.b * 255.0 + 0.5);
    float isLogo = step(127.5, packed);
    float tone = clamp((packed - isLogo * 145.0) / 110.0, 0.0, 1.0);
    float edge = clamp(surfaceData.a * 2.0 - 1.0, 0.0, 1.0) * EDGE_MAX;

    vec3 tile = mix(u_tile_low, u_tile_high, tone);
    vec3 logoTile = mix(u_logo_low, u_logo_high, tone);
    vec3 tinted = mix(mix(tile, logoTile, isLogo * u_logo_mix), u_page_color, u_base_mix);
    float thick = smoothstep(0.0, max(u_depth_reach, 0.001), edge) * 0.925;
    vec3 deep = tinted * 0.78;
    vec3 thin = mix(tinted, vec3(dot(tinted, LUMA)), 0.5) * 1.35;
    vec3 albedo = mix(tinted, mix(thin, deep, thick), u_depth);

    vec3 toEye = normalize(vec3(vec2(u_center_x, u_center_y) - scene, max(u_camera, 1.0)));
    float lit = u_diffuse * (max(dot(surface, toLight), 0.0) - max(toLight.z, 0.0));
    float shade = 1.0 + (lit < 0.0 ? lit * u_shadow : lit);
    vec3 halfway = normalize(toLight + toEye);
    float spread = acos(clamp(dot(surface, halfway), -1.0, 1.0)) / max(radians(u_spec_size), 0.001);
    float glint = exp(-spread * spread) * u_specular;
    float facing = clamp(dot(surface, toEye), 0.0, 1.0);
    float fresnel = pow(1.0 - facing, u_fresnel_power) * u_fresnel;
    vec3 reflected = reflect(-toEye, surface);
    float sky = mix(1.0 - u_rim, 1.0, smoothstep(0.0, 0.6, -reflected.y));
    color = albedo * shade + vec3(glint + fresnel * sky);

    float sheenReveal = u_sheen > 0.0 ? trailReveal(at) : 0.0;
    if (sheenReveal > 0.0) {
      vec2 sheenUv = (at + surface.xy * u_sheen_warp) / max(u_sheen_scale, 1.0);
      float sheenTime = u_time * u_sheen_flow;
      vec2 sheenDrift = vec2(sheenFbm(sheenUv * 0.7 + sheenTime * 0.04), sheenFbm(sheenUv * 0.7 + 5.2 - sheenTime * 0.03));
      float sheenHue = sheenFbm(sheenUv * 1.1 + sheenDrift * u_sheen_drift + sheenTime * 0.03) * u_sheen_hue + dot(sheenUv, vec2(0.4, 0.3)) + sheenReveal * 0.25 + dot(surface.xy, vec2(0.6, 0.4)) * u_sheen_angle + pow(1.0 - facing, 2.0) * u_sheen_fresnel_hue;
      vec3 sheenFilm = 0.5 + 0.5 * cos(TAU * (sheenHue + vec3(0.0, 0.33, 0.67)));
      sheenFilm = mix(sheenFilm, vec3(dot(sheenFilm, vec3(0.333))), 0.2);
      vec3 toTrail = normalize(vec3(trailLight(at) - at, 159.0));
      float trailGlint = pow(max(dot(surface, normalize(toTrail + vec3(0.0, 0.0, 1.0))), 0.0), 88.0);
      float sheenBand = (1.0 - thick) * (1.0 - thick);
      float sheenAmount = sheenReveal * u_sheen * (u_sheen_base + u_sheen_edge * sheenBand + 0.24 * trailGlint);
      color += sheenFilm * sheenAmount + vec3(trailGlint * sheenReveal * u_sheen_glint);
    }

    if (u_prism > 0.0) {
      float across = clamp(edge / max(u_prism_width, 0.5), 0.0, 1.0);
      vec2 inward = vec2(edgeAt(at + vec2(1.0, 0.0)) - edgeAt(at - vec2(1.0, 0.0)), edgeAt(at + vec2(0.0, 1.0)) - edgeAt(at - vec2(0.0, 1.0)));
      float away = clamp(dot(normalize(inward + 0.00001), normalize(toLight.xy + 0.0001)), 0.0, 1.0);
      float side = mix(away * away, 1.0, u_prism_side);
      float band = 4.0 * across * (1.0 - across);
      vec3 spectrum = 0.5 + 0.5 * cos(TAU * (across * u_prism_spread + vec3(0.0, 0.33, 0.67)));
      float weight = band * side * u_prism;
      color += (spectrum - vec3(dot(spectrum, vec3(0.333)))) * weight + spectrum * weight * 0.25;
    }
  }

  float shadow = 0.0;
  if (u_shadow_strength > 0.0 && alpha < 1.0) {
    vec2 reach = toLight.xy / max(toLight.z, 0.05) * u_shadow_height;
    shadow = occluderAt(at + reach) * u_shadow_strength;
  }

  vec4 glass = vec4(color * alpha, alpha + shadow * (1.0 - alpha));
  vec4 skeleton = vec4(u_skeleton_color * skeletonAlpha, skeletonAlpha);
  float revealed = u_reveal >= 0.9999 ? 1.0 : smoothstep(u_edge, -u_edge, k) * step(0.0001, u_reveal);
  outColor = mix(skeleton, glass, revealed);
  if (pulse > 0.001) {
    vec2 drift = vec2(valueNoise(fragCoord * u_grain_scale + 7.0), valueNoise(fragCoord * u_grain_scale + 31.0)) - 0.5;
    float hue = dot(rel, vec2(-axis.y, axis.x)) / 900.0 + k * u_film_spread + drift.x * u_grain + u_reveal * 0.4;
    float t = fract(hue);
    vec3 film = t < 0.333 ? mix(MAGENTA, VIOLET, t * 3.0) : t < 0.666 ? mix(VIOLET, CYAN, t * 3.0 - 1.0) : mix(CYAN, MAGENTA, t * 3.0 - 2.0);
    float core = exp(-k * k * 6.0);
    film = mix(film, vec3(1.0), core * 0.6);
    film = mix(vec3(dot(film, vec3(0.333))), film, u_saturation);
    float glow = waving * exp(-k * k * 1.2) * u_wave_film * mix(1.0, energy, 0.6);
    float halo = baked.b;
    float coverage = max(max(alpha, skeletonAlpha), halo * u_gap_glow);
    float amount = clamp(glow * coverage, 0.0, 1.0);
    if (u_film_light > 0.5) {
      outColor.rgb = mix(outColor.rgb, film * mix(1.0, outColor.a, 0.0), amount);
      outColor.a = mix(outColor.a, 1.0, amount);
    } else {
      outColor.rgb += film * amount;
      outColor.a = max(outColor.a, amount);
    }
  }

}
`;

function buildUniforms(
  palette: Palette,
  mode: Mode,
  origin: [number, number],
  center: [number, number],
  sceneWidth: number,
  reveal: Reveal,
  sheen: Sheen,
): Uniforms {
  const cx = reveal.originX * bake.width;
  const cy = reveal.originY * bake.height;
  const corners = [
    [-cx, -cy],
    [bake.width - cx, -cy],
    [-cx, bake.height - cy],
    [bake.width - cx, bake.height - cy],
  ];
  const revealMax = Math.max(...corners.map(([x, y]) => Math.hypot(x, y))) + reveal.width * 1.5;
  const angle = (reveal.angle * Math.PI) / 180;
  const projections = corners.map(([x, y]) => x * Math.cos(angle) + y * Math.sin(angle));
  const linearOffset = -Math.min(...projections);
  const linearMax = Math.max(...projections) + linearOffset + reveal.width * 1.5;
  const s = bake.settings as Record<string, number>;
  const light = mode === 'light';
  const f = (value: number) => ({ type: 'uniform1f', value }) as const;
  const v = (value: [number, number, number]) => ({ type: 'uniform3f', value }) as const;
  return {
    u_origin_x: f(origin[0]),
    u_origin_y: f(origin[1]),
    u_center_x: f(center[0]),
    u_center_y: f(center[1]),
    u_scene_w: f(sceneWidth),
    u_zoom: f(s.zoom),
    u_tile_low: v(palette.tileLow),
    u_tile_high: v(palette.tileHigh),
    u_logo_low: v(palette.logoLow),
    u_logo_high: v(palette.logoHigh),
    u_page_color: v(palette.page),
    u_logo_mix: f(s.logoMix),
    u_base_mix: f(light ? s.lmBase : s.dmBase),
    u_depth: f(s.depth * (light ? s.lmDepth : 1)),
    u_depth_reach: f(s.depthReach),
    u_light_x: f(s.lightX),
    u_light_y: f(s.lightY),
    u_light_z: f(s.lightZ),
    u_camera: f(s.camera),
    u_diffuse: f(s.diffuse),
    u_shadow: f(light ? s.lmShadow : 1),
    u_specular: f(s.specular),
    u_spec_size: f(s.specSize),
    u_fresnel: f(s.fresnel),
    u_fresnel_power: f(s.fresnelPower),
    u_rim: f(s.rim),
    u_prism: f(s.prism),
    u_prism_width: f(s.prismWidth),
    u_prism_spread: f(s.prismSpread),
    u_prism_side: f(s.prismSide),
    u_shadow_strength: f(s.shadowStrength * (light ? 1 : s.dmShadow)),
    u_shadow_height: f(s.shadowHeight),
    u_shadow_soft: f(s.shadowSoft),
    u_reveal: f(0),
    u_front: f(0),
    u_skeleton_color: v(palette.tileLow),
    u_reveal_max: f(revealMax),
    u_reveal_max_linear: f(linearMax),
    u_linear_offset: f(linearOffset),
    u_linear: f(reveal.linear),
    u_angle: f(reveal.angle),
    u_edge: f(reveal.edge),
    u_film_spread: f(reveal.filmSpread),
    u_grain: f(reveal.grain),
    u_grain_scale: f(reveal.grainScale),
    u_blur: f(reveal.blur),
    u_saturation: f(reveal.saturation),
    u_decay: f(reveal.decay),
    u_wave_x: f(cx),
    u_wave_y: f(cy),
    u_rings: f(reveal.rings),
    u_grow: f(reveal.grow),
    u_gap_glow: f(reveal.gapGlow),
    u_sheen: f(sheen.sheen),
    u_sheen_scale: f(sheen.scale),
    u_sheen_angle: f(sheen.angle),
    u_sheen_warp: f(sheen.warp),
    u_sheen_glint: f(sheen.glint),
    u_sheen_base: f(sheen.base),
    u_sheen_edge: f(sheen.edge),
    u_sheen_octaves: f(sheen.octaves),
    u_sheen_drift: f(sheen.drift),
    u_sheen_hue: f(sheen.hueSpread),
    u_sheen_flow: f(sheen.flow),
    u_sheen_fresnel_hue: f(sheen.fresnelHue),
    u_trail: TRAIL_POINTS_UNIFORM,
    u_trail_origin: TRAIL_ORIGIN_UNIFORM,
    u_trail_energy: TRAIL_ENERGY_UNIFORM,
    u_wave_width: f(reveal.width),
    u_wave_amp: f(reveal.amp),
    u_wave_film: f(reveal.film * (light ? 1 : 0.45)),
    u_film_light: f(light ? 1 : 0),
  };
}

function parseRgb(value: string): [number, number, number] | null {
  const match = value.match(/rgba?\(([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/);
  return match ? [Number(match[1]) / 255, Number(match[2]) / 255, Number(match[3]) / 255] : null;
}

function cubicBezier(x1: number, y1: number, x2: number, y2: number, x: number) {
  const curve = (a: number, b: number, t: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  let lo = 0;
  let hi = 1;
  let t = x;
  for (let i = 0; i < 24; i += 1) {
    t = (lo + hi) / 2;
    if (curve(x1, x2, t) < x) {
      lo = t;
    } else {
      hi = t;
    }
  }
  return curve(y1, y2, t);
}

function revealTime(start: number | null, reveal: Reveal) {
  if (reveal.scrub) {
    return reveal.progress;
  }
  if (start === null) {
    return 0;
  }
  return Math.min(1, Math.max(0, (performance.now() - start) / reveal.duration));
}

function revealFront(time: number, reveal: Reveal) {
  const eased = cubicBezier(reveal.x1, reveal.y1, reveal.x2, reveal.y2, time);
  return reveal.from + (reveal.to - reveal.from) * eased;
}

const subscribeNothing = () => () => {};

function TweakPanel<T extends Record<string, number>>({
  title,
  values,
  defaults,
  sliders,
  onChange,
  onReplay,
  className,
}: {
  title: string;
  values: T;
  defaults: T;
  sliders: Array<{ key: keyof T & string; min: number; max: number; step: number }>;
  onChange: (next: T) => void;
  onReplay?: () => void;
  className?: string;
}) {
  const [open, setOpen] = React.useState(true);
  const [copied, setCopied] = React.useState(false);
  return (
    <div
      className={`fixed bottom-4 z-50 flex max-h-[calc(100vh-2rem)] w-72 flex-col gap-1.5 overflow-y-auto rounded-lg border border-neutral-200 bg-white/90 p-3 text-left text-xs text-neutral-800 shadow-lg backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/90 dark:text-neutral-200 ${className ?? 'left-4'}`}
    >
      <button
        type='button'
        className='flex items-center justify-between font-medium'
        onClick={() => setOpen(value => !value)}
      >
        {title}
        <span>{open ? '−' : '+'}</span>
      </button>
      {open
        ? sliders.map(({ key, min, max, step }) => (
            <label
              key={key}
              className='grid grid-cols-[4.5rem_1fr_2.75rem] items-center gap-2'
            >
              <span>{key}</span>
              <input
                type='range'
                min={min}
                max={max}
                step={step}
                value={values[key]}
                onChange={event => onChange({ ...values, [key]: Number(event.target.value) })}
              />
              <span className='text-right tabular-nums'>{values[key]}</span>
            </label>
          ))
        : null}
      <div className={`grid gap-2 ${onReplay ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {onReplay ? (
          <button
            type='button'
            className='rounded border border-neutral-300 py-1 dark:border-neutral-700'
            onClick={onReplay}
          >
            Replay
          </button>
        ) : null}
        <button
          type='button'
          className='rounded border border-neutral-300 py-1 dark:border-neutral-700'
          onClick={() => {
            void navigator.clipboard.writeText(JSON.stringify(values, null, 2)).then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1200);
            });
          }}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          type='button'
          className='rounded border border-neutral-300 py-1 dark:border-neutral-700'
          onClick={() => onChange(defaults)}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function usePointerEffects(enabled: boolean) {
  const [active, setActive] = React.useState(false);
  React.useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setActive(enabled && fine.matches && !reduced.matches);
    update();
    fine.addEventListener('change', update);
    reduced.addEventListener('change', update);
    return () => {
      fine.removeEventListener('change', update);
      reduced.removeEventListener('change', update);
    };
  }, [enabled]);
  return active;
}

function useLightSpring(ref: React.RefObject<HTMLDivElement | null>, enabled: boolean) {
  const pointer = useMotionValue(0.5);
  const spring = useSpring(pointer, { stiffness: 260, damping: 28, mass: 0.6 });
  React.useEffect(() => {
    const scene = ref.current;
    if (!scene || !enabled) {
      return;
    }
    const onMove = (event: PointerEvent) => {
      const rect = scene.getBoundingClientRect();
      pointer.set(Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)));
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [ref, enabled, pointer]);
  return spring;
}

export function BakedMosaic() {
  const sceneRef = React.useRef<HTMLDivElement>(null);
  const { height, focus, width } = useSceneLayout(sceneRef);
  const isReady = useMosaicReady();
  const mode = useMode();
  const palette = React.useMemo(() => readPalette(mode) ?? FALLBACK_PALETTE, [mode]);
  const settings = bake.settings as Record<string, number>;
  const origin: [number, number] = [focus.x + bake.offsetX, focus.y + bake.offsetY];
  const center: [number, number] = [focus.x, focus.y + settings.logoSize * settings.logoY];
  const skeletonColorRef = React.useRef<[number, number, number]>(palette.tileLow);
  React.useEffect(() => {
    const element = document.querySelector('.mosaic-skeleton');
    const parsed = element ? parseRgb(getComputedStyle(element).backgroundColor) : null;
    skeletonColorRef.current = parsed ?? palette.tileLow;
  }, [mode, palette]);
  const [reveal, setReveal] = React.useState(REVEAL_DEFAULTS);
  const [sheen, setSheen] = React.useState(SHEEN_DEFAULTS);
  const mounted = React.useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  React.useEffect(() => {
    if (reveal.scrub && !ready) {
      setReady();
    }
  }, [reveal.scrub]);
  const uniforms = React.useMemo(
    () => buildUniforms(palette, mode, origin, center, width, reveal, sheen),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [palette, mode, origin[0], origin[1], center[0], center[1], width, reveal, sheen],
  );
  const pointerEffects = usePointerEffects(true);
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const lightX = settings.lightX;
  const follow = settings.follow;
  const spring = useLightSpring(sceneRef, pointerEffects && follow > 0);
  const startRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (!isReady) {
      startRef.current = null;
      return;
    }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    startRef.current = reduced ? -Infinity : performance.now();
  }, [isReady]);
  const liveUniforms = React.useCallback(
    (): Uniforms => ({
      u_reveal: { type: 'uniform1f', value: revealTime(startRef.current, reveal) },
      u_front: { type: 'uniform1f', value: revealFront(revealTime(startRef.current, reveal), reveal) },
      u_skeleton_color: { type: 'uniform3f', value: skeletonColorRef.current },
      u_light_x: { type: 'uniform1f', value: lightX + (spring.get() - lightX) * follow },
    }),
    [reveal, spring, lightX, follow],
  );
  const shouldRender = React.useCallback(() => {
    const start = startRef.current;
    const revealing =
      !reveal.scrub && start !== null && start !== -Infinity && performance.now() - start < reveal.duration + 100;
    return (
      revealing ||
      (pointerEffects && TRAIL_ENERGY_UNIFORM.value > 0.001) ||
      (pointerEffects && follow > 0 && spring.isAnimating())
    );
  }, [reveal, pointerEffects, follow, spring]);
  React.useEffect(() => (pointerEffects ? startTrail() : undefined), [pointerEffects]);
  const onRender = React.useCallback(() => {
    markReady();
    if (pointerEffects) {
      stepTrail(canvasRef.current);
    }
  }, [pointerEffects]);
  return (
    <div
      ref={sceneRef}
      aria-hidden='true'
      className='pointer-events-none absolute left-1/2 top-0 -z-10 h-[38rem] w-[min(96rem,100%)] -translate-x-1/2'
      style={height ? { height } : undefined}
    >
      {height ? (
        <div
          ref={canvasRef}
          className='absolute'
          style={{ left: origin[0], top: origin[1], width: bake.width, height: bake.height }}
        >
          <Shader
            source={source}
            uniforms={uniforms}
            textures={TEXTURES}
            liveUniforms={liveUniforms}
            shouldRender={shouldRender}
            onRender={onRender}
            premultiplied
          />
        </div>
      ) : null}
      {SHOW_REVEAL_PANEL && process.env.NODE_ENV === 'development' && mounted
        ? createPortal(
            <TweakPanel
              title='Reveal'
              values={reveal}
              defaults={REVEAL_DEFAULTS}
              sliders={REVEAL_SLIDERS}
              onChange={setReveal}
              onReplay={() => {
                setReveal({ ...reveal, scrub: 0 });
                replayReveal();
              }}
            />,
            document.body,
          )
        : null}
      {SHOW_SHEEN_PANEL && process.env.NODE_ENV === 'development' && mounted
        ? createPortal(
            <TweakPanel
              title='Sheen'
              values={sheen}
              defaults={SHEEN_DEFAULTS}
              sliders={SHEEN_SLIDERS}
              onChange={setSheen}
              className='right-4'
            />,
            document.body,
          )
        : null}
    </div>
  );
}
