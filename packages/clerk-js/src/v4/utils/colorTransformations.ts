import { Color, HslaColor, RgbaColor, TransparentColor } from '@clerk/types';

import {
  isHSLColor,
  isRGBColor,
  isTransparent,
  isValidHexString,
  isValidHslaString,
  isValidRgbaString,
} from './colorPredicates';

const CLEAN_HSLA_REGEX = /[hsla()]/g;
const CLEAN_RGBA_REGEX = /[rgba()]/g;

export const stringToHslaColor = (value: string | undefined): HslaColor | undefined => {
  if (!value) {
    return undefined;
  }
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
  return undefined;
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

export const hslaColorToHslaString = (color: HslaColor): string => {
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

  const a = rgbaColor.a || 1;
  return { h: Math.round(h), s, l, a };
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
