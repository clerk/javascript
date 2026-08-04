import { describe, expect, it } from 'vitest';

import { isClerkTestPhoneNumber } from '../clerkTestPhoneNumber';

describe('isClerkTestPhoneNumber', () => {
  it('matches numbers in the 555-01XX test range', () => {
    expect(isClerkTestPhoneNumber('+12015550100')).toBe(true);
    expect(isClerkTestPhoneNumber('+12015550199')).toBe(true);
  });

  it('ignores formatting', () => {
    expect(isClerkTestPhoneNumber('+1 (201) 555-0100')).toBe(true);
  });

  it('rejects numbers outside the test range', () => {
    expect(isClerkTestPhoneNumber('+12015550200')).toBe(false);
    expect(isClerkTestPhoneNumber('+12015551234')).toBe(false);
  });

  it('rejects empty or partial input', () => {
    expect(isClerkTestPhoneNumber('')).toBe(false);
    expect(isClerkTestPhoneNumber('+1201')).toBe(false);
  });
});
