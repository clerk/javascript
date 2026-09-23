import { logger } from '@clerk/shared/logger';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { isValidCssLayerName, sanitizeCssLayerName } from '../cssLayerName';

// https://drafts.csswg.org/css-syntax-3/#non-ascii-ident-code-point
const NON_ASCII_IDENT_RANGES: Array<[number, number]> = [
  [0x00b7, 0x00b7],
  [0x00c0, 0x00d6],
  [0x00d8, 0x00f6],
  [0x00f8, 0x037d],
  [0x037f, 0x1fff],
  [0x200c, 0x200d],
  [0x203f, 0x2040],
  [0x2070, 0x218f],
  [0x2c00, 0x2fef],
  [0x3001, 0xd7ff],
  [0xf900, 0xfdcf],
  [0xfdf0, 0xfffd],
  [0x10000, 0x10ffff],
];
const inNonAsciiIdentRanges = (cp: number) => NON_ASCII_IDENT_RANGES.some(([lo, hi]) => cp >= lo && cp <= hi);
const hex = (cp: number) => `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`;
const rangeEdges = [...new Set(NON_ASCII_IDENT_RANGES.flatMap(([lo, hi]) => [lo, hi]))].map(cp => ({
  cp,
  label: hex(cp),
}));
const rangeNeighbours = [...new Set(NON_ASCII_IDENT_RANGES.flatMap(([lo, hi]) => [lo - 1, hi + 1]))]
  .filter(cp => cp <= 0x10ffff && !inNonAsciiIdentRanges(cp))
  .map(cp => ({ cp, label: hex(cp) }));

describe('cssLayerName', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    'components',
    'clerk',
    'app.components',
    'theme_layer-1',
    '-vendor',
    '--vendor',
    '--',
    '---',
    '--1',
    '_x',
    'a.b.c',
    'a.--b',
    'clérk',
    '-é',
    'レイヤー',
    '\u{1F600}',
    'inherits',
    'revert-layers',
  ])('accepts %s', value => {
    const warn = vi.spyOn(logger, 'warnOnce').mockImplementation(() => {});
    expect(isValidCssLayerName(value)).toBe(true);
    expect(sanitizeCssLayerName(value)).toBe(value);
    expect(warn).not.toHaveBeenCalled();
  });

  it.each(rangeEdges)('accepts non-ASCII ident code point $label as start and continuation', ({ cp }) => {
    const char = String.fromCodePoint(cp);
    expect(isValidCssLayerName(char)).toBe(true);
    expect(isValidCssLayerName(`a${char}`)).toBe(true);
  });

  it.each(rangeNeighbours)('rejects excluded code point $label as start and continuation', ({ cp }) => {
    const char = String.fromCodePoint(cp);
    expect(isValidCssLayerName(char)).toBe(false);
    expect(isValidCssLayerName(`a${char}`)).toBe(false);
  });

  it.each([
    'x} body { color: red } /*',
    'x{}</style><script>alert(1)</script>',
    'components;@import url(https://attacker.example/x)',
    'a b',
    'a.',
    '.a',
    '1abc',
    '-1abc',
    'a..b',
    '',
    ' clerk',
    'clerk\n',
    'a\\}b',
    'a\u00A0b',
    'a\u2028b',
    'a\u00D7b',
  ])('rejects %j', value => {
    expect(isValidCssLayerName(value)).toBe(false);
  });

  it.each([
    'initial',
    'inherit',
    'unset',
    'revert',
    'revert-layer',
    'revert-rule',
    'INITIAL',
    'app.revert',
    'App.Revert-Layer',
  ])('rejects the CSS-wide keyword %s', value => {
    expect(isValidCssLayerName(value)).toBe(false);
  });

  it('returns undefined and warns once for an invalid name', () => {
    const warn = vi.spyOn(logger, 'warnOnce').mockImplementation(() => {});
    expect(sanitizeCssLayerName('x} body { color: red } /*')).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('cssLayerName');
  });

  it('returns undefined without warning for an empty value', () => {
    const warn = vi.spyOn(logger, 'warnOnce').mockImplementation(() => {});
    expect(sanitizeCssLayerName(undefined)).toBeUndefined();
    expect(sanitizeCssLayerName('')).toBeUndefined();
    expect(warn).not.toHaveBeenCalled();
  });
});
