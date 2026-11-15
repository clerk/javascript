'use client';
import * as React from 'react';

import type { Mode } from '@/components/use-mode';

export const BAKE_EDGE_MAX = 32;
export const BAKE_BLUR = 18;
export const BAKE_HALO = 48;

export type Focus = { x: number; y: number };
export type TextBox = [number, number, number, number];

export type Rgb = [number, number, number];
export type Palette = { tileLow: Rgb; tileHigh: Rgb; logoLow: Rgb; logoHigh: Rgb; logoTint: Rgb; page: Rgb };

export const PALETTE_TOKENS: Record<Mode, Record<keyof Palette, [string, string]>> = {
  light: {
    tileLow: ['--color-gray-100', '#efeeed'],
    tileHigh: ['--color-gray-150', '#e4e3e1'],
    logoLow: ['--color-gray-100', '#efeeed'],
    logoHigh: ['--color-gray-150', '#e4e3e1'],
    logoTint: ['--color-purple-400', '#9c83fd'],
    page: ['--background', '#f7f7f6'],
  },
  dark: {
    tileLow: ['--color-gray-800', '#24211f'],
    tileHigh: ['--color-gray-750', '#2d2926'],
    logoLow: ['--color-gray-600', '#595450'],
    logoHigh: ['--color-gray-500', '#76726e'],
    logoTint: ['--color-purple-400', '#9c83fd'],
    page: ['--background', '#181613'],
  },
};

function readColor(context: CanvasRenderingContext2D, [token, fallback]: [string, string], from: Element): Rgb {
  const value = getComputedStyle(from).getPropertyValue(token).trim();
  context.clearRect(0, 0, 1, 1);
  context.fillStyle = value || fallback;
  context.fillRect(0, 0, 1, 1);
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
}

export function readPalette(mode: Mode, from?: Element): Palette | null {
  if (typeof document === 'undefined') {
    return null;
  }
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    return null;
  }
  const tokens = PALETTE_TOKENS[mode];
  const root = from ?? document.documentElement;
  return {
    tileLow: readColor(context, tokens.tileLow, root),
    tileHigh: readColor(context, tokens.tileHigh, root),
    logoLow: readColor(context, tokens.logoLow, root),
    logoHigh: readColor(context, tokens.logoHigh, root),
    logoTint: readColor(context, tokens.logoTint, root),
    page: readColor(context, tokens.page, root),
  };
}

export const SURFACE_DETAIL_GLSL = `
float detailHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

vec2 surfaceDetail(vec2 p, float scale, float grain, float dots) {
  vec2 q = p * (512.0 / max(scale, 1.0));
  vec2 i = floor(q);
  vec2 f = fract(q);
  vec2 u = f * f * (3.0 - 2.0 * f);
  vec2 du = 6.0 * f * (1.0 - f);
  float a = detailHash(i);
  float b = detailHash(i + vec2(1.0, 0.0));
  float c = detailHash(i + vec2(0.0, 1.0));
  float d = detailHash(i + vec2(1.0, 1.0));
  float k = a - b - c + d;
  vec2 slope = du * vec2(b - a + k * u.y, c - a + k * u.x) * grain;
  if (dots > 0.0) {
    float cell = 24.0 / sqrt(dots);
    vec2 id = floor(q / cell);
    vec2 center = (id + 0.1 + 0.8 * vec2(detailHash(id + 7.0), detailHash(id + 53.0))) * cell;
    float radius = 0.8 + 1.4 * detailHash(id + 13.0);
    float depth = 0.25 + 0.5 * detailHash(id + 29.0);
    vec2 offset = q - center;
    if (detailHash(id + 71.0) < 0.3 && dot(offset, offset) < radius * radius) {
      slope += 1.5 * depth * offset / (radius * radius);
    }
  }
  return normalize(vec3(-slope, 1.0)).xy;
}
`;

export function oklchToLinear(lightness: number, chroma: number, hue: number): Rgb {
  const a = chroma * Math.cos((hue * Math.PI) / 180);
  const b = chroma * Math.sin((hue * Math.PI) / 180);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    Math.max(0, 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    Math.max(0, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    Math.max(0, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

export const FALLBACK_PALETTE: Palette = {
  tileLow: [0.937, 0.933, 0.929],
  tileHigh: [0.894, 0.89, 0.882],
  logoLow: [0.937, 0.933, 0.929],
  logoHigh: [0.894, 0.89, 0.882],
  logoTint: [0.612, 0.514, 0.992],
  page: [0.969, 0.969, 0.965],
};

const BELOW_HEADLINE = 160;
export const FOCUS_SIZE = 256;

export function useSceneLayout(ref: React.RefObject<HTMLDivElement | null>, measureText = true) {
  const [height, setHeight] = React.useState<number | null>(null);
  const [focus, setFocus] = React.useState<Focus>({ x: 0, y: 0 });
  const [textBox, setTextBox] = React.useState<TextBox>([0, 0, 0, 0]);
  const [width, setWidth] = React.useState(0);
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => {
    const scene = ref.current;
    const section = scene?.parentElement;
    const headline = section?.querySelector('h1');
    const focusBox = section?.querySelector<HTMLElement>('[data-mosaic-focus]');
    if (!scene || !section || !headline) {
      return;
    }
    const measure = () => {
      setHeight(headline.offsetTop + headline.offsetHeight - scene.offsetTop + BELOW_HEADLINE);
      setWidth(scene.offsetWidth);
      const sceneRect = scene.getBoundingClientRect();
      if (focusBox) {
        const box = focusBox.getBoundingClientRect();
        setFocus({ x: box.left + box.width / 2 - sceneRect.left, y: box.top + box.height / 2 - sceneRect.top });
        setScale(box.width / FOCUS_SIZE);
      } else {
        setFocus({ x: sceneRect.width / 2, y: sceneRect.height / 3 });
      }
      if (!measureText) {
        return;
      }
      const parts = [
        section.querySelector('[data-hero-eyebrow]'),
        headline,
        headline.nextElementSibling,
        section.querySelector('[data-hero-end]')?.firstElementChild,
      ].filter((part): part is Element => part instanceof Element);
      const rects = parts.map(part => {
        const range = document.createRange();
        range.selectNodeContents(part);
        const tight = range.getBoundingClientRect();
        return tight.width > 0 ? tight : part.getBoundingClientRect();
      });
      if (rects.length > 0) {
        setTextBox([
          Math.min(...rects.map(rect => rect.left)) - sceneRect.left,
          Math.min(...rects.map(rect => rect.top)) - sceneRect.top,
          Math.max(...rects.map(rect => rect.right)) - sceneRect.left,
          Math.max(...rects.map(rect => rect.bottom)) - sceneRect.top,
        ]);
      }
    };
    const observer = new ResizeObserver(measure);
    observer.observe(section);
    observer.observe(headline);
    return () => observer.disconnect();
  }, [ref, measureText]);
  return { height, focus, textBox, width, scale };
}
