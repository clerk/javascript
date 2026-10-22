import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { unixEpochToDate, unixEpochToDeadline } from '../date';

describe('date utilities', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(Date.now());
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe('unixEpochToDate', () => {
    it('fallbacks to current date for zero', function () {
      expect(unixEpochToDate(0).getTime()).toBe(Date.now());
    });

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

  describe('unixEpochToDeadline', () => {
    it('keeps zero as Unix epoch zero', () => {
      expect(unixEpochToDeadline(0).getTime()).toBe(0);
    });

    it('converts a unix epoch to Date', () => {
      expect(unixEpochToDeadline(1622575087).getTime()).toBe(1622575087);
    });

    it('fallbacks to current date for undefined values', () => {
      expect(unixEpochToDeadline(undefined).getTime()).toBe(Date.now());
    });
  });
});
