import { afterEach, describe, expect, it } from 'vitest';

import { getOAuthDeviceUserCodeFromSearch, isValidOAuthDeviceUserCode, normalizeOAuthDeviceUserCode } from '../utils';

describe('OAuth device user codes', () => {
  const originalLocation = window.location;

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it.each([
    ['bfws-zbzm', 'BFWSZBZM'],
    [' bfws\t-\nzbzm ', 'BFWSZBZM'],
    ['BFWSZBZM', 'BFWSZBZM'],
    ['BFWS_ZBZM', 'BFWS_ZBZM'],
  ])('normalizes %j to %j', (input, expected) => {
    expect(normalizeOAuthDeviceUserCode(input)).toBe(expected);
  });

  it('removes Unicode whitespace and preserves other invalid characters', () => {
    expect(normalizeOAuthDeviceUserCode('bfws\u00a0-\u2003zb!m')).toBe('BFWSZB!M');
  });

  it.each(['bfws-zbzm', ' BFWS ZBZM ', 'bfwsz bzm'])('accepts a valid forgiving input %j', input => {
    expect(isValidOAuthDeviceUserCode(input)).toBe(true);
  });

  it.each(['AEIO-BCDF', 'BFWS-ZB2M', 'BFWS_ZBZM', 'BFWS-ZBZ', 'BFWS-ZBZMM'])('rejects %j', input => {
    expect(isValidOAuthDeviceUserCode(input)).toBe(false);
  });

  it('reads user_code from the URL', () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, search: '?user_code=BFWS-ZBZM' },
    });

    expect(getOAuthDeviceUserCodeFromSearch()).toBe('BFWS-ZBZM');
  });
});
