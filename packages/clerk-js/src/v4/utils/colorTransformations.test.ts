import { Color } from 'react-color';

import { colorToSameTypeString, hexStringToRgbaColor, stringToHslaColor } from './colorTransformations';

describe('stringToHslaColor(color)', function () {
  const hsla = { h: 195, s: 1, l: 0.5, a: 1 };
  const cases: Array<[string, Color | undefined]> = [
    ['', undefined],
    ['transparent', { h: 0, s: 0, l: 0, a: 0 }],
    ['#00bfff', hsla],
    ['00bfff', hsla],
    ['rgb(0, 191, 255)', hsla],
    ['rgba(0, 191, 255, 0.3)', { ...hsla, a: 0.3 }],
    ['hsla(195, 100%, 50%, 1)', hsla],
    ['hsla(195, 100%, 50%, 1)', hsla],
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
