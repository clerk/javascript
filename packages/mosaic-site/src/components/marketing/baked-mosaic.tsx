'use client';
import { useMotionValue, useSpring } from 'motion/react';
import * as React from 'react';

import desktopBake from '@/components/marketing/mosaic-bake.json';
import mobileBake from '@/components/marketing/mosaic-bake-mobile.json';
import {
  BAKE_BLUR,
  BAKE_EDGE_MAX,
  FALLBACK_PALETTE,
  FOCUS_SIZE,
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
  TRAIL_RADIUS_UNIFORM,
} from '@/components/marketing/pointer-trail';
import { Shader, type ShaderHandle, type Uniforms } from '@/components/shader';
import { type Mode, useMode } from '@/components/use-mode';

type Bake = typeof desktopBake;
type Variant = 'desktop' | 'mobile';

const BAKES: Record<Variant, Bake> = { desktop: desktopBake, mobile: mobileBake };
const SUFFIX: Record<Variant, string> = { desktop: '', mobile: '-mobile' };
const MOBILE_QUERY = '(max-width: 639px)';

const bakeUrl = (variant: Variant, name: string) =>
  `/mosaic/${name}${SUFFIX[variant]}.webp?v=${BAKES[variant].version}`;

export const MOSAIC_SKELETON_URL = bakeUrl('desktop', 'skeleton');
export const MOSAIC_SKELETON_MOBILE_URL = bakeUrl('mobile', 'skeleton');

export const TEXTURES: Record<Variant, string[]> = {
  desktop: ['surface', 'mask', 'skeleton', 'reveal'].map(name => bakeUrl('desktop', name)),
  mobile: ['surface', 'mask', 'skeleton', 'reveal'].map(name => bakeUrl('mobile', name)),
};

function visibleSkeleton() {
  return [...document.querySelectorAll<HTMLElement>('.mosaic-skeleton')].find(
    element => element.getClientRects().length > 0,
  );
}

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
};

export const REVEAL: Reveal = {
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
};

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
  lightStrength: number;
  lightTint: number;
  darkStrength: number;
};

const SHEEN: Sheen = {
  sheen: 0.135,
  scale: 675,
  octaves: 4,
  drift: 3.8,
  hueSpread: 2.4,
  flow: 4.2,
  warp: 540,
  angle: 0,
  fresnelHue: 1.5,
  base: 1.5,
  edge: 3,
  glint: 0,
  lightStrength: 0.5,
  lightTint: 0.6,
  darkStrength: 0.5,
};

export const SWAY = { x: 0.2, y: 160, speed: 0.1, detail: 0.5, glint: 0.05, size: 12 };

export const SWAY_FRAME_MS = 32;
const SWAY_IDLE_MS = 20000;

export function noiseHash(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

function gradientNoise(t: number, seed: number) {
  const i = Math.floor(t);
  const f = t - i;
  const u = f * f * f * (f * (f * 6 - 15) + 10);
  const a = noiseHash(i + seed) * f;
  const b = noiseHash(i + 1 + seed) * (f - 1);
  return (a + (b - a) * u) * 2;
}

function swayNoise(t: number, seed: number, detail: number) {
  return (gradientNoise(t, seed) + detail * gradientNoise(t * 2.13 + 7.7, seed + 31)) / (1 + detail);
}
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
  const sweep = visibleSkeleton()
    ?.getAnimations({ subtree: true })
    .find(animation => animation instanceof CSSAnimation && animation.animationName === 'mosaic-skeleton-sweep');
  const elapsed = typeof sweep?.currentTime === 'number' ? sweep.currentTime : null;
  if (elapsed === null || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setReady();
    return;
  }
  window.setTimeout(setReady, Math.max(0, MIN_SWEEPS * SWEEP_MS - elapsed));
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

const SKELETON_FADE_MS = 300;

function skeletonFade(start: number | null) {
  if (start === null) {
    return 0;
  }
  const t = Math.min(1, Math.max(0, (performance.now() - start) / SKELETON_FADE_MS));
  return 1 - (1 - t) * (1 - t);
}

function SkeletonLayer({ variant, shown, className }: { variant: Variant; shown: boolean; className: string }) {
  const bake = BAKES[variant];
  const focusSize = bake.focusSize;
  const mask = `url("${bakeUrl(variant, 'skeleton')}")`;
  return (
    <div
      aria-hidden='true'
      data-done={shown ? undefined : ''}
      className={`mosaic-skeleton dark:bg-gray-850 bg-gray-150 pointer-events-none absolute -z-10 transition-opacity duration-300 ease-out ${className}`}
      style={{
        left: `${50 + (bake.offsetX / focusSize) * 100}%`,
        top: `${50 + (bake.offsetY / focusSize) * 100}%`,
        width: `${(bake.width / focusSize) * 100}%`,
        height: `${(bake.height / focusSize) * 100}%`,
        maskImage: mask,
        WebkitMaskImage: mask,
        maskSize: '100% 100%',
        WebkitMaskSize: '100% 100%',
        opacity: shown ? 1 : 0,
        ['--mosaic-sweep' as string]: `${SWEEP_MS}ms`,
      }}
    />
  );
}

export function MosaicSkeleton() {
  const shown = !useMosaicReady();
  return (
    <>
      <SkeletonLayer
        variant='desktop'
        shown={shown}
        className='max-sm:hidden'
      />
      <SkeletonLayer
        variant='mobile'
        shown={shown}
        className='sm:hidden'
      />
    </>
  );
}

export const MOSAIC_SOURCE = `#version 300 es
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
uniform float u_edge_light;
uniform float u_falloff;
uniform float u_falloff_reach;
uniform float u_add_glow;
uniform float u_add_catch;
uniform float u_add_tone;
uniform float u_specular;
uniform float u_spec_size;
uniform float u_sway_glint;
uniform float u_sheen_light;
uniform float u_sheen_light_tint;
uniform float u_sheen_dark;
uniform float u_sway_size;
uniform float u_fresnel;
uniform float u_highlight;
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
uniform float u_invert;
uniform float u_shimmer;
uniform float u_shimmer_amp;
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
uniform float u_skeleton_fade;

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
    float shade = 1.0 + (lit < 0.0 ? lit * u_shadow : lit * u_edge_light);
    vec2 lightPoint = vec2(u_light_x * u_scene_w, -u_light_y);
    float falloffT = clamp((length(scene - lightPoint) - u_light_y) / max(u_falloff_reach, 1.0), 0.0, 1.0);
    shade *= mix(1.0 + u_falloff, 1.0 - u_falloff, falloffT);
    vec3 halfway = normalize(toLight + toEye);
    float spread = acos(clamp(dot(surface, halfway), -1.0, 1.0)) / max(radians(u_spec_size), 0.001);
    float glint = exp(-spread * spread) * u_specular;
    float facing = clamp(dot(surface, toEye), 0.0, 1.0);
    float fresnel = pow(1.0 - facing, u_fresnel_power) * u_fresnel;
    vec3 reflected = reflect(-toEye, surface);
    float sky = mix(1.0 - u_rim, 1.0, smoothstep(0.0, 0.6, -reflected.y));
    color = albedo * shade + vec3(glint + fresnel * sky) * u_highlight;
    color += vec3(u_add_glow * (1.0 - falloffT) + u_add_catch * (dot(surface, toLight) - toLight.z) * smoothstep(0.6, 0.9, thick) + u_add_tone * (tone - 0.5));
    float swaySpread = acos(clamp(dot(surface, halfway), -1.0, 1.0)) / max(radians(u_sway_size), 0.001);
    color += exp(-swaySpread * swaySpread) * u_sway_glint;

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
      float sheenModeScale = mix(u_sheen_dark, u_sheen_light, u_film_light);
      vec3 sheenChroma = sheenFilm - vec3(dot(sheenFilm, vec3(0.333)));
      vec3 sheenColor = mix(sheenFilm, sheenChroma, u_sheen_light_tint * u_film_light);
      color += (sheenColor * sheenAmount + vec3(trailGlint * sheenReveal * u_sheen_glint)) * sheenModeScale;
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
  vec4 skeleton = vec4(u_skeleton_color * skeletonAlpha, skeletonAlpha) * u_skeleton_fade;
  if (u_shimmer_amp > 0.0) {
    float band = 0.55 * u_resolution.x;
    float across = (fragCoord.x + fragCoord.y * 0.364 - mix(-1.3, 3.1, u_shimmer) * band) / band;
    skeleton.rgb += clamp(1.0 - abs(across * 2.0 - 1.0), 0.0, 1.0) * u_shimmer_amp * skeleton.a;
  }
  float revealed = u_reveal >= 0.9999 ? 1.0 : smoothstep(u_edge, -u_edge, k) * step(0.0001, u_reveal);
  revealed = mix(revealed, 1.0 - revealed, u_invert);
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

export function buildUniforms(
  palette: Palette,
  mode: Mode,
  origin: [number, number],
  center: [number, number],
  sceneWidth: number,
  bake: Bake,
): Uniforms {
  const reveal = REVEAL;
  const sheen = SHEEN;
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
    u_edge_light: f(light ? 1 : (s.dmEdge ?? 1)),
    u_falloff: f(light ? (s.lmFalloff ?? 0) : (s.dmFalloff ?? 0)),
    u_falloff_reach: f(s.falloffReach ?? 700),
    u_add_glow: f(light ? 0 : (s.dmGlow ?? 0)),
    u_add_catch: f(light ? 0 : (s.dmCatch ?? 0)),
    u_add_tone: f(light ? 0 : (s.dmTone ?? 0)),
    u_specular: f(s.specular),
    u_spec_size: f(s.specSize),
    u_sway_glint: f(SWAY.glint),
    u_sway_size: f(SWAY.size),
    u_fresnel: f(s.fresnel),
    u_highlight: f(s.highlight ?? 1),
    u_fresnel_power: f(s.fresnelPower),
    u_rim: f(s.rim),
    u_prism: f(s.prism * (light ? 1 : (s.dmPrism ?? 1))),
    u_prism_width: f(s.prismWidth),
    u_prism_spread: f(s.prismSpread),
    u_prism_side: f(s.prismSide),
    u_shadow_strength: f(s.shadowStrength * (light ? 1 : s.dmShadow)),
    u_shadow_height: f(s.shadowHeight),
    u_shadow_soft: f(s.shadowSoft),
    u_reveal: f(0),
    u_front: f(0),
    u_invert: f(0),
    u_shimmer: f(0),
    u_shimmer_amp: f(0),
    u_skeleton_color: v(palette.tileLow),
    u_skeleton_fade: f(0),
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
    u_sheen_light: f(sheen.lightStrength),
    u_sheen_light_tint: f(sheen.lightTint),
    u_sheen_dark: f(sheen.darkStrength),
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
    u_trail_radius: TRAIL_RADIUS_UNIFORM,
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

export function cubicBezier(x1: number, y1: number, x2: number, y2: number, x: number) {
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

function revealTime(start: number | null) {
  if (start === null) {
    return 0;
  }
  return Math.min(1, Math.max(0, (performance.now() - start) / REVEAL.duration));
}

export function revealFront(time: number) {
  const eased = cubicBezier(REVEAL.x1, REVEAL.y1, REVEAL.x2, REVEAL.y2, time);
  return REVEAL.from + (REVEAL.to - REVEAL.from) * eased;
}

function usePointerEffects(enabled: boolean, pointer: 'fine' | 'coarse' = 'fine') {
  const [active, setActive] = React.useState(false);
  React.useEffect(() => {
    const fine = window.matchMedia(`(pointer: ${pointer})`);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setActive(enabled && fine.matches && !reduced.matches);
    update();
    fine.addEventListener('change', update);
    reduced.addEventListener('change', update);
    return () => {
      fine.removeEventListener('change', update);
      reduced.removeEventListener('change', update);
    };
  }, [enabled, pointer]);
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
  const { height, focus, width, scale: tierScale } = useSceneLayout(sceneRef, false);
  const [variant, setVariant] = React.useState<Variant | null>(null);
  React.useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const update = () => setVariant(query.matches ? 'mobile' : 'desktop');
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  const bake = BAKES[variant ?? 'desktop'];
  const scale = (tierScale * FOCUS_SIZE) / bake.focusSize;
  const isReady = useMosaicReady();
  const mode = useMode();
  const palette = React.useMemo(() => readPalette(mode) ?? FALLBACK_PALETTE, [mode]);
  const settings = bake.settings as Record<string, number>;
  const origin: [number, number] = [focus.x + bake.offsetX * scale, focus.y + bake.offsetY * scale];
  const center: [number, number] = [focus.x, focus.y + settings.logoSize * settings.logoY * scale];
  const skeletonColorRef = React.useRef<[number, number, number]>(palette.tileLow);
  React.useEffect(() => {
    const element = visibleSkeleton();
    const parsed = element ? parseRgb(getComputedStyle(element).backgroundColor) : null;
    skeletonColorRef.current = parsed ?? palette.tileLow;
  }, [mode, palette]);
  const visibleRef = React.useRef(true);
  const shaderRef = React.useRef<ShaderHandle>(null);
  const swayFrameRef = React.useRef(0);
  React.useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) {
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
      if (entry.isIntersecting) {
        shaderRef.current?.play();
      } else {
        shaderRef.current?.pause();
      }
    });
    observer.observe(scene);
    return () => observer.disconnect();
  }, [height, variant]);
  const uniforms = React.useMemo(
    () => buildUniforms(palette, mode, origin, center, width, bake),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [palette, mode, origin[0], origin[1], center[0], center[1], width, bake],
  );
  const pointerEffects = usePointerEffects(true);
  const touchEffects = usePointerEffects(true, 'coarse');
  const trailEffects = pointerEffects || touchEffects;
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const lightX = settings.lightX;
  const follow = settings.follow;
  const spring = useLightSpring(sceneRef, pointerEffects && follow > 0);
  const activityRef = React.useRef({ last: 0, idle: 0 });
  React.useEffect(() => {
    if (!pointerEffects) {
      return;
    }
    const onActivity = () => {
      const now = performance.now();
      const activity = activityRef.current;
      activity.idle += Math.max(0, now - activity.last - SWAY_IDLE_MS);
      activity.last = now;
    };
    const events = ['pointermove', 'pointerdown', 'wheel', 'scroll', 'keydown'] as const;
    onActivity();
    events.forEach(name => window.addEventListener(name, onActivity, { passive: true }));
    return () => events.forEach(name => window.removeEventListener(name, onActivity));
  }, [pointerEffects]);
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
      u_reveal: { type: 'uniform1f', value: revealTime(startRef.current) },
      u_front: { type: 'uniform1f', value: revealFront(revealTime(startRef.current)) },
      u_skeleton_color: { type: 'uniform3f', value: skeletonColorRef.current },
      u_skeleton_fade: { type: 'uniform1f', value: skeletonFade(startRef.current) },
      ...(() => {
        const { last, idle } = activityRef.current;
        const t = ((Math.min(performance.now(), last + SWAY_IDLE_MS) - idle) / 1000) * SWAY.speed;
        const swaying = pointerEffects && SWAY.speed > 0;
        const dx = swaying ? swayNoise(t, 0, SWAY.detail) * SWAY.x : 0;
        const dy = swaying ? swayNoise(t, 57, SWAY.detail) * SWAY.y : 0;
        return {
          u_light_x: { type: 'uniform1f', value: lightX + (spring.get() - lightX) * follow + dx },
          u_light_y: { type: 'uniform1f', value: settings.lightY + dy },
          u_sway_glint: { type: 'uniform1f', value: swaying ? SWAY.glint : 0 },
          u_sway_size: { type: 'uniform1f', value: SWAY.size },
        } satisfies Uniforms;
      })(),
    }),
    [spring, lightX, follow, pointerEffects, settings.lightY],
  );
  const shouldRender = React.useCallback(() => {
    const start = startRef.current;
    const revealing = start !== null && start !== -Infinity && performance.now() - start < REVEAL.duration + 100;
    if (
      revealing ||
      (trailEffects && visibleRef.current && TRAIL_ENERGY_UNIFORM.value > 0.01) ||
      (pointerEffects && follow > 0 && spring.isAnimating())
    ) {
      return true;
    }
    const now = performance.now();
    if (
      pointerEffects &&
      SWAY.speed > 0 &&
      visibleRef.current &&
      now - activityRef.current.last < SWAY_IDLE_MS &&
      now - swayFrameRef.current >= SWAY_FRAME_MS
    ) {
      swayFrameRef.current = now;
      return true;
    }
    return false;
  }, [pointerEffects, trailEffects, follow, spring]);
  const coarseRef = React.useRef(false);
  React.useEffect(() => {
    coarseRef.current = window.matchMedia('(pointer: coarse)').matches;
  }, []);
  const pixelRatio = React.useCallback(() => {
    const full = Math.round(Math.max(1, Math.min(window.devicePixelRatio || 1, 2)));
    if (!coarseRef.current) {
      return full;
    }
    const start = startRef.current;
    const settled = start === -Infinity || (start !== null && performance.now() - start >= REVEAL.duration + 100);
    return settled ? full : 1;
  }, []);
  React.useEffect(() => (trailEffects ? startTrail() : undefined), [trailEffects]);
  const onRender = React.useCallback(() => {
    markReady();
    if (trailEffects) {
      stepTrail(canvasRef.current);
    }
  }, [trailEffects]);
  const [failed, setFailed] = React.useState(false);
  const onError = React.useCallback(() => {
    setFailed(true);
    markReady();
  }, []);
  return (
    <div
      ref={sceneRef}
      aria-hidden='true'
      className='pointer-events-none absolute left-1/2 top-0 -z-10 h-[38rem] w-[min(96rem,100%)] -translate-x-1/2'
      style={height ? { height } : undefined}
    >
      {height && variant ? (
        <div
          ref={canvasRef}
          className='absolute'
          style={{ left: origin[0], top: origin[1], width: bake.width * scale, height: bake.height * scale }}
        >
          {failed ? (
            <div
              className='bg-gray-150 dark:bg-gray-750 absolute inset-0 transition-opacity duration-300 ease-out'
              style={{
                maskImage: `url("${bakeUrl(variant, 'mask')}")`,
                WebkitMaskImage: `url("${bakeUrl(variant, 'mask')}")`,
                maskSize: '100% 100%',
                WebkitMaskSize: '100% 100%',
                opacity: isReady ? 1 : 0,
              }}
            />
          ) : (
            <Shader
              ref={shaderRef}
              key={variant}
              source={MOSAIC_SOURCE}
              uniforms={uniforms}
              textures={TEXTURES[variant]}
              liveUniforms={liveUniforms}
              shouldRender={shouldRender}
              onRender={onRender}
              onError={onError}
              pixelRatio={pixelRatio}
              premultiplied
            />
          )}
          {touchEffects ? (
            <div
              aria-hidden='true'
              className='pointer-events-auto absolute inset-0 touch-pan-y select-none [-webkit-touch-callout:none]'
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
