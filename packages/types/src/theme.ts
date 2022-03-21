export type EmUnit = string;

export type FontFamily = string;

export type FontWeight = string;

export type BoxShadow = string;

export type HexColor = `#${string}`;

export type TransparentColor = 'transparent';

export interface HslaColor {
  a?: number;
  h: number;
  l: number;
  s: number;
}

export interface RgbaColor {
  a?: number;
  b: number;
  g: number;
  r: number;
}

export type Color = string | HexColor | HslaColor | RgbaColor | TransparentColor;
