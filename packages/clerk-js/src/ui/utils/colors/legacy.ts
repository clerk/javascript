/**
 * Legacy color utilities for parsing, converting, and manipulating colors.
 *
 * DEPRECATED: This file contains the legacy HSLA-based color manipulation utilities.
 * Use the unified API from index.ts which automatically chooses between modern and legacy implementations.
 *
 * These helpers have been extracted from the following libraries,
 * converted to TypeScript and adapted to our needs:
 * - https://github.com/Qix-/color-convert
 * - https://github.com/Qix-/color-name
 * - https://github.com/Qix-/color
 */

import type { HslaColor, HslaColorString } from '@clerk/types';

// Types
type ColorTuple = [number, number, number, number?];
type ParsedColor = { model: 'hsl' | 'rgb' | 'hwb'; value: ColorTuple };

// Constants
const COLOR_REGEX = {
  hex: /^#([a-f0-9]{6})([a-f0-9]{2})?$/i,
  hexShort: /^#([a-f0-9]{3,4})$/i,
  rgba: /^rgba?\(\s*([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)\s*(?:[,|/]\s*([+-]?[\d.]+)(%?)\s*)?\)$/,
  rgbaPercent:
    /^rgba?\(\s*([+-]?[\d.]+)%\s*,?\s*([+-]?[\d.]+)%\s*,?\s*([+-]?[\d.]+)%\s*(?:[,|/]\s*([+-]?[\d.]+)(%?)\s*)?\)$/,
  hsl: /^hsla?\(\s*([+-]?(?:\d{0,3}.)?\d+)(?:deg)?\s*,?\s*([+-]?[\d.]+)%\s*,?\s*([+-]?[\d.]+)%\s*(?:[,|/]\s*([+-]?(?=.\d|\d)(?:0|[1-9]\d*)?(?:.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/,
  hwb: /^hwb\(\s*([+-]?\d{0,3}(?:.\d+)?)(?:deg)?\s*,\s*([+-]?[\d.]+)%\s*,\s*([+-]?[\d.]+)%\s*(?:,\s*([+-]?(?=.\d|\d)(?:0|[1-9]\d*)?(?:.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/,
} as const;

const CSS_KEYWORDS = {
  black: [0, 0, 0, 1],
  blue: [0, 0, 255, 1],
  red: [255, 0, 0, 1],
  green: [0, 128, 0, 1],
  grey: [128, 128, 128, 1],
  gray: [128, 128, 128, 1],
  white: [255, 255, 255, 1],
  yellow: [255, 255, 0, 1],
  transparent: [0, 0, 0, 0],
} as const;

const COLOR_BOUNDS = {
  rgb: { min: 0, max: 255 },
  alpha: { min: 0, max: 1 },
  hue: { min: 0, max: 360 },
  percentage: { min: 0, max: 100 },
} as const;

// Utility functions
const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(min, value), max);

const normalizeHue = (hue: number): number =>
  ((hue % COLOR_BOUNDS.hue.max) + COLOR_BOUNDS.hue.max) % COLOR_BOUNDS.hue.max;

const createColorError = (input: string): Error =>
  new Error(`Clerk: "${input}" cannot be used as a color within 'variables'. You can pass one of:
- any valid hsl or hsla color
- any valid rgb or rgba color
- any valid hex color
- any valid hwb color
- ${Object.keys(CSS_KEYWORDS).join(', ')}
`);

// Color parsing functions
function parseHexColor(colorString: string): ColorTuple | null {
  if (!colorString) return null;

  let match = colorString.match(COLOR_REGEX.hex);
  if (match) {
    const hex = match[1];
    const alpha = match[2];
    const rgb: ColorTuple = [0, 0, 0, 1];

    for (let i = 0; i < 3; i++) {
      const start = i * 2;
      rgb[i] = parseInt(hex.slice(start, start + 2), 16);
    }

    if (alpha) {
      rgb[3] = parseInt(alpha, 16) / 255;
    }

    return rgb;
  }

  match = colorString.match(COLOR_REGEX.hexShort);
  if (match) {
    const shortHex = match[1];
    const alpha = shortHex[3];
    const rgb: ColorTuple = [0, 0, 0, 1];

    for (let i = 0; i < 3; i++) {
      rgb[i] = parseInt(shortHex[i] + shortHex[i], 16);
    }

    if (alpha) {
      rgb[3] = parseInt(alpha + alpha, 16) / 255;
    }

    return rgb;
  }

  return null;
}

function parseRgbaColor(colorString: string): ColorTuple | null {
  if (!colorString) return null;

  let match = colorString.match(COLOR_REGEX.rgba);
  if (match) {
    const rgb: ColorTuple = [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10), 1];

    if (match[4]) {
      rgb[3] = match[5]
        ? parseFloat(match[4]) * 0.01 // Percentage
        : parseFloat(match[4]); // Decimal
    }

    return clampRgbTuple(rgb);
  }

  match = colorString.match(COLOR_REGEX.rgbaPercent);
  if (match) {
    const rgb: ColorTuple = [
      Math.round(parseFloat(match[1]) * 2.55),
      Math.round(parseFloat(match[2]) * 2.55),
      Math.round(parseFloat(match[3]) * 2.55),
      1,
    ];

    if (match[4]) {
      rgb[3] = match[5]
        ? parseFloat(match[4]) * 0.01 // Percentage
        : parseFloat(match[4]); // Decimal
    }

    return clampRgbTuple(rgb);
  }

  return null;
}

function parseHslColor(colorString: string): ColorTuple | null {
  if (!colorString) return null;

  const match = colorString.match(COLOR_REGEX.hsl);
  if (!match) return null;

  return parseHslMatch(match);
}

function parseHwbColor(colorString: string): ColorTuple | null {
  if (!colorString) return null;

  const match = colorString.match(COLOR_REGEX.hwb);
  if (!match) return null;

  return parseHslMatch(match); // Same parsing logic as HSL
}

function parseHslMatch(match: RegExpMatchArray): ColorTuple {
  const hue = normalizeHue(parseFloat(match[1]));
  const saturation = clamp(parseFloat(match[2]), 0, 100);
  const lightness = clamp(parseFloat(match[3]), 0, 100);
  const alpha = match[4] ? clamp(parseFloat(match[4]), 0, 1) : 1;

  return [hue, saturation, lightness, alpha];
}

function parseKeywordColor(colorString: string): ColorTuple | null {
  const keyword = colorString.toLowerCase() as keyof typeof CSS_KEYWORDS;
  return CSS_KEYWORDS[keyword] ? [...CSS_KEYWORDS[keyword]] : null;
}

function clampRgbTuple(rgb: ColorTuple): ColorTuple {
  return [
    clamp(rgb[0], COLOR_BOUNDS.rgb.min, COLOR_BOUNDS.rgb.max),
    clamp(rgb[1], COLOR_BOUNDS.rgb.min, COLOR_BOUNDS.rgb.max),
    clamp(rgb[2], COLOR_BOUNDS.rgb.min, COLOR_BOUNDS.rgb.max),
    clamp(rgb[3] ?? 1, COLOR_BOUNDS.alpha.min, COLOR_BOUNDS.alpha.max),
  ];
}

// Color conversion functions
function rgbaToHsla(rgb: ColorTuple): HslaColor {
  const [r255, g255, b255, alpha = 1] = rgb;
  const r = r255 / 255;
  const g = g255 / 255;
  const b = b255 / 255;

  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  const delta = max - min;

  // Calculate lightness
  const lightness = (min + max) / 2;

  // Calculate saturation
  let saturation: number;
  if (max === min) {
    saturation = 0;
  } else if (lightness <= 0.5) {
    saturation = delta / (max + min);
  } else {
    saturation = delta / (2 - max - min);
  }

  // Calculate hue
  let hue: number;
  if (max === min) {
    hue = 0;
  } else if (r === max) {
    hue = (g - b) / delta;
  } else if (g === max) {
    hue = 2 + (b - r) / delta;
  } else {
    hue = 4 + (r - g) / delta;
  }

  hue = Math.min(hue * 60, COLOR_BOUNDS.hue.max);
  if (hue < 0) hue += COLOR_BOUNDS.hue.max;

  return {
    h: Math.floor(hue),
    s: Math.floor(saturation * 100),
    l: Math.floor(lightness * 100),
    a: alpha,
  };
}

function hwbToRgba(hwb: ColorTuple): ColorTuple {
  const [hue, whiteness100, blackness100, alpha = 1] = hwb;
  const h = hue / COLOR_BOUNDS.hue.max;
  let w = whiteness100 / 100;
  let b = blackness100 / 100;

  const ratio = w + b;
  if (ratio > 1) {
    w /= ratio;
    b /= ratio;
  }

  const sector = Math.floor(6 * h);
  const value = 1 - b;
  let factor = 6 * h - sector;

  if ((sector & 0x01) !== 0) {
    factor = 1 - factor;
  }

  const neutral = w + factor * (value - w);

  let red: number, green: number, blue: number;

  switch (sector) {
    default:
    case 6:
    case 0:
      [red, green, blue] = [value, neutral, w];
      break;
    case 1:
      [red, green, blue] = [neutral, value, w];
      break;
    case 2:
      [red, green, blue] = [w, value, neutral];
      break;
    case 3:
      [red, green, blue] = [w, neutral, value];
      break;
    case 4:
      [red, green, blue] = [neutral, w, value];
      break;
    case 5:
      [red, green, blue] = [value, w, neutral];
      break;
  }

  return [red * 255, green * 255, blue * 255, alpha];
}

function tupleToHslaColor(tuple: ColorTuple): HslaColor {
  const [h, s, l, a = 1] = tuple;
  return { h, s, l, a };
}

function hslaColorToString(hsla: HslaColor): HslaColorString {
  const { h, s, l, a = 1 } = hsla;
  return `hsla(${h}, ${s}%, ${l}%, ${a})` as HslaColorString;
}

// Main parsing function
function parseColorString(input: string): ParsedColor {
  const trimmed = input.trim();
  const prefix = trimmed.substring(0, 3).toLowerCase();

  let result: ColorTuple | null = null;
  let model: ParsedColor['model'];

  // Try parsing based on prefix
  if (prefix === 'hsl') {
    result = parseHslColor(trimmed);
    model = 'hsl';
  } else if (prefix === 'hwb') {
    result = parseHwbColor(trimmed);
    model = 'hwb';
  } else {
    // Try RGB formats (includes hex)
    result = parseRgbaColor(trimmed) || parseHexColor(trimmed) || parseKeywordColor(trimmed);
    model = 'rgb';
  }

  if (!result) {
    throw createColorError(input);
  }

  return { model, value: result };
}

// Color manipulation functions
function adjustLightness(color: HslaColor, amount: number): HslaColor {
  return {
    ...color,
    l: clamp(color.l + amount, COLOR_BOUNDS.percentage.min, COLOR_BOUNDS.percentage.max),
  };
}

function setAlphaValue(color: HslaColor, alpha: number): HslaColor {
  return {
    ...color,
    a: clamp(alpha, COLOR_BOUNDS.alpha.min, COLOR_BOUNDS.alpha.max),
  };
}

function adjustAlpha(color: HslaColor, amount: number): HslaColor {
  const currentAlpha = color.a ?? 1;
  return setAlphaValue(color, currentAlpha + amount);
}

// High-level utility functions
function lightenColor(color: string | undefined, percentage = 0): string | undefined {
  if (!color) return undefined;

  const hsla = toHslaColor(color);
  const lightnessDelta = hsla.l * percentage;
  return toHslaString(adjustLightness(hsla, lightnessDelta));
}

function makeColorSolid(color: string | undefined): string | undefined {
  if (!color) return undefined;
  return toHslaString(setAlphaValue(toHslaColor(color), 1));
}

function makeColorTransparent(color: string | undefined, percentage = 0): string | undefined {
  if (!color || color.toString() === '') return undefined;

  const hsla = toHslaColor(color);
  const alphaDelta = (hsla.a ?? 1) * percentage;
  return toHslaString(adjustAlpha(hsla, -alphaDelta));
}

function setColorAlpha(color: string, alpha: number): string {
  if (!color.toString()) return color;
  return toHslaString(setAlphaValue(toHslaColor(color), alpha));
}

function adjustColorForLightness(color: string | undefined, lightness = 5): string | undefined {
  if (!color) return undefined;

  const hsla = toHslaColor(color);

  // Special handling for pure white
  if (hsla.l === 100) {
    return toHslaString({ ...hsla, l: 95 });
  }

  const adjustedLightness = Math.min(hsla.l + 2 * lightness, 100);
  return toHslaString({ ...hsla, l: adjustedLightness });
}

// Main conversion functions
export function toHslaColor(colorString: string): HslaColor {
  const { model, value } = parseColorString(colorString);

  switch (model) {
    case 'hsl':
      return tupleToHslaColor(value);
    case 'hwb':
      return rgbaToHsla(hwbToRgba(value));
    case 'rgb':
      return rgbaToHsla(value);
    default:
      throw createColorError(colorString);
  }
}

export function toHslaString(input: HslaColor | string): HslaColorString {
  if (typeof input === 'string') {
    return hslaColorToString(toHslaColor(input));
  }
  return hslaColorToString(input);
}

// Export the legacy colors object with all utilities
export const legacyColors = {
  // Core conversion functions
  toHslaColor,
  toHslaString,

  // Color manipulation
  changeHslaLightness: adjustLightness,
  setHslaAlpha: setAlphaValue,

  // High-level utilities
  lighten: lightenColor,
  makeTransparent: makeColorTransparent,
  makeSolid: makeColorSolid,
  setAlpha: setColorAlpha,
  adjustForLightness: adjustColorForLightness,
};
