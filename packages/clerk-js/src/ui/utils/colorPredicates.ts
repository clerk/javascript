import { Color, ColorString, HslaColor, RgbaColor, TransparentColor } from '@clerk/types';

const IS_HEX_COLOR_REGEX = /^#?([A-F0-9]{6}|[A-F0-9]{3})$/i;

const IS_RGB_COLOR_REGEX = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/i;
const IS_RGBA_COLOR_REGEX = /^rgba\((\d+),\s*(\d+),\s*(\d+)(,\s*\d+(\.\d+)?)\)$/i;

const IS_HSL_COLOR_REGEX = /^hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)$/i;
const IS_HSLA_COLOR_REGEX = /^hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%(,\s*\d+(\.\d+)?)*\)$/i;

export const isValidHexString = (s: string): s is ColorString => {
  return !!s.match(IS_HEX_COLOR_REGEX);
};

export const isValidRgbaString = (s: string): s is ColorString => {
  return !!(s.match(IS_RGB_COLOR_REGEX) || s.match(IS_RGBA_COLOR_REGEX));
};

export const isValidHslaString = (s: string): s is ColorString => {
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
