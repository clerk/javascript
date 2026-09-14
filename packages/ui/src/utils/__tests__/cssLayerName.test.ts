import { logger } from '@clerk/shared/logger';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { isValidCssLayerName, sanitizeCssLayerName } from '../cssLayerName';

describe('cssLayerName', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(['components', 'clerk', 'app.components', 'theme_layer-1', '-vendor', '_x', 'a.b.c'])('accepts %s', value => {
    expect(isValidCssLayerName(value)).toBe(true);
    expect(sanitizeCssLayerName(value)).toBe(value);
  });

  it.each([
    'x} body { color: red } /*',
    'x{}</style><script>alert(1)</script>',
    'components;@import url(https://attacker.example/x)',
    'a b',
    'a.',
    '.a',
    '1abc',
    'a..b',
    '',
    ' clerk',
    'clerk\n',
  ])('rejects %j', value => {
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
