import type { Color, HslaColor, RgbaColor, TransparentColor } from './types';

const IS_HEX_COLOR_REGEX = /^#?([A-F0-9]{6}|[A-F0-9]{3})$/i;

const IS_RGB_COLOR_REGEX = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/i;
const IS_RGBA_COLOR_REGEX = /^rgba\((\d+),\s*(\d+),\s*(\d+)(,\s*\d+(\.\d+)?)\)$/i;

const IS_HSL_COLOR_REGEX = /^hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)$/i;
const IS_HSLA_COLOR_REGEX = /^hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%(,\s*\d+(\.\d+)?)*\)$/i;

export const isValidHexString = (s: string) => {
  return !!s.match(IS_HEX_COLOR_REGEX);
};

export const isValidRgbaString = (s: string) => {
  return !!(s.match(IS_RGB_COLOR_REGEX) || s.match(IS_RGBA_COLOR_REGEX));
};

export const isValidHslaString = (s: string) => {
  return !!s.match(IS_HSL_COLOR_REGEX) || !!s.match(IS_HSLA_COLOR_REGEX);
};

export const isRGBColor = (c: Color): c is RgbaColor => {
  return typeof c !== 'string' && 'r' in c;
};

export const isHSLColor = (c: Color): c is HslaColor => {
  return typeof c !== 'string' && 'h' in c;
};

export const isTransparent = (c: Color): c is TransparentColor => {
  return c === 'transparent';
};

export const hasAlpha = (color: Color): boolean => {
  return typeof color !== 'string' && color.a != undefined && color.a < 1;
};

const CLEAN_HSLA_REGEX = /[hsla()]/g;
const CLEAN_RGBA_REGEX = /[rgba()]/g;

export const stringToHslaColor = (value: string): HslaColor | null => {
  if (value === 'transparent') {
    return { h: 0, s: 0, l: 0, a: 0 };
  }

  if (isValidHexString(value)) {
    return hexStringToHslaColor(value);
  }

  if (isValidHslaString(value)) {
    return parseHslaString(value);
  }

  if (isValidRgbaString(value)) {
    return rgbaStringToHslaColor(value);
  }

  return null;
};

export const stringToSameTypeColor = (value: string): Color => {
  value = value.trim();
  if (isValidHexString(value)) {
    return value.startsWith('#') ? value : `#${value}`;
  }

  if (isValidRgbaString(value)) {
    return parseRgbaString(value);
  }

  if (isValidHslaString(value)) {
    return parseHslaString(value);
  }

  if (isTransparent(value)) {
    return value;
  }
  return '';
};

export const colorToSameTypeString = (color: Color): string | TransparentColor => {
  if (typeof color === 'string' && (isValidHexString(color) || isTransparent(color))) {
    return color;
  }

  if (isRGBColor(color)) {
    return rgbaColorToRgbaString(color);
  }

  if (isHSLColor(color)) {
    return hslaColorToHslaString(color);
  }

  return '';
};

export const hexStringToRgbaColor = (hex: string): RgbaColor => {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return { r, g, b };
};

const rgbaColorToRgbaString = (color: RgbaColor): string => {
  const { a, b, g, r } = color;
  return color.a === 0 ? 'transparent' : color.a != undefined ? `rgba(${r},${g},${b},${a})` : `rgb(${r},${g},${b})`;
};

const hslaColorToHslaString = (color: HslaColor): string => {
  const { h, s, l, a } = color;
  const sPerc = Math.round(s * 100);
  const lPerc = Math.round(l * 100);
  return color.a === 0
    ? 'transparent'
    : color.a != undefined
      ? `hsla(${h},${sPerc}%,${lPerc}%,${a})`
      : `hsl(${h},${sPerc}%,${lPerc}%)`;
};

const hexStringToHslaColor = (hex: string): HslaColor => {
  const rgbaString = colorToSameTypeString(hexStringToRgbaColor(hex));
  return rgbaStringToHslaColor(rgbaString);
};

const rgbaStringToHslaColor = (rgba: string): HslaColor => {
  const rgbaColor = parseRgbaString(rgba);
  const r = rgbaColor.r / 255;
  const g = rgbaColor.g / 255;
  const b = rgbaColor.b / 255;

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;

  if (max == min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l >= 0.5 ? d / (2 - (max + min)) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      default:
        h = ((r - g) / d + 4) * 60;
        break;
    }
  }

  const res: HslaColor = { h: Math.round(h), s, l };
  const a = rgbaColor.a;
  if (a != undefined) {
    res.a = a;
  }
  return res;
};

const parseRgbaString = (str: string): RgbaColor => {
  const [r, g, b, a] = str
    .replace(CLEAN_RGBA_REGEX, '')
    .split(',')
    .map(c => Number.parseFloat(c));
  return { r, g, b, a };
};

const parseHslaString = (str: string): HslaColor => {
  const [h, s, l, a] = str
    .replace(CLEAN_HSLA_REGEX, '')
    .split(',')
    .map(c => Number.parseFloat(c));
  return { h, s: s / 100, l: l / 100, a };
};
