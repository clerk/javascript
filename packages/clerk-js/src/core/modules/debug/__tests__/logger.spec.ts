import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { DebugLogger } from '../logger';
import type { DebugLogEntry } from '../types';

class MockTransport {
  public sentEntries: DebugLogEntry[] = [];

  async send(entry: DebugLogEntry): Promise<void> {
    this.sentEntries.push(entry);
  }

  reset(): void {
    this.sentEntries.length = 0;
  }
}

describe('DebugLogger', () => {
  let logger: DebugLogger;
  let mockTransport: MockTransport;

  beforeEach(() => {
    mockTransport = new MockTransport();
    logger = new DebugLogger(mockTransport, 'debug');
  });

  afterEach(() => {
    mockTransport.reset();
  });

  describe('basic logging functionality', () => {
    it('should log messages at appropriate levels', () => {
      logger.error('error message');
      logger.warn('warn message');
      logger.info('info message');
      logger.debug('debug message');

      expect(mockTransport.sentEntries).toHaveLength(4);
      expect(mockTransport.sentEntries[0].level).toBe('error');
      expect(mockTransport.sentEntries[1].level).toBe('warn');
      expect(mockTransport.sentEntries[2].level).toBe('info');
      expect(mockTransport.sentEntries[3].level).toBe('debug');
    });

    it('should include context and source in log entries', () => {
      const context = { userId: '123', action: 'test' };
      const source = 'test-module';

      logger.info('test message', context, source);

      expect(mockTransport.sentEntries).toHaveLength(1);
      expect(mockTransport.sentEntries[0].context).toEqual(context);
      expect(mockTransport.sentEntries[0].source).toBe(source);
    });

    it('should respect log level filtering', () => {
      const infoLogger = new DebugLogger(mockTransport, 'info');

      infoLogger.debug('debug message');
      infoLogger.info('info message');
      infoLogger.warn('warn message');
      infoLogger.error('error message');

      expect(mockTransport.sentEntries).toHaveLength(3);
      expect(mockTransport.sentEntries.map(e => e.level)).toEqual(['info', 'warn', 'error']);
    });
  });

  describe('edge cases', () => {
    it('should handle undefined context', () => {
      logger.info('message with undefined context', undefined);

      expect(mockTransport.sentEntries).toHaveLength(1);
      expect(mockTransport.sentEntries[0].context).toBeUndefined();
    });

    it('should handle undefined source', () => {
      logger.info('message with undefined source', {}, undefined);

      expect(mockTransport.sentEntries).toHaveLength(1);
      expect(mockTransport.sentEntries[0].source).toBeUndefined();
    });

    it('should handle empty context object', () => {
      logger.info('message with empty context', {});

      expect(mockTransport.sentEntries).toHaveLength(1);
      expect(mockTransport.sentEntries[0].context).toEqual({});
    });

    it('should handle empty source string', () => {
      logger.info('message with empty source', {}, '');

      expect(mockTransport.sentEntries).toHaveLength(1);
      expect(mockTransport.sentEntries[0].source).toBe('');
    });
  });

  describe('transport integration', () => {
    it('should call transport.send for each log entry', async () => {
      let sendCallCount = 0;
      const countingTransport = {
        async send(_entry: DebugLogEntry): Promise<void> {
          sendCallCount++;
        },
      };

      const testLogger = new DebugLogger(countingTransport, 'info');

      testLogger.info('message 1');
      testLogger.warn('message 2');
      testLogger.error('message 3');

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(sendCallCount).toBe(3);
    });

    it('should include timestamp in log entries', () => {
      const beforeTime = Date.now();
      logger.info('test message');
      const afterTime = Date.now();

      expect(mockTransport.sentEntries).toHaveLength(1);
      expect(mockTransport.sentEntries[0].timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(mockTransport.sentEntries[0].timestamp).toBeLessThanOrEqual(afterTime);
    });
  });
});
