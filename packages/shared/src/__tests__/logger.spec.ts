import { afterAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { logger } from '../logger';

describe('logger', () => {
  describe('warnOnce', () => {
    const warnMock = vi.spyOn(global.console, 'warn').mockImplementation(() => {});

    beforeEach(() => warnMock.mockClear());
    afterAll(() => warnMock.mockRestore());

    test('warns only once per session', () => {
      logger.warnOnce('testwarn');
      logger.warnOnce('testwarn');
      logger.warnOnce('testwarn');

      expect(warnMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('logOnce', () => {
    const logMock = vi.spyOn(global.console, 'log').mockImplementation(() => {});

    beforeEach(() => logMock.mockClear());
    afterAll(() => logMock.mockRestore());

    test('logs only once per session', () => {
      logger.logOnce('testlog');
      logger.logOnce('testlog');
      logger.logOnce('testlog');

      expect(logMock).toHaveBeenCalledTimes(1);
    });
  });
});
