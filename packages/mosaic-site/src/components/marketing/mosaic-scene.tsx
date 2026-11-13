'use client';
import { useMotionValue, useSpring } from 'motion/react';
import * as React from 'react';
import { createPortal } from 'react-dom';

import { bakeScene } from '@/components/marketing/mosaic-bake';
import {
  BAKE_EDGE_MAX,
  FALLBACK_PALETTE,
  type Focus,
  FOCUS_SIZE,
  type Palette,
  readPalette,
  type Rgb,
  type TextBox,
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

const MARKS = [
  { label: 'Original', stroke: 28, gap: 16, corner: 3 },
  { label: 'Loop gap', stroke: 32, gap: 8, corner: 4 },
  { label: 'Slit', stroke: 36, gap: 3, corner: 4 },
  { label: 'Clerk symbol', stroke: 28, gap: 8, corner: 2, symbol: true },
];

const POINTER_EFFECTS = false;
const subscribeNothing = () => () => {};

const source = `#version 300 es
precision highp float;

in vec2 fragCoord;
out vec4 outColor;

uniform mediump vec2 u_resolution;
uniform float u_stroke;
uniform float u_gap;
uniform float u_corner;
uniform float u_symbol;

uniform float u_cell;
uniform float u_jitter;
uniform float u_seed;
uniform float u_grout;
uniform float u_grout_var;
uniform float u_round;
uniform vec3 u_tile_low;
uniform vec3 u_tile_high;
uniform vec3 u_logo_low;
uniform vec3 u_logo_high;
uniform float u_logo_mix;
uniform float u_flow;
uniform float u_flow_scale;
uniform float u_tone;
uniform float u_bevel_width;
uniform float u_bevel_shape;
uniform float u_bevel_height;
uniform int u_view;
uniform int u_bake;
uniform float u_skeleton_grout;
uniform float u_clay_tilt;
uniform float u_clay_thickness;
uniform float u_clay_wobble;
uniform float u_clay_scale;
uniform float u_dome_height;
uniform float u_dome_reach;
uniform float u_edge_height;
uniform float u_edge_width;
uniform float u_dish_depth;
uniform float u_dish_reach;
uniform float u_rigid;
uniform float u_lift;
uniform vec3 u_logo_tint_color;
uniform float u_tint;
uniform float u_hue_spread;
uniform float u_logo_tint;
uniform float u_depth;
uniform float u_depth_reach;
uniform vec3 u_back_color;
uniform float u_back_glow;
uniform float u_back_rim;
uniform float u_glow_reach;
uniform float u_time;
uniform float u_logo_y;
uniform float u_zoom;
uniform float u_cover;
uniform vec3 u_page_color;
uniform float u_sheen;
uniform float u_sheen_scale;
uniform float u_sheen_angle;
uniform float u_sheen_warp;
uniform float u_sheen_detail;
uniform float u_sheen_glint;
uniform float u_sheen_base;
uniform float u_sheen_edge;
uniform float u_vig_width;
uniform vec4 u_text_box;
uniform float u_fade_top;
uniform float u_bottom_fade;
uniform float u_fade_height;
uniform float u_fade_offset;
uniform float u_text_pad;
uniform float u_underlay;
uniform float u_base_mix;
uniform float u_prism;
uniform float u_prism_width;
uniform float u_prism_spread;
uniform float u_prism_side;
uniform float u_vig_dim;
uniform float u_text_round;
uniform float u_text_jitter;
uniform float u_shadow_strength;
uniform float u_shadow_height;
uniform float u_shadow_soft;
uniform float u_vig_cells;
uniform float u_vig_cut;
uniform float u_vig_jitter;
uniform float u_vig_height;
uniform float u_vig_soft;
uniform float u_vig_top;
uniform float u_vig_bottom;
uniform float u_light_x;
uniform float u_light_y;
uniform float u_light_z;
uniform float u_diffuse;
uniform float u_specular;
uniform float u_spec_size;
uniform float u_shadow;
uniform float u_edge_light;
uniform float u_falloff;
uniform float u_falloff_reach;
uniform float u_add_glow;
uniform float u_add_catch;
uniform float u_add_tone;
uniform float u_fresnel;
uniform float u_highlight;
uniform float u_fresnel_power;
uniform float u_rim;
uniform float u_warp;
uniform float u_camera;
uniform float u_view_x;
uniform float u_view_y;
uniform float u_focus_x;
uniform float u_focus_y;
uniform float u_logo_size;
uniform float u_threshold;
uniform float u_cut;
uniform float u_row;
uniform float u_row_var;
uniform float u_brick;
uniform float u_brick_var;
uniform float u_break;
uniform float u_break_freq;
uniform float u_break_var;
uniform float u_hug;
uniform float u_hug_len;
uniform float u_hug_jitter;
uniform float u_solid_logo;
uniform float u_fine;
uniform float u_fine_near;
uniform float u_fine_chance;

${TRAIL_GLSL}
const float TAU = 6.28318530718;
const float BAKE_EDGE_MAX = ${BAKE_EDGE_MAX}.0;
const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);

float hash1(vec2 p) {
  p += u_seed;
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

vec2 hash2(vec2 p) {
  p += u_seed;
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash1(i), hash1(i + vec2(1.0, 0.0)), u.x),
    mix(hash1(i + vec2(0.0, 1.0)), hash1(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

vec3 gmin(vec3 a, vec3 b) {
  return a.x < b.x ? a : b;
}

vec3 gsmin(vec3 a, vec3 b, float k) {
  if (k <= 0.0) {
    return gmin(a, b);
  }
  float h = clamp(0.5 + 0.5 * (b.x - a.x) / k, 0.0, 1.0);
  return vec3(mix(b.x, a.x, h) - k * h * (1.0 - h), mix(b.yz, a.yz, h));
}

vec3 noiseGrad(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  vec2 du = 6.0 * f * (1.0 - f);
  float a = hash1(i);
  float b = hash1(i + vec2(1.0, 0.0));
  float c = hash1(i + vec2(0.0, 1.0));
  float d = hash1(i + vec2(1.0, 1.0));
  float k = a - b - c + d;
  return vec3(a + (b - a) * u.x + (c - a) * u.y + k * u.x * u.y, du * vec2(b - a + k * u.y, c - a + k * u.x));
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += valueNoise(p) * amplitude;
    p = p * 2.03 + 17.0;
    amplitude *= 0.5;
  }
  return value;
}

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

vec2 seedOffset(vec2 cell, float jitter) {
  return 0.5 + (hash2(cell) - 0.5) * jitter;
}

vec2 logoCenter() {
  return vec2(u_focus_x, u_focus_y + u_logo_size * u_logo_y);
}

float smax(float a, float b, float k) {
  if (k <= 0.0) {
    return max(a, b);
  }
  float h = max(k - abs(a - b), 0.0) / k;
  return max(a, b) + h * h * k * 0.25;
}

float symbolSdf(vec2 m, out float piece) {
  float k = 2.0 * u_corner;
  float head = length(m) - 20.0;
  float annulus = abs(length(m) - 50.0) - 14.0;
  float u = (m.x + m.y) * 0.70710678;
  float v = (m.x - m.y) * 0.70710678;
  float arc = smax(annulus, u + 0.5 * u_gap, k);
  float smile = smax(smax(annulus, 0.5 * u_gap - u, k), v + 0.5 * u_gap, k);
  piece = head < min(arc, smile) ? 0.0 : (arc < smile ? 1.0 : 2.0);
  return min(head, min(arc, smile));
}

float logoPiece(vec2 p) {
  vec2 m = (p - logoCenter()) / (u_logo_size / 128.0);
  if (u_symbol > 0.5) {
    float piece;
    symbolSdf(m, piece);
    return piece;
  }
  return length(m) < 64.0 - u_stroke - 0.5 * u_gap ? 0.0 : 1.0;
}

float logoSdf(vec2 p) {
  float unit = u_logo_size / 128.0;
  vec2 m = (p - logoCenter()) / unit;
  if (u_symbol > 0.5) {
    float piece;
    return symbolSdf(m, piece) * unit;
  }
  float halfGap = 0.5 * u_gap;
  float head = length(m) - (64.0 - u_stroke - u_gap);
  float annulus = abs(length(m) - (64.0 - 0.5 * u_stroke)) - 0.5 * u_stroke;
  float slit = abs(dot(m, vec2(0.70710678))) - halfGap;
  vec2 q = vec2(m.x, abs(m.y));
  float opening = dot(q, vec2(0.70710678)) > 0.0 ? dot(q, vec2(-0.70710678, 0.70710678)) : length(q);
  float k = 2.0 * u_corner;
  float ring = smax(smax(annulus, -slit, k), halfGap - opening, k);
  return min(head, ring) * unit;
}

bool validSeed(vec2 seedPx) {
  return u_hug <= 0.0 || abs(logoSdf(seedPx)) >= u_hug;
}

float logoAt(vec2 p) {
  return 1.0 - smoothstep(-0.5, 0.5, logoSdf(p));
}

vec2 logoNormal(vec2 p) {
  float e = 1.0;
  vec2 g = vec2(logoSdf(p + vec2(e, 0.0)) - logoSdf(p - vec2(e, 0.0)), logoSdf(p + vec2(0.0, e)) - logoSdf(p - vec2(0.0, e)));
  return g / max(length(g), 0.00001);
}

vec3 worldAt(vec2 q) {
  float sd = logoSdf(q);
  vec2 n = logoNormal(q);
  float h;
  float dh;
  if (sd < 0.0) {
    float edgeWidth = max(u_edge_width, 0.001);
    float domeReach = max(u_dome_reach, 0.001);
    float b = clamp(-sd / edgeWidth, 0.0, 1.0);
    float s = clamp(-sd / domeReach, 0.0, 1.0);
    float rise = u_edge_height + u_lift;
    h = rise * b * b * (3.0 - 2.0 * b) + u_dome_height * (1.0 - (1.0 - s) * (1.0 - s)) - u_dish_depth;
    dh = -(rise * 6.0 * b * (1.0 - b) / edgeWidth + u_dome_height * 2.0 * (1.0 - s) / domeReach);
  } else {
    float dishReach = max(u_dish_reach, 0.001);
    float s = clamp(sd / dishReach, 0.0, 1.0);
    h = -u_dish_depth * (1.0 - s) * (1.0 - s);
    dh = 2.0 * u_dish_depth * (1.0 - s) / dishReach;
  }
  return vec3(h, dh * n);
}

float worldHeight(vec2 q) {
  float sd = logoSdf(q);
  if (sd < 0.0) {
    float b = clamp(-sd / max(u_edge_width, 0.001), 0.0, 1.0);
    float s = clamp(-sd / max(u_dome_reach, 0.001), 0.0, 1.0);
    return (u_edge_height + u_lift) * b * b * (3.0 - 2.0 * b) + u_dome_height * (1.0 - (1.0 - s) * (1.0 - s)) - u_dish_depth;
  }
  float s = clamp(sd / max(u_dish_reach, 0.001), 0.0, 1.0);
  return -u_dish_depth * (1.0 - s) * (1.0 - s);
}

vec2 unwarp(vec2 screen) {
  vec2 center = logoCenter();
  vec2 q = screen;
  for (int k = 0; k < 5; k++) {
    float h = worldHeight(q) * u_warp;
    q = center + (screen - vec2(u_view_x, u_view_y) * h - center) * (1.0 - h / max(u_camera, 1.0));
  }
  return q;
}

vec3 encodeNormal(vec3 n) {
  return vec3(n.x, -n.y, n.z) * 0.5 + 0.5;
}

float coverage(vec2 seedPx, float size) {
  float r = 0.45 * size;
  float total = logoAt(seedPx);
  for (int k = 0; k < 8; k++) {
    float a = float(k) * 0.785398;
    total += logoAt(seedPx + vec2(cos(a), sin(a)) * r);
  }
  return total / 9.0;
}

bool insideCell(vec2 cellId, vec2 seedPx) {
  vec2 offset = seedPx - logoCenter();
  vec2 around = normalize(offset + 0.0001) * u_break_freq;
  float wobble = valueNoise(around + 11.0) * (1.0 - u_break_var) + hash1(cellId + 29.0) * u_break_var;
  return length(offset) < 0.5 * u_logo_size + u_break * wobble;
}

void voronoi(vec2 x, out vec2 cellId, out vec2 seed, out vec3 edge, out vec3 boundary, out bool inside) {
  vec2 n = floor(x);
  vec2 f = fract(x);
  vec2 mg = vec2(0.0);
  vec2 mr = vec2(0.0);
  float md = 8.0;
  for (int j = -2; j <= 2; j++) {
    for (int i = -2; i <= 2; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 r = g + seedOffset(n + g, u_jitter) - f;
      if (!validSeed((x + r) * u_cell)) {
        continue;
      }
      float d = dot(r, r);
      if (d < md) {
        md = d;
        mr = r;
        mg = g;
      }
    }
  }
  cellId = n + mg;
  seed = x + mr;
  inside = insideCell(cellId, seed * u_cell);
  edge = vec3(8.0, 0.0, 0.0);
  boundary = vec3(8.0, 0.0, 0.0);
  float k = u_round / u_cell;
  for (int j = -3; j <= 3; j++) {
    for (int i = -3; i <= 3; i++) {
      vec2 g = mg + vec2(float(i), float(j));
      vec2 r = g + seedOffset(n + g, u_jitter) - f;
      vec2 delta = r - mr;
      if (dot(delta, delta) > 0.00001 && validSeed((x + r) * u_cell)) {
        bool other = insideCell(n + g, (x + r) * u_cell);
        vec2 dir = normalize(delta);
        vec3 d = vec3(dot(0.5 * (mr + r), dir), -dir);
        if (inside || other) {
          edge = gsmin(edge, d, k);
        }
        if (inside != other) {
          boundary = gsmin(boundary, d, k);
        }
      }
    }
  }
  edge.x *= u_cell;
  boundary.x *= u_cell;
}

vec3 voronoiPlain(vec2 x, float size, float jitter, vec2 shift, bool skipBand, out vec2 cellId, out vec2 seed) {
  vec2 n = floor(x);
  vec2 f = fract(x);
  vec2 mg = vec2(0.0);
  vec2 mr = vec2(0.0);
  float md = 8.0;
  for (int j = -2; j <= 2; j++) {
    for (int i = -2; i <= 2; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 r = g + seedOffset(n + g, jitter) - f;
      if (skipBand && !validSeed((x + r - shift) * size)) {
        continue;
      }
      float d = dot(r, r);
      if (d < md) {
        md = d;
        mr = r;
        mg = g;
      }
    }
  }
  cellId = n + mg;
  seed = x + mr;
  vec3 edge = vec3(8.0, 0.0, 0.0);
  float k = u_round / size;
  for (int j = -3; j <= 3; j++) {
    for (int i = -3; i <= 3; i++) {
      vec2 g = mg + vec2(float(i), float(j));
      vec2 r = g + seedOffset(n + g, jitter) - f;
      vec2 delta = r - mr;
      if (dot(delta, delta) > 0.00001 && (!skipBand || validSeed((x + r - shift) * size))) {
        vec2 dir = normalize(delta);
        edge = gsmin(edge, vec3(dot(0.5 * (mr + r), dir), -dir), k);
      }
    }
  }
  edge.x *= size;
  return edge;
}

float tileToneT(vec2 id, vec2 anchor) {
  float flow = valueNoise(anchor / u_flow_scale + 91.0);
  return clamp(mix(0.5, flow, u_flow) + (hash1(id + 13.0) - 0.5) * u_tone, 0.0, 1.0);
}

vec3 tileTone(vec2 id, vec2 anchor, vec3 low, vec3 high) {
  return mix(low, high, tileToneT(id, anchor));
}

vec3 roundedEdge(vec3 along, vec3 across) {
  vec3 e = gmin(along, across);
  vec2 v = max(vec2(u_round) - vec2(along.x, across.x), 0.0);
  float lv = length(v);
  if (lv > 0.0) {
    e = gmin(e, vec3(u_round - lv, (v.x * along.yz + v.y * across.yz) / lv));
  }
  return e;
}

float brickBoundary(float i, float ring, float count) {
  return i + (hash1(vec2(mod(i, count), ring) + 41.0) - 0.5) * u_brick_var;
}

float vignetteAt(vec2 screen) {
  vec2 fromCenter = (screen - logoCenter()) / (u_logo_size * u_zoom * vec2(max(u_vig_width, 0.01), max(u_vig_height, 0.01)));
  float vignette = 1.0 - smoothstep(1.0 - clamp(u_vig_soft, 0.0, 1.0), 1.0, length(fromCenter));
  if (u_vig_top > 0.0) {
    vignette *= smoothstep(0.0, u_vig_top, screen.y);
  }
  if (u_vig_bottom > 0.0) {
    vignette *= smoothstep(0.0, u_vig_bottom, u_resolution.y - screen.y);
  }
  return vignette;
}

void tileAt(vec2 p, out vec3 e, out vec2 tileId, out vec2 anchor, out float logoAmount, out vec3 color) {
  vec2 center = logoCenter();
  float radius = 0.5 * u_logo_size;
  vec2 offset = p - center;
  float r = length(offset);

  anchor = p;
  logoAmount = 0.0;

  vec2 cellId;
  vec2 seed;
  vec3 edge;
  vec3 boundary;
  bool inside;
  voronoi(p / u_cell, cellId, seed, edge, boundary, inside);
  bool solid = u_solid_logo > 0.5;
  float solidSd = solid ? logoSdf(p) : 1.0;

  if (solid && solidSd < 0.0) {
    e = vec3(-solidSd, -logoNormal(p));
    tileId = vec2(1.0 + logoPiece(p), 9000.0);
    anchor = center;
    logoAmount = u_logo_mix;
    color = mix(tileTone(tileId, anchor, u_tile_low, u_tile_high), tileTone(tileId, anchor, u_logo_low, u_logo_high), logoAmount);
  } else if (!solid && inside) {
    float sd = logoSdf(p);
    vec2 normal = logoNormal(p);
    float sideSign = sd < 0.0 ? -1.0 : 1.0;
    float isLogo;
    if (u_hug > 0.0 && abs(sd) < u_hug) {
      float side = step(sd, 0.0);
      vec2 onContour = p - sd * normal;
      vec2 rowId;
      vec2 rowSeed;
      vec3 row = voronoiPlain(onContour / u_hug_len + side * vec2(17.3, 5.1), u_hug_len, u_hug_jitter, vec2(0.0), false, rowId, rowSeed);
      row.yz -= dot(row.yz, normal) * normal;
      vec3 across = gmin(vec3(abs(sd), sideSign * normal), vec3(u_hug - abs(sd), -sideSign * normal));
      e = gsmin(roundedEdge(row, across), boundary, u_round);
      tileId = rowId + side * 1000.0 + 2000.0;
      anchor = (rowSeed - side * vec2(17.3, 5.1)) * u_hug_len;
      isLogo = side;
    } else {
      float size = u_cell;
      vec2 id = cellId;
      vec2 seedPx = seed * u_cell;
      e = edge;
      bool split = abs(logoSdf(seedPx)) - u_hug < u_fine_near || hash1(cellId + 71.0) < u_fine_chance;
      if (split && u_fine < 1.0) {
        size = u_cell * u_fine;
        vec2 fineSeed;
        vec3 fine = voronoiPlain(p / size + 31.7, size, u_jitter, vec2(31.7), true, id, fineSeed);
        seedPx = (fineSeed - 31.7) * size;
        e = gsmin(e, fine, u_round);
        id += cellId * 0.013 + 5000.0;
      }
      tileId = id;
      anchor = seedPx;
      if (u_hug > 0.0) {
        e = gsmin(e, vec3(abs(sd) - u_hug, sideSign * normal), u_round);
        isLogo = step(sd, 0.0);
        tileId += isLogo * 0.37;
      } else {
        float cover = coverage(seedPx, size);
        isLogo = step(u_threshold, cover);
        if (cover > u_cut && cover < 1.0 - u_cut) {
          isLogo = step(sd, 0.0);
          e = gmin(e, vec3(abs(sd), sideSign * normal));
          tileId += isLogo * 0.37;
        }
      }
    }
    vec3 tile = tileTone(tileId, anchor, u_tile_low, u_tile_high);
    vec3 logoTile = tileTone(tileId, anchor, u_logo_low, u_logo_high);
    logoAmount = isLogo * u_logo_mix;
    color = mix(tile, logoTile, logoAmount);
  } else {
    float inner = radius;
    float ring = 0.0;
    float width = u_row;
    if (r < radius) {
      for (int k = 0; k < 96; k++) {
        ring -= 1.0;
        width = u_row * (1.0 + (hash1(vec2(ring, 7.0)) - 0.5) * u_row_var);
        inner -= width;
        if (r >= inner) {
          break;
        }
      }
    } else {
      for (int k = 0; k < 96; k++) {
        width = u_row * (1.0 + (hash1(vec2(ring, 7.0)) - 0.5) * u_row_var);
        if (r < inner + width) {
          break;
        }
        inner += width;
        ring += 1.0;
      }
    }
    float outer = inner + width;
    float count = max(3.0, floor(TAU * (inner + 0.5 * width) / u_brick + 0.5));
    float t = (atan(offset.y, offset.x) / TAU + 0.5) * count + hash1(vec2(ring, 13.0));
    float i = floor(t);
    float lo = brickBoundary(i, ring, count);
    float hi = brickBoundary(i + 1.0, ring, count);
    if (t < lo) {
      i -= 1.0;
      hi = lo;
      lo = brickBoundary(i, ring, count);
    } else if (t >= hi) {
      i += 1.0;
      lo = hi;
      hi = brickBoundary(i + 1.0, ring, count);
    }
    float pxPerUnit = TAU * r / count;
    vec2 radial = offset / max(r, 0.0001);
    vec2 tangent = vec2(-radial.y, radial.x);
    vec3 along = gmin(vec3((t - lo) * pxPerUnit, tangent), vec3((hi - t) * pxPerUnit, -tangent));
    vec3 across = gmin(vec3(r - inner, radial), vec3(outer - r, -radial));
    e = solid ? gsmin(roundedEdge(along, across), vec3(solidSd, logoNormal(p)), u_round) : gsmin(roundedEdge(along, across), boundary, u_round);
    tileId = vec2(mod(i, count), ring) + 500.0;
    float angle = ((0.5 * (lo + hi) - hash1(vec2(ring, 13.0))) / count - 0.5) * TAU;
    anchor = center + vec2(cos(angle), sin(angle)) * (inner + 0.5 * width);
    color = tileTone(tileId, anchor, u_tile_low, u_tile_high);
  }

}

vec2 toPattern(vec2 screen) {
  return unwarp(logoCenter() + (screen - logoCenter()) / max(u_zoom, 0.05));
}

float roundedBox(vec2 point, vec4 box, float radius) {
  vec2 middle = 0.5 * (box.xy + box.zw);
  vec2 half_ = 0.5 * (box.zw - box.xy);
  vec2 q = abs(point - middle) - half_ + radius;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}

float tileVisibility(vec2 screen, vec2 anchor, vec2 tileId) {
  vec2 anchorScreen = logoCenter() + (anchor - logoCenter()) * u_zoom;
  float threshold = clamp(u_vig_cut + (hash1(tileId + 151.0) - 0.5) * u_vig_jitter, 0.0, 1.0);
  float keep = step(threshold, vignetteAt(anchorScreen));
  if (u_text_box.z > u_text_box.x) {
    float clearance = u_text_pad + (hash1(tileId + 167.0) - 0.5) * u_text_jitter;
    keep *= step(clearance, roundedBox(anchorScreen, u_text_box, u_text_round));
  }
  return mix(vignetteAt(screen), keep, u_vig_cells);
}

float occluderAt(vec2 screen) {
  vec3 e;
  vec2 tileId;
  vec2 anchor;
  float logoAmount;
  vec3 color;
  tileAt(toPattern(screen), e, tileId, anchor, logoAmount, color);
  float groutHalf = 0.5 * u_grout * (1.0 + (hash1(tileId + 61.0) - 0.5) * u_grout_var);
  float soft = max(u_shadow_soft, 0.5);
  return smoothstep(groutHalf - 0.5, groutHalf + soft, e.x) * clamp(tileVisibility(screen, anchor, tileId) * u_cover, 0.0, 1.0);
}

void main() {
  vec2 p = toPattern(fragCoord);
  vec3 color;
  vec3 e;
  vec2 tileId;
  vec2 anchor;
  float logoAmount;
  tileAt(p, e, tileId, anchor, logoAmount, color);

  float groutHalf = 0.5 * u_grout * (1.0 + (hash1(tileId + 61.0) - 0.5) * u_grout_var);
  float tileMask = smoothstep(groutHalf - 0.5, groutHalf + 0.5, e.x);

  float bevelWidth = max(u_bevel_width, 0.001);
  float u = clamp((e.x - groutHalf) / bevelWidth, 0.0, 1.0);
  float power = 1.0 + 3.0 * u_bevel_shape;
  float height = 1.0 - pow(1.0 - u, power);
  float slope = u > 0.0 && u < 1.0 ? power * pow(1.0 - u, power - 1.0) / bevelWidth : 0.0;
  vec2 bevelGrad = e.yz * slope * u_bevel_height;

  float scale = max(u_clay_scale, 1.0);
  vec2 shift = hash2(tileId + 83.0) * 37.0;
  vec3 broad = noiseGrad(p / scale + shift);
  vec3 detail = noiseGrad(p / (0.5 * scale) + shift.yx);
  float wobble = (broad.x - 0.5) + 0.5 * (detail.x - 0.5);
  vec2 wobbleGrad = broad.yz / scale + detail.yz / scale;
  vec2 tilt = (hash2(tileId + 97.0) - 0.5) * 2.0 * u_clay_tilt;
  float thickness = (hash1(tileId + 101.0) - 0.5) * u_clay_thickness;
  float clayHeight = wobble * u_clay_wobble + dot(tilt, p - anchor) + thickness;
  vec2 clayGrad = wobbleGrad * u_clay_wobble + tilt;

  vec3 tileNormal = normalize(vec3(-(bevelGrad + clayGrad), 1.0));
  float tileHeight = height * (u_bevel_height + clayHeight);

  bool brickInLogo = abs(tileId.y - 9000.0) > 0.5 && logoSdf(anchor) < 0.0;
  vec3 world = mix(worldAt(p), brickInLogo ? vec3(0.0) : worldAt(anchor), u_rigid);
  vec3 worldNormal = normalize(vec3(-world.yz, 1.0));
  vec3 base = worldNormal + vec3(0.0, 0.0, 1.0);
  vec3 local = tileNormal * vec3(-1.0, -1.0, 1.0);
  vec3 surface = normalize(base * dot(base, local) / base.z - local);

  float purpleAmount = u_tint * mix(1.0, hash1(tileId + 131.0), u_hue_spread) + u_logo_tint * logoAmount;
  vec3 tint = mix(vec3(1.0), u_logo_tint_color, purpleAmount);
  vec3 tinted = mix(color, u_page_color, u_base_mix) * tint;
  float thick = smoothstep(0.0, max(u_depth_reach, 0.001), e.x - groutHalf) * (0.85 + 0.15 * clamp(wobble + 0.5, 0.0, 1.0));
  vec3 deep = tinted * tint * 0.78;
  vec3 thin = mix(tinted, vec3(dot(tinted, LUMA)), 0.5) * 1.35;
  vec3 albedo = mix(tinted, mix(thin, deep, thick), u_depth);
  vec3 lightPos = vec3(u_light_x * u_resolution.x, -u_light_y, u_light_z);
  vec3 toLight = normalize(lightPos - vec3(fragCoord, 0.0));
  vec3 toEye = normalize(vec3(logoCenter() - fragCoord, max(u_camera, 1.0)));
  float flatLight = max(toLight.z, 0.0);
  float lit = u_diffuse * (max(dot(surface, toLight), 0.0) - flatLight);
  float shade = 1.0 + (lit < 0.0 ? lit * u_shadow : lit * u_edge_light);
  float falloffT = clamp((length(fragCoord - lightPos.xy) - u_light_y) / max(u_falloff_reach, 1.0), 0.0, 1.0);
  shade *= mix(1.0 + u_falloff, 1.0 - u_falloff, falloffT);
  vec3 halfway = normalize(toLight + toEye);
  float spread = acos(clamp(dot(surface, halfway), -1.0, 1.0)) / max(radians(u_spec_size), 0.001);
  float glint = exp(-spread * spread) * u_specular;
  float facing = clamp(dot(surface, toEye), 0.0, 1.0);
  float fresnel = pow(1.0 - facing, u_fresnel_power) * u_fresnel;
  vec3 reflected = reflect(-toEye, surface);
  float sky = mix(1.0 - u_rim, 1.0, smoothstep(0.0, 0.6, -reflected.y));
  color = albedo * shade + vec3(glint + fresnel * sky) * u_highlight;
  color += vec3(u_add_glow * (1.0 - falloffT) + u_add_catch * (dot(surface, toLight) - toLight.z) * smoothstep(0.6, 0.9, thick) + u_add_tone * (tileToneT(tileId, anchor) - 0.5));

  float near = exp(-max(logoSdf(p), 0.0) / max(u_glow_reach, 1.0));
  float backRim = pow(1.0 - facing, u_fresnel_power) * smoothstep(0.0, 0.6, reflected.y);
  float rimZone = 1.0 - smoothstep(0.0, 3.0 * max(u_bevel_width, 0.5), e.x - groutHalf);
  color += u_back_color * near * (u_back_glow * rimZone + u_back_rim * backRim);

  if (u_prism > 0.0) {
    float across = clamp((e.x - groutHalf) / max(u_prism_width, 0.5), 0.0, 1.0);
    vec2 lightFlat = normalize(toLight.xy + 0.0001);
    float away = clamp(dot(e.yz, lightFlat), 0.0, 1.0);
    float facing = mix(away * away, 1.0, u_prism_side);
    float band = 4.0 * across * (1.0 - across);
    vec3 spectrum = 0.5 + 0.5 * cos(TAU * (across * u_prism_spread + vec3(0.0, 0.33, 0.67)));
    float weight = band * facing * u_prism;
    color += (spectrum - vec3(dot(spectrum, vec3(0.333)))) * weight + spectrum * weight * 0.25;
  }

  if (u_view == 7) {
    color = albedo;
  } else if (u_view == 1) {
    color = encodeNormal(surface);
  } else if (u_view == 2) {
    color = encodeNormal(normalize(vec3(-bevelGrad, 1.0)));
  } else if (u_view == 3) {
    color = encodeNormal(normalize(vec3(-clayGrad * 8.0, 1.0)));
  } else if (u_view == 4) {
    color = encodeNormal(worldNormal);
  } else if (u_view == 5) {
    color = vec3(clamp(tileHeight / max(u_bevel_height + u_clay_wobble + u_clay_thickness, 0.001), 0.0, 1.0));
  } else if (u_view == 6) {
    float range = max(u_edge_height + u_lift + u_dome_height, u_dish_depth) + 0.001;
    color = vec3(clamp(0.5 + 0.5 * world.x / range, 0.0, 1.0));
  }
  float reveal = u_sheen > 0.0 ? trailReveal(fragCoord) : 0.0;
  if (reveal > 0.0 && u_view == 0) {
    vec2 bend = mix(worldNormal.xy, surface.xy, u_sheen_detail);
    vec2 uv = (fragCoord + bend * u_sheen_warp) / max(u_sheen_scale, 1.0);
    vec2 drift = vec2(fbm(uv * 0.7 + u_time * 0.04), fbm(uv * 0.7 + 5.2 - u_time * 0.03));
    float hue = fbm(uv * 1.1 + drift * 1.5 + u_time * 0.03) * 2.4 + dot(uv, vec2(0.4, 0.3)) + reveal * 0.25 + dot(bend, vec2(0.6, 0.4)) * u_sheen_angle;
    vec3 film = 0.5 + 0.5 * cos(TAU * (hue + vec3(0.0, 0.33, 0.67)));
    film = mix(film, vec3(dot(film, vec3(0.333))), 0.2);
    vec3 toTrail = normalize(vec3(trailLight(fragCoord) - fragCoord, 159.0));
    float trailGlint = pow(max(dot(surface, normalize(toTrail + vec3(0.0, 0.0, 1.0))), 0.0), 88.0);
    float band = (1.0 - thick) * (1.0 - thick);
    float amount = reveal * u_sheen * (u_sheen_base + u_sheen_edge * band + 0.24 * trailGlint);
    color += film * amount + vec3(trailGlint * reveal * u_sheen_glint);
  }

  float vignette = tileVisibility(fragCoord, anchor, tileId);
  float fadeEnd = u_fade_top + u_fade_offset;
  float bottomFade = 1.0 - u_bottom_fade * smoothstep(fadeEnd - max(u_fade_height, 1.0), fadeEnd, fragCoord.y);
  float alpha = tileMask * clamp(vignette * u_cover, 0.0, 1.0) * bottomFade;
  vec3 faded = mix(u_page_color, color, vignette);
  faded = mix(faded, u_page_color, (1.0 - vignetteAt(fragCoord)) * u_vig_dim * u_vig_cells);
  float under = tileMask * clamp(vignetteAt(fragCoord) * u_cover, 0.0, 1.0) * u_underlay;
  vec3 back = u_page_color * under;
  float backAlpha = under;
  if (u_shadow_strength > 0.0 && alpha < 1.0 && u_view == 0) {
    vec3 toSun = normalize(vec3(u_light_x * u_resolution.x, -u_light_y, u_light_z) - vec3(fragCoord, 0.0));
    vec2 reach = toSun.xy / max(toSun.z, 0.05) * u_shadow_height;
    float shadow = occluderAt(fragCoord + reach) * u_shadow_strength;
    back *= 1.0 - shadow;
    backAlpha = (shadow + backAlpha * (1.0 - shadow)) * bottomFade;
  }
  outColor = vec4(faded * alpha + back * (1.0 - alpha), alpha + backAlpha * (1.0 - alpha));
  float covered = step(0.0001, alpha);
  if (u_bake == 1) {
    outColor = vec4(1.0, 1.0, 1.0, alpha);
  } else if (u_bake == 3) {
    float skeletonEdge = groutHalf + 0.5 * u_skeleton_grout;
    float skeleton = smoothstep(skeletonEdge - 0.5, skeletonEdge + 0.5, e.x) * clamp(vignette * u_cover, 0.0, 1.0) * bottomFade;
    outColor = vec4(1.0, 1.0, 1.0, skeleton);
  } else if (u_bake == 2) {
    float edgeDistance = clamp((e.x - groutHalf) / BAKE_EDGE_MAX, 0.0, 1.0);
    float packedTone = (floor(tileToneT(tileId, anchor) * 110.0 + 0.5) + step(0.5, logoAmount) * 145.0) / 255.0;
    outColor = mix(vec4(0.5, 0.5, 0.0, 1.0), vec4(surface.xy * 0.5 + 0.5, packedTone, 0.5 + 0.5 * edgeDistance), covered);
  }
}
`;

export type Settings = {
  view: number;
  bevelWidth: number;
  bevelShape: number;
  bevelHeight: number;
  clayTilt: number;
  clayThickness: number;
  clayWobble: number;
  clayScale: number;
  domeHeight: number;
  domeReach: number;
  edgeHeight: number;
  edgeWidth: number;
  dishDepth: number;
  dishReach: number;
  rigid: number;
  lift: number;
  tint: number;
  hueSpread: number;
  logoTint: number;
  depth: number;
  depthReach: number;
  backGlow: number;
  backRim: number;
  glowReach: number;
  vigWidth: number;
  textClear: number;
  textPad: number;
  bottomFade: number;
  fadeHeight: number;
  fadeOffset: number;
  underlay: number;
  skeletonGrout: number;
  lmBase: number;
  dmBase: number;
  prism: number;
  prismWidth: number;
  prismSpread: number;
  prismSide: number;
  vigDim: number;
  textRound: number;
  textJitter: number;
  shadowStrength: number;
  dmShadow: number;
  shadowHeight: number;
  shadowSoft: number;
  vigCells: number;
  vigCut: number;
  vigJitter: number;
  logoY: number;
  zoom: number;
  cover: number;
  sheen: number;
  sheenScale: number;
  sheenAngle: number;
  sheenWarp: number;
  sheenDetail: number;
  sheenGlint: number;
  sheenBase: number;
  sheenEdge: number;
  vigHeight: number;
  vigSoft: number;
  vigTop: number;
  vigBottom: number;
  lightX: number;
  follow: number;
  lightY: number;
  lightZ: number;
  diffuse: number;
  specular: number;
  specSize: number;
  lmShadow: number;
  lmDepth: number;
  dmEdge: number;
  dmPrism: number;
  dmFalloff: number;
  dmGlow: number;
  dmCatch: number;
  dmTone: number;
  lmFalloff: number;
  falloffReach: number;
  fresnel: number;
  fresnelPower: number;
  highlight: number;
  rim: number;
  warp: number;
  camera: number;
  viewX: number;
  viewY: number;
  mark: number;
  logoSize: number;
  threshold: number;
  cut: number;
  cell: number;
  jitter: number;
  row: number;
  rowVar: number;
  brick: number;
  brickVar: number;
  breakOut: number;
  breakFreq: number;
  breakVar: number;
  hug: number;
  hugLen: number;
  hugJitter: number;
  solidLogo: number;
  fine: number;
  fineNear: number;
  fineChance: number;
  grout: number;
  groutVar: number;
  logoMix: number;
  flow: number;
  flowScale: number;
  tone: number;
  round: number;
  seed: number;
};

const DEFAULTS: Settings = {
  view: 0,
  bevelWidth: 3,
  bevelShape: 1,
  bevelHeight: 1.7,
  clayTilt: 0.02,
  clayThickness: 1.1,
  clayWobble: 0,
  clayScale: 74,
  domeHeight: 0,
  domeReach: 30,
  edgeHeight: 5,
  edgeWidth: 1,
  dishDepth: 0,
  dishReach: 130,
  rigid: 1,
  lift: 3.5,
  tint: 0,
  hueSpread: 0.77,
  logoTint: 0,
  depth: 1.5,
  depthReach: 4.5,
  backGlow: 0.02,
  backRim: 0,
  glowReach: 800,
  vigWidth: 1.14,
  textClear: 1,
  textPad: 24,
  bottomFade: 0.8,
  fadeHeight: 160,
  fadeOffset: 120,
  underlay: 0,
  skeletonGrout: 4,
  lmBase: 0.3,
  dmBase: 0.33,
  prism: 0.13,
  prismWidth: 9.5,
  prismSpread: 1.78,
  prismSide: 0,
  vigDim: 0,
  textRound: 47,
  textJitter: 16,
  shadowStrength: 0.22,
  dmShadow: 3.8,
  shadowHeight: 3,
  shadowSoft: 24,
  vigCells: 1,
  vigCut: 1,
  vigJitter: 0,
  logoY: -0.025,
  zoom: 0.74,
  cover: 4,
  sheen: 0.07,
  sheenScale: 530,
  sheenAngle: 0,
  sheenWarp: 300,
  sheenDetail: 1,
  sheenGlint: 0,
  sheenBase: 1.5,
  sheenEdge: 3,
  vigHeight: 1.1,
  vigSoft: 0.1,
  vigTop: 245,
  vigBottom: 290,
  lightX: 0.5,
  follow: 0,
  lightY: 520,
  lightZ: 510,
  diffuse: 1.23,
  specular: 1.44,
  specSize: 40,
  lmShadow: 0.08,
  lmDepth: 0.02,
  dmEdge: 0.5,
  dmPrism: 0.7,
  dmFalloff: 0.35,
  dmGlow: 0.08,
  dmCatch: 1.5,
  dmTone: 0.05,
  lmFalloff: 0,
  falloffReach: 520,
  fresnel: 0.87,
  fresnelPower: 2.5,
  highlight: 0.03,
  rim: 0.35,
  warp: 9.8,
  camera: 4000,
  viewX: 0,
  viewY: 0.03,
  mark: 3,
  logoSize: 610,
  threshold: 0.42,
  cut: 0.12,
  cell: 82,
  jitter: 0,
  row: 43,
  rowVar: 0,
  brick: 240,
  brickVar: 0.9,
  breakOut: 0,
  breakFreq: 1.5,
  breakVar: 0,
  hug: 0,
  hugLen: 120,
  hugJitter: 1,
  solidLogo: 1,
  fine: 0.46,
  fineNear: 71,
  fineChance: 0.7,
  grout: 7.1,
  groutVar: 0,
  logoMix: 0,
  flow: 0,
  flowScale: 40,
  tone: 0.28,
  round: 16,
  seed: 35,
};
const MOBILE_QUERY = '(max-width: 639px)';

function subscribeMobile(listener: () => void) {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
}

function readTarget() {
  return window.matchMedia(MOBILE_QUERY).matches ? ('mobile' as const) : ('desktop' as const);
}

export const MOBILE_DEFAULTS: Settings = {
  view: 0,
  bevelWidth: 3,
  bevelShape: 1,
  bevelHeight: 1.7,
  clayTilt: 0.04,
  clayThickness: 1.1,
  clayWobble: 0,
  clayScale: 46.3,
  domeHeight: 0,
  domeReach: 30,
  edgeHeight: 5,
  edgeWidth: 1,
  dishDepth: 0,
  dishReach: 130,
  rigid: 1,
  lift: 3.5,
  tint: 0,
  hueSpread: 0.77,
  logoTint: 0,
  depth: 1.5,
  depthReach: 4.5,
  backGlow: 0.02,
  backRim: 0,
  glowReach: 500,
  vigWidth: 0.98,
  textClear: 1,
  textPad: 15,
  bottomFade: 0.8,
  fadeHeight: 100,
  fadeOffset: 75,
  underlay: 0,
  skeletonGrout: 2.5,
  lmBase: 0.3,
  dmBase: 0.33,
  prism: 0.13,
  prismWidth: 9.5,
  prismSpread: 1.78,
  prismSide: 0,
  vigDim: 0,
  textRound: 29.4,
  textJitter: 10,
  shadowStrength: 0.22,
  dmShadow: 3.8,
  shadowHeight: 3,
  shadowSoft: 24,
  vigCells: 1,
  vigCut: 1,
  vigJitter: 0.02,
  logoY: 0.025,
  zoom: 0.67,
  cover: 2.9,
  sheen: 0.07,
  sheenScale: 530,
  sheenAngle: 0,
  sheenWarp: 300,
  sheenDetail: 1,
  sheenGlint: 0,
  sheenBase: 1.5,
  sheenEdge: 3,
  vigHeight: 0.75,
  vigSoft: 0.23,
  vigTop: 200,
  vigBottom: 0,
  lightX: 0.5,
  follow: 0,
  lightY: 325,
  lightZ: 318.8,
  diffuse: 1.23,
  specular: 1.44,
  specSize: 40,
  lmShadow: 0.16,
  lmDepth: 0.02,
  dmEdge: 0.5,
  dmPrism: 0.7,
  dmFalloff: 0.35,
  dmGlow: 0.08,
  dmCatch: 0.75,
  dmTone: 0.03,
  lmFalloff: 0.035,
  falloffReach: 325,
  fresnel: 0.87,
  fresnelPower: 2.5,
  highlight: 0.03,
  rim: 0.35,
  warp: 9.8,
  camera: 2500,
  viewX: 0,
  viewY: 0.03,
  mark: 3,
  logoSize: 320,
  threshold: 0.42,
  cut: 0.12,
  cell: 51.3,
  jitter: 0,
  row: 29,
  rowVar: 0,
  brick: 104,
  brickVar: 0.6,
  breakOut: 0,
  breakFreq: 1.5,
  breakVar: 0,
  hug: 0,
  hugLen: 75,
  hugJitter: 1,
  solidLogo: 1,
  fine: 0.46,
  fineNear: 71,
  fineChance: 0.7,
  grout: 3.9,
  groutVar: 0,
  logoMix: 0,
  flow: 0,
  flowScale: 40,
  tone: 0.6,
  round: 10,
  seed: 35,
};

type SliderKey = Exclude<keyof Settings, 'mark' | 'view'>;
type Slider = { key: SliderKey; min: number; max: number; step: number };

const VIEWS = [
  'Lit',
  'Normals',
  'Bevel normals',
  'Clay normals (8x)',
  'World normals',
  'Tile height',
  'World height',
  'Albedo',
];

const CLAY_SLIDERS: Slider[] = [
  { key: 'clayTilt', min: 0, max: 0.3, step: 0.005 },
  { key: 'clayThickness', min: 0, max: 3, step: 0.05 },
  { key: 'clayWobble', min: 0, max: 12, step: 0.05 },
  { key: 'clayScale', min: 4, max: 120, step: 1 },
];

const GLASS_SLIDERS: Slider[] = [
  { key: 'tint', min: 0, max: 1, step: 0.01 },
  { key: 'hueSpread', min: 0, max: 1, step: 0.01 },
  { key: 'logoTint', min: 0, max: 1, step: 0.01 },
  { key: 'depth', min: 0, max: 1.5, step: 0.01 },
  { key: 'depthReach', min: 1, max: 40, step: 0.5 },
];

const VIGNETTE_SLIDERS: Slider[] = [
  { key: 'zoom', min: 0.4, max: 1.5, step: 0.01 },
  { key: 'cover', min: 1, max: 20, step: 0.1 },
  { key: 'logoY', min: -0.4, max: 0.4, step: 0.005 },
  { key: 'vigCells', min: 0, max: 1, step: 0.01 },
  { key: 'underlay', min: 0, max: 1, step: 0.01 },
  { key: 'vigDim', min: 0, max: 1, step: 0.01 },
  { key: 'vigCut', min: 0, max: 1, step: 0.01 },
  { key: 'vigJitter', min: 0, max: 1, step: 0.01 },
  { key: 'vigWidth', min: 0.2, max: 2, step: 0.01 },
  { key: 'vigHeight', min: 0.2, max: 2, step: 0.01 },
  { key: 'vigSoft', min: 0.05, max: 1, step: 0.01 },
  { key: 'vigTop', min: 0, max: 300, step: 5 },
  { key: 'vigBottom', min: 0, max: 900, step: 5 },
];

const SKELETON_SLIDERS: Slider[] = [{ key: 'skeletonGrout', min: 0, max: 16, step: 0.5 }];

const BASE_SLIDERS: Slider[] = [
  { key: 'lmBase', min: 0, max: 1, step: 0.01 },
  { key: 'dmBase', min: 0, max: 1, step: 0.01 },
];

const PRISM_SLIDERS: Slider[] = [
  { key: 'prism', min: 0, max: 2, step: 0.01 },
  { key: 'prismWidth', min: 0.5, max: 30, step: 0.5 },
  { key: 'prismSpread', min: 0, max: 3, step: 0.01 },
  { key: 'prismSide', min: 0, max: 1, step: 0.01 },
];

const TEXT_SLIDERS: Slider[] = [
  { key: 'textClear', min: 0, max: 1, step: 1 },
  { key: 'textPad', min: -40, max: 160, step: 1 },
  { key: 'bottomFade', min: 0, max: 1, step: 0.01 },
  { key: 'fadeHeight', min: 1, max: 600, step: 1 },
  { key: 'fadeOffset', min: -300, max: 300, step: 1 },
  { key: 'textRound', min: 0, max: 200, step: 1 },
  { key: 'textJitter', min: 0, max: 160, step: 1 },
];

const SHADOW_SLIDERS: Slider[] = [
  { key: 'shadowStrength', min: 0, max: 1, step: 0.01 },
  { key: 'dmShadow', min: 0, max: 6, step: 0.1 },
  { key: 'shadowHeight', min: 0, max: 80, step: 0.5 },
  { key: 'shadowSoft', min: 0.5, max: 30, step: 0.5 },
];

const LIGHT_MODE_SLIDERS: Slider[] = [
  { key: 'dmEdge', min: 0, max: 1, step: 0.01 },
  { key: 'dmPrism', min: 0, max: 1, step: 0.01 },
  { key: 'dmFalloff', min: 0, max: 0.8, step: 0.01 },
  { key: 'dmGlow', min: 0, max: 0.2, step: 0.005 },
  { key: 'dmCatch', min: 0, max: 6, step: 0.05 },
  { key: 'dmTone', min: 0, max: 0.2, step: 0.005 },
  { key: 'lmFalloff', min: 0, max: 0.8, step: 0.01 },
  { key: 'falloffReach', min: 100, max: 2000, step: 10 },
  { key: 'lmShadow', min: 0, max: 1, step: 0.01 },
  { key: 'lmDepth', min: 0, max: 1, step: 0.01 },
];

const SHEEN_SLIDERS: Slider[] = [
  { key: 'sheen', min: 0, max: 2, step: 0.01 },
  { key: 'sheenScale', min: 100, max: 2000, step: 10 },
  { key: 'sheenAngle', min: 0, max: 6, step: 0.05 },
  { key: 'sheenWarp', min: 0, max: 300, step: 1 },
  { key: 'sheenDetail', min: 0, max: 1, step: 0.01 },
  { key: 'sheenGlint', min: 0, max: 2, step: 0.01 },
  { key: 'sheenBase', min: 0, max: 1.5, step: 0.01 },
  { key: 'sheenEdge', min: 0, max: 3, step: 0.01 },
];

const BACKLIGHT_SLIDERS: Slider[] = [
  { key: 'backGlow', min: 0, max: 1, step: 0.01 },
  { key: 'backRim', min: 0, max: 2, step: 0.01 },
  { key: 'glowReach', min: 10, max: 800, step: 5 },
];

const LIGHT_SLIDERS: Slider[] = [
  { key: 'lightX', min: 0, max: 1, step: 0.01 },
  { key: 'follow', min: 0, max: 1, step: 0.01 },
  { key: 'lightY', min: -400, max: 1200, step: 10 },
  { key: 'lightZ', min: 20, max: 2000, step: 10 },
  { key: 'diffuse', min: 0, max: 3, step: 0.01 },
  { key: 'specular', min: 0, max: 3, step: 0.01 },
  { key: 'specSize', min: 0.5, max: 40, step: 0.5 },
  { key: 'fresnel', min: 0, max: 2, step: 0.01 },
  { key: 'fresnelPower', min: 1, max: 10, step: 0.1 },
  { key: 'highlight', min: 0, max: 1, step: 0.01 },
  { key: 'rim', min: 0, max: 1, step: 0.01 },
];

const WORLD_SLIDERS: Slider[] = [
  { key: 'domeHeight', min: 0, max: 80, step: 0.5 },
  { key: 'domeReach', min: 10, max: 300, step: 1 },
  { key: 'edgeHeight', min: 0, max: 40, step: 0.5 },
  { key: 'edgeWidth', min: 1, max: 80, step: 0.5 },
  { key: 'dishDepth', min: 0, max: 80, step: 0.5 },
  { key: 'dishReach', min: 10, max: 600, step: 1 },
  { key: 'lift', min: 0, max: 40, step: 0.5 },
  { key: 'rigid', min: 0, max: 1, step: 0.01 },
  { key: 'warp', min: 0, max: 12, step: 0.1 },
  { key: 'camera', min: 200, max: 4000, step: 10 },
  { key: 'viewX', min: -1, max: 1, step: 0.01 },
  { key: 'viewY', min: -1, max: 1, step: 0.01 },
];

const BEVEL_SLIDERS: Slider[] = [
  { key: 'bevelWidth', min: 0, max: 20, step: 0.5 },
  { key: 'bevelShape', min: 0, max: 1, step: 0.01 },
  { key: 'bevelHeight', min: 0, max: 10, step: 0.1 },
];

const SLIDERS: Slider[] = [
  { key: 'logoSize', min: 120, max: 1200, step: 10 },
  { key: 'threshold', min: 0, max: 1, step: 0.01 },
  { key: 'cut', min: 0, max: 0.5, step: 0.01 },
  { key: 'cell', min: 6, max: 120, step: 1 },
  { key: 'jitter', min: 0, max: 1, step: 0.01 },
  { key: 'row', min: 6, max: 80, step: 1 },
  { key: 'rowVar', min: 0, max: 1, step: 0.01 },
  { key: 'brick', min: 10, max: 240, step: 1 },
  { key: 'brickVar', min: 0, max: 0.9, step: 0.01 },
  { key: 'breakOut', min: 0, max: 200, step: 1 },
  { key: 'breakFreq', min: 0.5, max: 10, step: 0.1 },
  { key: 'breakVar', min: 0, max: 1, step: 0.01 },
  { key: 'hug', min: 0, max: 60, step: 1 },
  { key: 'hugLen', min: 8, max: 120, step: 1 },
  { key: 'hugJitter', min: 0, max: 1, step: 0.01 },
  { key: 'solidLogo', min: 0, max: 1, step: 1 },
  { key: 'fine', min: 0.2, max: 1, step: 0.01 },
  { key: 'fineNear', min: 0, max: 200, step: 1 },
  { key: 'fineChance', min: 0, max: 1, step: 0.01 },
  { key: 'grout', min: 0, max: 10, step: 0.1 },
  { key: 'groutVar', min: 0, max: 1, step: 0.01 },
  { key: 'logoMix', min: 0, max: 1, step: 0.01 },
  { key: 'flow', min: 0, max: 1, step: 0.01 },
  { key: 'flowScale', min: 40, max: 1000, step: 10 },
  { key: 'tone', min: 0, max: 1, step: 0.01 },
  { key: 'round', min: 0, max: 16, step: 0.5 },
  { key: 'seed', min: 0, max: 100, step: 1 },
];

function normalizeTint([r, g, b]: Rgb): Rgb {
  const luma = Math.max(0.2126 * r + 0.7152 * g + 0.0722 * b, 0.001);
  return [r / luma, g / luma, b / luma];
}

function buildUniforms(settings: Settings, focus: Focus, palette: Palette, mode: Mode, textBox: TextBox): Uniforms {
  const light = mode === 'light';
  return {
    u_cell: { type: 'uniform1f', value: settings.cell },
    u_jitter: { type: 'uniform1f', value: settings.jitter },
    u_seed: { type: 'uniform1f', value: settings.seed * 7.31 },
    u_grout: { type: 'uniform1f', value: settings.grout },
    u_grout_var: { type: 'uniform1f', value: settings.groutVar },
    u_round: { type: 'uniform1f', value: settings.round },
    u_tile_low: { type: 'uniform3f', value: palette.tileLow },
    u_tile_high: { type: 'uniform3f', value: palette.tileHigh },
    u_logo_low: { type: 'uniform3f', value: palette.logoLow },
    u_logo_high: { type: 'uniform3f', value: palette.logoHigh },
    u_logo_tint_color: { type: 'uniform3f', value: normalizeTint(palette.logoTint) },
    u_tint: { type: 'uniform1f', value: settings.tint },
    u_hue_spread: { type: 'uniform1f', value: settings.hueSpread },
    u_logo_tint: { type: 'uniform1f', value: settings.logoTint },
    u_depth: { type: 'uniform1f', value: settings.depth * (light ? settings.lmDepth : 1) },
    u_shadow: { type: 'uniform1f', value: light ? settings.lmShadow : 1 },
    u_edge_light: { type: 'uniform1f', value: light ? 1 : settings.dmEdge },
    u_falloff: { type: 'uniform1f', value: light ? settings.lmFalloff : settings.dmFalloff },
    u_falloff_reach: { type: 'uniform1f', value: settings.falloffReach },
    u_add_glow: { type: 'uniform1f', value: light ? 0 : settings.dmGlow },
    u_add_catch: { type: 'uniform1f', value: light ? 0 : settings.dmCatch },
    u_add_tone: { type: 'uniform1f', value: light ? 0 : settings.dmTone },
    u_depth_reach: { type: 'uniform1f', value: settings.depthReach },
    u_back_color: { type: 'uniform3f', value: palette.logoTint },
    u_back_glow: { type: 'uniform1f', value: settings.backGlow },
    u_back_rim: { type: 'uniform1f', value: settings.backRim },
    u_glow_reach: { type: 'uniform1f', value: settings.glowReach },
    u_vig_width: { type: 'uniform1f', value: settings.vigWidth },
    u_text_box: { type: 'uniform4f', value: settings.textClear ? textBox : [0, 0, 0, 0] },
    u_fade_top: { type: 'uniform1f', value: textBox[1] },
    u_bottom_fade: { type: 'uniform1f', value: settings.bottomFade },
    u_fade_height: { type: 'uniform1f', value: settings.fadeHeight },
    u_fade_offset: { type: 'uniform1f', value: settings.fadeOffset },
    u_text_pad: { type: 'uniform1f', value: settings.textPad },
    u_underlay: { type: 'uniform1f', value: settings.underlay },
    u_base_mix: { type: 'uniform1f', value: light ? settings.lmBase : settings.dmBase },
    u_prism: { type: 'uniform1f', value: settings.prism * (light ? 1 : settings.dmPrism) },
    u_prism_width: { type: 'uniform1f', value: settings.prismWidth },
    u_prism_spread: { type: 'uniform1f', value: settings.prismSpread },
    u_prism_side: { type: 'uniform1f', value: settings.prismSide },
    u_vig_dim: { type: 'uniform1f', value: settings.vigDim },
    u_text_round: { type: 'uniform1f', value: settings.textRound },
    u_text_jitter: { type: 'uniform1f', value: settings.textJitter },
    u_shadow_strength: { type: 'uniform1f', value: settings.shadowStrength * (light ? 1 : settings.dmShadow) },
    u_shadow_height: { type: 'uniform1f', value: settings.shadowHeight },
    u_shadow_soft: { type: 'uniform1f', value: settings.shadowSoft },
    u_vig_cells: { type: 'uniform1f', value: settings.vigCells },
    u_vig_cut: { type: 'uniform1f', value: settings.vigCut },
    u_vig_jitter: { type: 'uniform1f', value: settings.vigJitter },
    u_logo_y: { type: 'uniform1f', value: settings.logoY },
    u_zoom: { type: 'uniform1f', value: settings.zoom },
    u_cover: { type: 'uniform1f', value: settings.cover },
    u_page_color: { type: 'uniform3f', value: palette.page },
    u_sheen: { type: 'uniform1f', value: settings.sheen },
    u_sheen_scale: { type: 'uniform1f', value: settings.sheenScale },
    u_sheen_angle: { type: 'uniform1f', value: settings.sheenAngle },
    u_sheen_warp: { type: 'uniform1f', value: settings.sheenWarp },
    u_sheen_detail: { type: 'uniform1f', value: settings.sheenDetail },
    u_sheen_glint: { type: 'uniform1f', value: settings.sheenGlint },
    u_sheen_base: { type: 'uniform1f', value: settings.sheenBase },
    u_sheen_edge: { type: 'uniform1f', value: settings.sheenEdge },
    u_trail: TRAIL_POINTS_UNIFORM,
    u_trail_origin: TRAIL_ORIGIN_UNIFORM,
    u_trail_energy: TRAIL_ENERGY_UNIFORM,
    u_vig_height: { type: 'uniform1f', value: settings.vigHeight },
    u_vig_soft: { type: 'uniform1f', value: settings.vigSoft },
    u_vig_top: { type: 'uniform1f', value: settings.vigTop },
    u_vig_bottom: { type: 'uniform1f', value: settings.vigBottom },
    u_logo_mix: { type: 'uniform1f', value: settings.logoMix },
    u_flow: { type: 'uniform1f', value: settings.flow },
    u_flow_scale: { type: 'uniform1f', value: settings.flowScale },
    u_tone: { type: 'uniform1f', value: settings.tone },
    u_bevel_width: { type: 'uniform1f', value: settings.bevelWidth },
    u_bevel_shape: { type: 'uniform1f', value: settings.bevelShape },
    u_bevel_height: { type: 'uniform1f', value: settings.bevelHeight },
    u_view: { type: 'uniform1i', value: settings.view },
    u_bake: { type: 'uniform1i', value: 0 },
    u_skeleton_grout: { type: 'uniform1f', value: settings.skeletonGrout },
    u_clay_tilt: { type: 'uniform1f', value: settings.clayTilt },
    u_clay_thickness: { type: 'uniform1f', value: settings.clayThickness },
    u_clay_wobble: { type: 'uniform1f', value: settings.clayWobble },
    u_clay_scale: { type: 'uniform1f', value: settings.clayScale },
    u_dome_height: { type: 'uniform1f', value: settings.domeHeight },
    u_dome_reach: { type: 'uniform1f', value: settings.domeReach },
    u_edge_height: { type: 'uniform1f', value: settings.edgeHeight },
    u_edge_width: { type: 'uniform1f', value: settings.edgeWidth },
    u_dish_depth: { type: 'uniform1f', value: settings.dishDepth },
    u_dish_reach: { type: 'uniform1f', value: settings.dishReach },
    u_rigid: { type: 'uniform1f', value: settings.rigid },
    u_lift: { type: 'uniform1f', value: settings.lift },
    u_light_x: { type: 'uniform1f', value: settings.lightX },
    u_light_y: { type: 'uniform1f', value: settings.lightY },
    u_light_z: { type: 'uniform1f', value: settings.lightZ },
    u_diffuse: { type: 'uniform1f', value: settings.diffuse },
    u_specular: { type: 'uniform1f', value: settings.specular },
    u_spec_size: { type: 'uniform1f', value: settings.specSize },
    u_fresnel: { type: 'uniform1f', value: settings.fresnel },
    u_highlight: { type: 'uniform1f', value: settings.highlight },
    u_fresnel_power: { type: 'uniform1f', value: settings.fresnelPower },
    u_rim: { type: 'uniform1f', value: settings.rim },
    u_warp: { type: 'uniform1f', value: settings.warp },
    u_camera: { type: 'uniform1f', value: settings.camera },
    u_view_x: { type: 'uniform1f', value: settings.viewX },
    u_view_y: { type: 'uniform1f', value: settings.viewY },
    u_focus_x: { type: 'uniform1f', value: focus.x },
    u_focus_y: { type: 'uniform1f', value: focus.y },
    u_logo_size: { type: 'uniform1f', value: settings.logoSize },
    u_threshold: { type: 'uniform1f', value: settings.threshold },
    u_stroke: { type: 'uniform1f', value: MARKS[settings.mark].stroke },
    u_gap: { type: 'uniform1f', value: MARKS[settings.mark].gap },
    u_corner: { type: 'uniform1f', value: MARKS[settings.mark].corner },
    u_symbol: { type: 'uniform1f', value: 'symbol' in MARKS[settings.mark] ? 1 : 0 },
    u_cut: { type: 'uniform1f', value: settings.cut },
    u_row: { type: 'uniform1f', value: settings.row },
    u_row_var: { type: 'uniform1f', value: settings.rowVar },
    u_brick: { type: 'uniform1f', value: settings.brick },
    u_brick_var: { type: 'uniform1f', value: settings.brickVar },
    u_break: { type: 'uniform1f', value: settings.breakOut },
    u_break_freq: { type: 'uniform1f', value: settings.breakFreq },
    u_break_var: { type: 'uniform1f', value: settings.breakVar },
    u_hug: { type: 'uniform1f', value: settings.hug },
    u_hug_len: { type: 'uniform1f', value: settings.hugLen },
    u_hug_jitter: { type: 'uniform1f', value: settings.hugJitter },
    u_solid_logo: { type: 'uniform1f', value: settings.solidLogo },
    u_fine: { type: 'uniform1f', value: settings.fine },
    u_fine_near: { type: 'uniform1f', value: settings.fineNear },
    u_fine_chance: { type: 'uniform1f', value: settings.fineChance },
  };
}

function SliderRow({
  slider,
  settings,
  onChange,
}: {
  slider: Slider;
  settings: Settings;
  onChange: (next: Settings) => void;
}) {
  const { key, min, max, step } = slider;
  return (
    <label className='grid grid-cols-[5rem_1fr_2.5rem] items-center gap-2'>
      <span>{key}</span>
      <input
        type='range'
        min={min}
        max={max}
        step={step}
        value={settings[key]}
        onChange={event => onChange({ ...settings, [key]: Number(event.target.value) })}
      />
      <span className='text-right tabular-nums'>{settings[key]}</span>
    </label>
  );
}

function SelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: number;
  options: string[];
  onChange: (value: number) => void;
}) {
  return (
    <label className='grid grid-cols-[5rem_1fr] items-center gap-2'>
      <span>{label}</span>
      <select
        className='rounded border border-neutral-300 bg-transparent px-1 dark:border-neutral-700'
        value={value}
        onChange={event => onChange(Number(event.target.value))}
      >
        {options.map((option, index) => (
          <option
            key={option}
            value={index}
          >
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function PanelSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className='flex flex-col gap-1.5 border-t border-neutral-200 pt-2 dark:border-neutral-800'>
      <button
        type='button'
        className='flex items-center justify-between text-left font-medium'
        onClick={() => setOpen(value => !value)}
      >
        {title}
        <span>{open ? '−' : '+'}</span>
      </button>
      {open ? children : null}
    </div>
  );
}

export function Panel({
  settings,
  onChange,
  onBake,
  bakeStatus,
  defaults,
  target,
}: {
  settings: Settings;
  onChange: (next: Settings) => void;
  onBake: () => void;
  bakeStatus: string;
  defaults: Settings;
  target: 'desktop' | 'mobile';
}) {
  const [copied, setCopied] = React.useState(false);
  const patternSliders = SLIDERS.filter(({ key }) => settings.hug === 0 || (key !== 'threshold' && key !== 'cut'));
  const sliders = (list: Slider[]) =>
    list.map(slider => (
      <SliderRow
        key={slider.key}
        slider={slider}
        settings={settings}
        onChange={onChange}
      />
    ));
  return (
    <div className='fixed bottom-4 right-4 z-50 flex max-h-[calc(100svh-2rem)] w-72 flex-col gap-2 overflow-y-auto overscroll-contain rounded-lg border border-neutral-200 bg-white/90 p-3 text-left text-xs text-neutral-800 shadow-lg backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/90 dark:text-neutral-200'>
      <SelectRow
        label='view'
        value={settings.view}
        options={VIEWS}
        onChange={view => onChange({ ...settings, view })}
      />
      <PanelSection title='Frame'>{sliders(VIGNETTE_SLIDERS)}</PanelSection>
      <PanelSection title='Light'>{sliders(LIGHT_SLIDERS)}</PanelSection>
      <PanelSection title='Skeleton'>{sliders(SKELETON_SLIDERS)}</PanelSection>
      <PanelSection title='Base color'>{sliders(BASE_SLIDERS)}</PanelSection>
      <PanelSection title='Prism'>{sliders(PRISM_SLIDERS)}</PanelSection>
      <PanelSection title='Text clearance'>{sliders(TEXT_SLIDERS)}</PanelSection>
      <PanelSection title='Shadow'>{sliders(SHADOW_SLIDERS)}</PanelSection>
      <PanelSection title='Light mode'>{sliders(LIGHT_MODE_SLIDERS)}</PanelSection>
      <PanelSection title='Sheen'>{sliders(SHEEN_SLIDERS)}</PanelSection>
      <PanelSection title='Backlight'>{sliders(BACKLIGHT_SLIDERS)}</PanelSection>
      <PanelSection title='Glass'>{sliders(GLASS_SLIDERS)}</PanelSection>
      <PanelSection title='Bevel'>{sliders(BEVEL_SLIDERS)}</PanelSection>
      <PanelSection title='Clay'>{sliders(CLAY_SLIDERS)}</PanelSection>
      <PanelSection title='World'>{sliders(WORLD_SLIDERS)}</PanelSection>
      <PanelSection title='Pattern'>
        <SelectRow
          label='mark'
          value={settings.mark}
          options={MARKS.map(mark => mark.label)}
          onChange={mark => onChange({ ...settings, mark })}
        />
        {sliders(patternSliders)}
      </PanelSection>
      <div className='grid grid-cols-2 gap-2'>
        <button
          type='button'
          className='rounded border border-neutral-300 py-1 dark:border-neutral-700'
          onClick={() => {
            void navigator.clipboard.writeText(JSON.stringify(settings, null, 2)).then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1200);
            });
          }}
        >
          {copied ? 'Copied' : 'Copy values'}
        </button>
        <button
          type='button'
          className='rounded border border-neutral-300 py-1 dark:border-neutral-700'
          onClick={() => onChange(defaults)}
        >
          Reset
        </button>
      </div>
      <button
        type='button'
        className='rounded bg-neutral-900 py-1.5 font-medium text-white dark:bg-white dark:text-neutral-900'
        onClick={onBake}
      >
        {target === 'mobile' ? 'Bake mobile' : 'Bake'}
      </button>
      {bakeStatus ? <p className='text-[11px] leading-4 text-neutral-500'>{bakeStatus}</p> : null}
    </div>
  );
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

const LAB_MESSAGE = 'mosaic-lab';

export type LabMessage =
  | { type: `${typeof LAB_MESSAGE}:state`; settings: Settings; target: 'desktop' | 'mobile'; bakeStatus: string }
  | { type: `${typeof LAB_MESSAGE}:set`; settings: Settings }
  | { type: `${typeof LAB_MESSAGE}:bake` };

export function MosaicScene({ framed = false }: { framed?: boolean }) {
  const sceneRef = React.useRef<HTMLDivElement>(null);
  const { height, focus, textBox, scale } = useSceneLayout(sceneRef);
  const target = React.useSyncExternalStore(subscribeMobile, readTarget, () => 'desktop' as const);
  const [edits, setEdits] = React.useState<Partial<Record<'desktop' | 'mobile', Settings>>>({});
  const settings = edits[target] ?? (target === 'mobile' ? MOBILE_DEFAULTS : DEFAULTS);
  const setSettings = React.useCallback(
    (next: Settings) => setEdits(current => ({ ...current, [target]: next })),
    [target],
  );
  const mode = useMode();
  const palette = React.useMemo(() => readPalette(mode) ?? FALLBACK_PALETTE, [mode]);
  const spring = useLightSpring(sceneRef, POINTER_EFFECTS && settings.follow > 0);
  const uniforms = React.useMemo(
    () => buildUniforms(settings, focus, palette, mode, textBox),
    [settings, focus, palette, mode, textBox],
  );
  const { lightX, follow } = settings;
  React.useEffect(() => (POINTER_EFFECTS ? startTrail() : undefined), []);
  const stepSceneTrail = React.useCallback(() => {
    if (POINTER_EFFECTS) {
      stepTrail(sceneRef.current);
    }
  }, []);
  const mounted = React.useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  const liveUniforms = React.useCallback(
    (): Uniforms => ({
      u_light_x: { type: 'uniform1f', value: lightX + (spring.get() - lightX) * follow },
    }),
    [spring, lightX, follow],
  );
  const { sheen } = settings;
  const [bakeStatus, setBakeStatus] = React.useState('');
  const bake = React.useCallback(() => {
    const scene = sceneRef.current;
    if (!scene) {
      return;
    }
    setBakeStatus('Baking…');
    bakeScene({
      source,
      uniforms,
      width: scene.offsetWidth,
      height: scene.offsetHeight,
      focus,
      focusSize: scale * FOCUS_SIZE,
      target,
      settings,
    })
      .then(({ meta, written }) => {
        const files = written.map(entry => `${entry.file.split('/').pop()} ${Math.round(entry.bytes / 1024)} KB`);
        setBakeStatus(`Baked ${meta.width}×${meta.height}: ${files.join(', ')}`);
      })
      .catch((error: unknown) => setBakeStatus(error instanceof Error ? error.message : 'Bake failed'));
  }, [uniforms, focus, settings, scale, target]);
  const bakeRef = React.useRef(bake);
  const setSettingsRef = React.useRef(setSettings);
  React.useEffect(() => {
    bakeRef.current = bake;
    setSettingsRef.current = setSettings;
  }, [bake, setSettings]);
  React.useEffect(() => {
    if (!framed) {
      return;
    }
    const message: LabMessage = { type: `${LAB_MESSAGE}:state`, settings, target, bakeStatus };
    window.parent.postMessage(message, window.location.origin);
  }, [framed, settings, target, bakeStatus]);
  React.useEffect(() => {
    if (!framed) {
      return;
    }
    const onMessage = (event: MessageEvent<LabMessage>) => {
      if (event.origin !== window.location.origin) {
        return;
      }
      if (event.data.type === `${LAB_MESSAGE}:set`) {
        setSettingsRef.current(event.data.settings);
      } else if (event.data.type === `${LAB_MESSAGE}:bake`) {
        bakeRef.current();
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [framed]);
  const shouldRender = React.useCallback(
    () =>
      POINTER_EFFECTS && ((sheen > 0 && TRAIL_ENERGY_UNIFORM.value > 0.001) || (follow > 0 && spring.isAnimating())),
    [sheen, follow, spring],
  );
  return (
    <>
      <div
        ref={sceneRef}
        aria-hidden='true'
        className='pointer-events-none absolute left-1/2 top-0 -z-10 h-[38rem] w-[min(96rem,100%)] -translate-x-1/2'
        style={height ? { height } : undefined}
      >
        <Shader
          source={source}
          uniforms={uniforms}
          liveUniforms={liveUniforms}
          shouldRender={shouldRender}
          onRender={stepSceneTrail}
          premultiplied
        />
      </div>
      {process.env.NODE_ENV === 'development' && mounted && !framed
        ? createPortal(
            <Panel
              settings={settings}
              onChange={setSettings}
              onBake={bake}
              bakeStatus={bakeStatus}
              defaults={target === 'mobile' ? MOBILE_DEFAULTS : DEFAULTS}
              target={target}
            />,
            document.body,
          )
        : null}
    </>
  );
}
