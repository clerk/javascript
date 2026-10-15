import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { unixEpochToDate, unixEpochToSessionDeadline } from '../date';

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

    it('fallbacks to current date for a zero epoch', function () {
      expect(unixEpochToDate(0).getTime()).toBe(Date.now());
    });
  });

  describe('unixEpochToSessionDeadline', () => {
    it('preserves an unset session deadline', () => {
      expect(unixEpochToSessionDeadline(0).getTime()).toBe(0);
    });

    it('converts a finite session deadline to Date', () => {
      expect(unixEpochToSessionDeadline(2000000000000).getTime()).toBe(2000000000000);
    });

    it('fallbacks to current date for undefined and invalid values', () => {
      expect(unixEpochToSessionDeadline(undefined).getTime()).toBe(Date.now());
      expect(unixEpochToSessionDeadline('a very strange value' as any).getTime()).toBe(Date.now());
    });
  });
});
