import { describe, expect, it } from 'vitest';

import { httpsUrl, logoShape } from '../auth.utils';

describe('httpsUrl', () => {
  it('keeps an https link and drops any other scheme or an unparsable value', () => {
    expect(httpsUrl('https://acme.com/support')).toBe('https://acme.com/support');
    expect(httpsUrl('javascript:alert(1)')).toBeUndefined();
    expect(httpsUrl('http://acme.com/support')).toBeUndefined();
    expect(httpsUrl('data:text/html,hi')).toBeUndefined();
    expect(httpsUrl('/support')).toBeUndefined();
    expect(httpsUrl(undefined)).toBeUndefined();
  });
});

describe('logoShape', () => {
  it('treats a logo up to a quarter wider than tall as square, and anything wider as a wordmark', () => {
    expect(logoShape(64, 64)).toBe('square');
    expect(logoShape(80, 64)).toBe('square');
    expect(logoShape(81, 64)).toBe('wide');
    expect(logoShape(240, 48)).toBe('wide');
    expect(logoShape(48, 96)).toBe('square');
  });

  it('treats an image with no height as wide, so it never becomes a badge', () => {
    expect(logoShape(64, 0)).toBe('wide');
  });
});
