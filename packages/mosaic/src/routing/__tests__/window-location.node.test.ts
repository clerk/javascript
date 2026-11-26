// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { isSameOrigin, markSettled, readWindowUrl, writeWindowUrl } from '../window-location';

describe('without a window', () => {
  it('reads nothing, refuses nothing and writes nothing instead of throwing', () => {
    expect(typeof window).toBe('undefined');
    expect(readWindowUrl()).toBeUndefined();
    expect(isSameOrigin('/user/security')).toBe(true);
    expect(() => writeWindowUrl('/user/security', false)).not.toThrow();
    expect(() => markSettled()).not.toThrow();
  });
});
