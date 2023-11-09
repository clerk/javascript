import type { HslaColor } from '@clerk/types';

import { colors } from '../colors';

describe('colors.toHslaColor(color)', function () {
  const hsla = { h: 195, s: 100, l: 50, a: 1 };
  const cases: Array<[string, any]> = [
    // ['', undefined],
    // ['00bfff', hsla],
    ['transparent', { h: 0, s: 0, l: 0, a: 0 }],
    ['#00bfff', hsla],
    ['rgb(0, 191, 255)', hsla],
    ['rgba(0, 191, 255, 0.3)', { ...hsla, a: 0.3 }],
    ['hsl(195, 100%, 50%)', hsla],
    ['hsla(195, 100%, 50%, 1)', hsla],
  ];

  it.each(cases)('colors.toHslaColor(%s) => %s', (a, expected) => {
    expect(colors.toHslaColor(a)).toEqual(expected);
  });
});

describe('colors.toHslaColor(color)', function () {
  const cases: Array<[HslaColor, any]> = [
    [colors.toHslaColor('transparent'), `hsla(0, 0%, 0%, 0)`],
    [colors.toHslaColor('#00bfff'), 'hsla(195, 100%, 50%, 1)'],
    [colors.toHslaColor('rgb(0, 191, 255)'), 'hsla(195, 100%, 50%, 1)'],
    [colors.toHslaColor('rgba(0, 191, 255, 0.3)'), 'hsla(195, 100%, 50%, 0.3)'],
    [colors.toHslaColor('hsl(195, 100%, 50%)'), 'hsla(195, 100%, 50%, 1)'],
    [colors.toHslaColor('hsla(195, 100%, 50%, 1)'), 'hsla(195, 100%, 50%, 1)'],
  ];

  it.each(cases)('colors.toHslaColor(%s) => %s', (a, expected) => {
    expect(colors.toHslaString(a)).toEqual(expected);
  });
});
