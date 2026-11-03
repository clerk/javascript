import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { unixEpochToDate } from '../date';

describe('date utilities', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(Date.now());
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe('unixEpochToDate', () => {
    it('converts a unix epoch to Date', function () {
      const epoch = 1622575087;
      const date = unixEpochToDate(epoch);
      expect(date.getTime()).toBe(epoch);
    });

    it('fallbacks to current date for undefined values', function () {
      const date = unixEpochToDate(undefined);
      expect(date.getTime()).toBe(Date.now());
    });

    it('fallbacks to current date for invalid values', function () {
      const date = unixEpochToDate('a very strange value' as any);
      expect(date.getTime()).toBe(Date.now());
    });
  });
});
