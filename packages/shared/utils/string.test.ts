import { isIPV4Address, titleize } from './string';

describe('isIPV4Address(str)', () => {
  it('checks if as string is an IP V4', () => {
    expect(isIPV4Address(null)).toBe(false);
    expect(isIPV4Address(undefined)).toBe(false);
    expect(isIPV4Address('')).toBe(false);
    expect(isIPV4Address('127.0.0.1')).toBe(true);
  });
});

describe('titleize(str)', () => {
  it('titleizes the string', () => {
    expect(titleize(null)).toBe('');
    expect(titleize(undefined)).toBe('');
    expect(titleize('')).toBe('');
    expect(titleize('foo')).toBe('Foo');
    expect(titleize('foo bar')).toBe('Foo bar');
  });
});
