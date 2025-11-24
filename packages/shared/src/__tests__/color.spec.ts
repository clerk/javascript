import { describe, expect, it } from 'vitest';

import { colorToSameTypeString, hexStringToRgbaColor, stringToHslaColor, stringToSameTypeColor } from '../color';
import type { Color } from '../types';

describe('stringToHslaColor(color)', function () {
  const hsla = { h: 195, s: 1, l: 0.5 };
  const cases: Array<[string, Color | null]> = [
    ['', null],
    ['transparent', { h: 0, s: 0, l: 0, a: 0 }],
    ['#00bfff', hsla],
    ['00bfff', hsla],
    ['rgb(0, 191, 255)', hsla],
    ['rgba(0, 191, 255, 0.3)', { ...hsla, a: 0.3 }],
  ];

  it.each(cases)('.stringToHslaColor(%s) => %s', (a, expected) => {
    expect(stringToHslaColor(a)).toEqual(expected);
  });
});

describe('hexStringToRgbaColor(color)', function () {
  const cases: Array<[string, Color | null]> = [
    ['#00bfff', { r: 0, g: 191, b: 255 }],
    ['00bfff', { r: 0, g: 191, b: 255 }],
  ];

  it.each(cases)('.hexStringToRgbaColor(%s) => %s', (a, expected) => {
    expect(hexStringToRgbaColor(a)).toEqual(expected);
  });
});

describe('stringToSameTypeColor(color)', function () {
  const cases: Array<[string, Color | null]> = [
    ['', ''],
    ['invalid', ''],
    ['12ff12', '#12ff12'],
    ['#12ff12', '#12ff12'],
    ['1ff', '#1ff'],
    ['transparent', 'transparent'],
    ['rgb(100,100,100)', { r: 100, g: 100, b: 100, a: undefined }],
    ['rgba(100,100,100,0.5)', { r: 100, g: 100, b: 100, a: 0.5 }],
    ['rgb(100,100,100)', { r: 100, g: 100, b: 100, a: undefined }],
    ['rgba(100,100,100,0.5)', { r: 100, g: 100, b: 100, a: 0.5 }],
    ['hsl(244,66%,33%)', { h: 244, s: 0.66, l: 0.33, a: undefined }],
    ['hsla(244,66%,33%,0.5)', { h: 244, s: 0.66, l: 0.33, a: 0.5 }],
    ['hsl(244,66%,33)', ''],
    ['hsla(244,66%,33,0.5)', ''],
  ];

  it.each(cases)('.stringToSameTypeColor(%s) => %s', (a, expected) => {
    expect(stringToSameTypeColor(a)).toEqual(expected);
  });
});

describe('colorToSameTypeString(color)', function () {
  const cases: Array<[Color, string]> = [
    ['', ''],
    ['invalid', ''],
    ['#12ff12', '#12ff12'],
    ['#12ff12', '#12ff12'],
    ['#1ff', '#1ff'],
    [{ r: 100, g: 100, b: 100, a: undefined }, 'rgb(100,100,100)'],
    [{ r: 100, g: 100, b: 100, a: 0.5 }, 'rgba(100,100,100,0.5)'],
    [{ h: 100, s: 0.55, l: 0.33, a: undefined }, 'hsl(100,55%,33%)'],
    [{ h: 100, s: 1, l: 1, a: 0.5 }, 'hsla(100,100%,100%,0.5)'],
  ];

  it.each(cases)('.colorToSameTypeString(%s) => %s', (a, expected) => {
    expect(colorToSameTypeString(a)).toEqual(expected);
  });
});
