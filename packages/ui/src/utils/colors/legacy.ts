/* eslint-disable no-useless-escape */
/**
 * These helpers have been extracted from the following libraries,
 * converted to Typescript and adapted to our needs.
 *
 * https://github.com/Qix-/color-convert
 * https://github.com/Qix-/color-name
 * https://github.com/Qix-/color
 */

import type { HslaColor, HslaColorString } from '@clerk/shared/types';

import { resolveCSSVariable } from '../cssVariables';

const abbrRegex = /^#([a-f0-9]{3,4})$/i;
const hexRegex = /^#([a-f0-9]{6})([a-f0-9]{2})?$/i;
const rgbaRegex =
  /^rgba?\(\s*([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)(?=[\s,])\s*(?:,\s*)?([+-]?\d+)\s*(?:[,|\/]\s*([+-]?[\d\.]+)(%?)\s*)?\)$/;
const perRegex =
  /^rgba?\(\s*([+-]?[\d\.]+)\%\s*,?\s*([+-]?[\d\.]+)\%\s*,?\s*([+-]?[\d\.]+)\%\s*(?:[,|\/]\s*([+-]?[\d\.]+)(%?)\s*)?\)$/;
const hslRegex =
  /^hsla?\(\s*([+-]?(?:\d{0,3}\.)?\d+)(?:deg)?\s*,?\s*([+-]?[\d\.]+)%\s*,?\s*([+-]?[\d\.]+)%\s*(?:[,|\/]\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/;
const hwbRegex =
  /^hwb\(\s*([+-]?\d{0,3}(?:\.\d+)?)(?:deg)?\s*,\s*([+-]?[\d\.]+)%\s*,\s*([+-]?[\d\.]+)%\s*(?:,\s*([+-]?(?=\.\d|\d)(?:0|[1-9]\d*)?(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*)?\)$/;

// List of common css keywords.
// https://github.com/colorjs/color-name
const keywords = {
  black: [0, 0, 0, 1],
  blue: [0, 0, 255, 1],
  red: [255, 0, 0, 1],
  green: [0, 128, 0, 1],
  grey: [128, 128, 128, 1],
  gray: [128, 128, 128, 1],
  white: [255, 255, 255, 1],
  yellow: [255, 255, 0, 1],
  transparent: [0, 0, 0, 0],
};

type ColorTuple = [number, number, number, number?];
type ParsedResult = { model: 'hsl' | 'rgb' | 'hwb'; value: ColorTuple };

const clamp = (num: number, min: number, max: number) => Math.min(Math.max(min, num), max);

const parseRgb = (str: string): ColorTuple | null => {
  if (!str) {
    return null;
  }
  const rgb = [0, 0, 0, 1];
  let match;
  let i;
  let hexAlpha;

  if ((match = str.match(hexRegex))) {
    hexAlpha = match[2];
    match = match[1];

    for (i = 0; i < 3; i++) {
      const i2 = i * 2;
      rgb[i] = parseInt(match.slice(i2, i2 + 2), 16);
    }

    if (hexAlpha) {
      rgb[3] = parseInt(hexAlpha, 16) / 255;
    }
  } else if ((match = str.match(abbrRegex))) {
    match = match[1];
    hexAlpha = match[3];

    for (i = 0; i < 3; i++) {
      rgb[i] = parseInt(match[i] + match[i], 16);
    }

    if (hexAlpha) {
      rgb[3] = parseInt(hexAlpha + hexAlpha, 16) / 255;
    }
  } else if ((match = str.match(rgbaRegex))) {
    for (i = 0; i < 3; i++) {
      rgb[i] = parseInt(match[i + 1], 0);
    }

    if (match[4]) {
      if (match[5]) {
        rgb[3] = parseFloat(match[4]) * 0.01;
      } else {
        rgb[3] = parseFloat(match[4]);
      }
    }
  } else if ((match = str.match(perRegex))) {
    for (i = 0; i < 3; i++) {
      rgb[i] = Math.round(parseFloat(match[i + 1]) * 2.55);
    }

    if (match[4]) {
      if (match[5]) {
        rgb[3] = parseFloat(match[4]) * 0.01;
      } else {
        rgb[3] = parseFloat(match[4]);
      }
    }
  } else if (str in keywords) {
    return keywords[str as keyof typeof keywords] as any;
  } else {
    return null;
  }

  for (i = 0; i < 3; i++) {
    rgb[i] = clamp(rgb[i], 0, 255);
  }
  rgb[3] = clamp(rgb[3], 0, 1);

  return rgb as any;
};

const parseHsl = (str: string): ColorTuple | null => {
  if (!str) {
    return null;
  }
  const match = str.match(hslRegex);
  return match ? transformHslOrHwb(match) : null;
};

const parseHwb = function (str: string): ColorTuple | null {
  if (!str) {
    return null;
  }
  const match = str.match(hwbRegex);
  return match ? transformHslOrHwb(match) : null;
};

const transformHslOrHwb = (match: any): ColorTuple => {
  const alpha = parseFloat(match[4]);
  const hh = ((parseFloat(match[1]) % 360) + 360) % 360;
  const sw = clamp(parseFloat(match[2]), 0, 100);
  const lb = clamp(parseFloat(match[3]), 0, 100);
  const aa = clamp(isNaN(alpha) ? 1 : alpha, 0, 1);
  return [hh, sw, lb, aa];
};

const hslaTupleToHslaColor = (hsla: ColorTuple): HslaColor => {
  return { h: hsla[0], s: hsla[1], l: hsla[2], a: hsla[3] ?? 1 };
};

const hwbTupleToRgbTuple = (hwb: ColorTuple): ColorTuple => {
  const h = hwb[0] / 360;
  let wh = hwb[1] / 100;
  let bl = hwb[2] / 100;
  const a = hwb[3] ?? 1;
  const ratio = wh + bl;
  let f;

  // Wh + bl cant be > 1
  if (ratio > 1) {
    wh /= ratio;
    bl /= ratio;
  }

  const i = Math.floor(6 * h);
  const v = 1 - bl;
  f = 6 * h - i;

  if ((i & 0x01) !== 0) {
    f = 1 - f;
  }

  const n = wh + f * (v - wh); // Linear interpolation

  let r;
  let g;
  let b;

  switch (i) {
    default:
    case 6:
    case 0:
      r = v;
      g = n;
      b = wh;
      break;
    case 1:
      r = n;
      g = v;
      b = wh;
      break;
    case 2:
      r = wh;
      g = v;
      b = n;
      break;
    case 3:
      r = wh;
      g = n;
      b = v;
      break;
    case 4:
      r = n;
      g = wh;
      b = v;
      break;
    case 5:
      r = v;
      g = wh;
      b = n;
      break;
  }

  return [r * 255, g * 255, b * 255, a];
};

const rgbaTupleToHslaColor = (rgb: ColorTuple): HslaColor => {
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;
  const a = rgb[3] ?? 1;
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  const delta = max - min;
  let h;
  let s;

  if (max === min) {
    h = 0;
  } else if (r === max) {
    h = (g - b) / delta;
  } else if (g === max) {
    h = 2 + (b - r) / delta;
  } else if (b === max) {
    h = 4 + (r - g) / delta;
  }

  // @ts-ignore
  h = Math.min(h * 60, 360);

  if (h < 0) {
    h += 360;
  }

  const l = (min + max) / 2;

  if (max === min) {
    s = 0;
  } else if (l <= 0.5) {
    s = delta / (max + min);
  } else {
    s = delta / (2 - max - min);
  }

  return { h: Math.floor(h), s: Math.floor(s * 100), l: Math.floor(l * 100), a };
};

const hwbTupleToHslaColor = (hwb: ColorTuple): HslaColor => {
  return rgbaTupleToHslaColor(hwbTupleToRgbTuple(hwb));
};

const hslaColorToHslaString = ({ h, s, l, a }: HslaColor): HslaColorString => {
  return `hsla(${h}, ${s}%, ${l}%, ${a ?? 1})` as HslaColorString;
};

const parse = (str: string): ParsedResult => {
  // First try to resolve CSS variables
  const resolvedStr = resolveCSSVariable(str);
  const colorStr = resolvedStr || str;

  const prefix = colorStr.substr(0, 3).toLowerCase();
  let res;
  if (prefix === 'hsl') {
    res = { model: 'hsl', value: parseHsl(colorStr) };
  } else if (prefix === 'hwb') {
    res = { model: 'hwb', value: parseHwb(colorStr) };
  } else {
    res = { model: 'rgb', value: parseRgb(colorStr) };
  }
  if (!res || !res.value) {
    throw new Error(`Clerk: "${colorStr}" cannot be used as a color within 'variables'. You can pass one of:
- any valid hsl or hsla color
- any valid rgb or rgba color
- any valid hex color
- any valid hwb color
- ${Object.keys(keywords).join(', ')}
`);
  }
  return res as ParsedResult;
};

const toHslaColor = (str: string): HslaColor => {
  const { model, value } = parse(str);
  switch (model) {
    case 'hsl':
      return hslaTupleToHslaColor(value);
    case 'hwb':
      return hwbTupleToHslaColor(value);
    case 'rgb':
      return rgbaTupleToHslaColor(value);
  }
};

const toHslaString = (hsla: HslaColor | string): HslaColorString => {
  return typeof hsla === 'string' ? hslaColorToHslaString(toHslaColor(hsla)) : hslaColorToHslaString(hsla);
};

const changeHslaLightness = (color: HslaColor, num: number): HslaColor => {
  return { ...color, l: color.l + num };
};

const setHslaAlpha = (color: HslaColor, num: number): HslaColor => {
  return { ...color, a: num };
};

const changeHslaAlpha = (color: HslaColor, num: number): HslaColor => {
  return { ...color, a: color.a ? color.a - num : undefined };
};

const lighten = (color: string | undefined, percentage = 0): string | undefined => {
  if (!color) {
    return undefined;
  }
  const hsla = toHslaColor(color);
  return toHslaString(changeHslaLightness(hsla, hsla.l * percentage));
};

const makeSolid = (color: string | undefined): string | undefined => {
  if (!color) {
    return undefined;
  }
  return toHslaString({ ...toHslaColor(color), a: 1 });
};

const makeTransparent = (color: string | undefined, percentage = 0): string | undefined => {
  if (!color || color.toString() === '') {
    return undefined;
  }
  const hsla = toHslaColor(color);
  return toHslaString(changeHslaAlpha(hsla, (hsla.a ?? 1) * percentage));
};

const setAlpha = (color: string, alpha: number) => {
  if (!color.toString()) {
    return color;
  }
  return toHslaString(setHslaAlpha(toHslaColor(color), alpha));
};

const adjustForLightness = (color: string | undefined, lightness = 5) => {
  if (!color) {
    return undefined;
  }

  const hsla = colors.toHslaColor(color);

  if (!hsla) {
    return color;
  }

  if (hsla.l === 100) {
    hsla.l = 95;
  } else {
    hsla.l = Math.min(hsla.l + 2 * lightness, 100);
  }

  return colors.toHslaString(hsla);
};

export const colors = {
  toHslaColor,
  toHslaString,
  adjustForLightness,
  changeHslaLightness,
  setHslaAlpha,
  lighten,
  makeTransparent,
  makeSolid,
  setAlpha,
};
