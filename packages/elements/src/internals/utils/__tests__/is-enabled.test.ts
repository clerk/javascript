import { isEnabled } from '../is-enabled';

describe('isEnabled', () => {
  it('returns true for true', () => {
    expect(isEnabled(true)).toBe(true);
  });

  it('returns true for "true"', () => {
    expect(isEnabled('true')).toBe(true);
  });

  it('returns true for 1', () => {
    expect(isEnabled(1)).toBe(true);
  });

  it('returns true for "1"', () => {
    expect(isEnabled('1')).toBe(true);
  });

  it('returns false for false', () => {
    expect(isEnabled(false)).toBe(false);
  });

  it('returns false for "false"', () => {
    expect(isEnabled('false')).toBe(false);
  });

  it('returns false for 0', () => {
    expect(isEnabled(0)).toBe(false);
  });

  it('returns false for "0"', () => {
    expect(isEnabled('0')).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isEnabled(undefined)).toBe(false);
  });
});
