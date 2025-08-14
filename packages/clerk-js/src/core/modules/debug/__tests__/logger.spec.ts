import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { DebugLogger } from '../logger';
import type { DebugLogEntry, DebugLogFilter } from '../types';

// Mock transport for testing
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
    logger = new DebugLogger(mockTransport, 'trace');
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
      logger.trace('trace message');

      expect(mockTransport.sentEntries).toHaveLength(5);
      expect(mockTransport.sentEntries[0].level).toBe('error');
      expect(mockTransport.sentEntries[1].level).toBe('warn');
      expect(mockTransport.sentEntries[2].level).toBe('info');
      expect(mockTransport.sentEntries[3].level).toBe('debug');
      expect(mockTransport.sentEntries[4].level).toBe('trace');
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

      infoLogger.trace('trace message');
      infoLogger.debug('debug message');
      infoLogger.info('info message');
      infoLogger.warn('warn message');
      infoLogger.error('error message');

      expect(mockTransport.sentEntries).toHaveLength(3);
      expect(mockTransport.sentEntries.map(e => e.level)).toEqual(['info', 'warn', 'error']);
    });
  });

  describe('filter functionality', () => {
    describe('level filtering', () => {
      it('should filter by specific log level', () => {
        const filters: DebugLogFilter[] = [{ level: 'error' }];
        const filteredLogger = new DebugLogger(mockTransport, 'debug', filters);

        filteredLogger.info('info message');
        filteredLogger.warn('warn message');
        filteredLogger.error('error message');

        expect(mockTransport.sentEntries).toHaveLength(1);
        expect(mockTransport.sentEntries[0].level).toBe('error');
      });

      it('should allow all levels when no level filter is specified', () => {
        const filters: DebugLogFilter[] = [{}];
        const filteredLogger = new DebugLogger(mockTransport, 'debug', filters);

        filteredLogger.info('info message');
        filteredLogger.warn('warn message');
        filteredLogger.error('error message');

        expect(mockTransport.sentEntries).toHaveLength(3);
      });
    });

    describe('source filtering', () => {
      it('should filter by exact string source', () => {
        const filters: DebugLogFilter[] = [{ source: 'auth-module' }];
        const filteredLogger = new DebugLogger(mockTransport, 'debug', filters);

        filteredLogger.info('message 1', undefined, 'auth-module');
        filteredLogger.info('message 2', undefined, 'other-module');
        filteredLogger.info('message 3', undefined, 'auth-module');

        expect(mockTransport.sentEntries).toHaveLength(2);
        expect(mockTransport.sentEntries[0].source).toBe('auth-module');
        expect(mockTransport.sentEntries[1].source).toBe('auth-module');
      });

      it('should filter by RegExp source pattern', () => {
        const filters: DebugLogFilter[] = [{ source: /auth-.*/ }];
        const filteredLogger = new DebugLogger(mockTransport, 'debug', filters);

        filteredLogger.info('message 1', undefined, 'auth-module');
        filteredLogger.info('message 2', undefined, 'auth-service');
        filteredLogger.info('message 3', undefined, 'other-module');

        expect(mockTransport.sentEntries).toHaveLength(2);
        expect(mockTransport.sentEntries[0].source).toBe('auth-module');
        expect(mockTransport.sentEntries[1].source).toBe('auth-service');
      });

      it('should not log when source is undefined and filter expects a source', () => {
        const filters: DebugLogFilter[] = [{ source: 'auth-module' }];
        const filteredLogger = new DebugLogger(mockTransport, 'debug', filters);

        filteredLogger.info('message without source');

        expect(mockTransport.sentEntries).toHaveLength(0);
      });
    });

    describe('include pattern filtering', () => {
      it('should include messages matching string patterns', () => {
        const filters: DebugLogFilter[] = [{ includePatterns: ['user', 'auth'] }];
        const filteredLogger = new DebugLogger(mockTransport, 'debug', filters);

        filteredLogger.info('user login successful');
        filteredLogger.info('auth token refreshed');
        filteredLogger.info('database connection established');

        expect(mockTransport.sentEntries).toHaveLength(2);
        expect(mockTransport.sentEntries[0].message).toBe('user login successful');
        expect(mockTransport.sentEntries[1].message).toBe('auth token refreshed');
      });

      it('should include messages matching RegExp patterns', () => {
        const filters: DebugLogFilter[] = [{ includePatterns: [/user-.*/] }];
        const filteredLogger = new DebugLogger(mockTransport, 'debug', filters);

        filteredLogger.info('user-123 logged in');
        filteredLogger.info('user-456 logged out');
        filteredLogger.info('admin panel accessed');

        expect(mockTransport.sentEntries).toHaveLength(2);
        expect(mockTransport.sentEntries[0].message).toBe('user-123 logged in');
        expect(mockTransport.sentEntries[1].message).toBe('user-456 logged out');
      });
    });

    describe('exclude pattern filtering', () => {
      it('should exclude messages matching string patterns', () => {
        const filters: DebugLogFilter[] = [{ excludePatterns: ['debug', 'test'] }];
        const filteredLogger = new DebugLogger(mockTransport, 'debug', filters);

        filteredLogger.info('user login successful');
        filteredLogger.info('debug information logged');
        filteredLogger.info('test data generated');

        expect(mockTransport.sentEntries).toHaveLength(1);
        expect(mockTransport.sentEntries[0].message).toBe('user login successful');
      });

      it('should exclude messages matching RegExp patterns', () => {
        const filters: DebugLogFilter[] = [{ excludePatterns: [/test-.*/] }];
        const filteredLogger = new DebugLogger(mockTransport, 'debug', filters);

        filteredLogger.info('user login successful');
        filteredLogger.info('test-123 created');
        filteredLogger.info('test-456 deleted');

        expect(mockTransport.sentEntries).toHaveLength(1);
        expect(mockTransport.sentEntries[0].message).toBe('user login successful');
      });
    });

    // Note: userId and sessionId filtering are defined in types but not yet implemented
    // These tests are commented out until the feature is implemented
    /*
    describe('userId filtering', () => {
      it('should filter by specific userId', () => {
        const filters: DebugLogFilter[] = [{ userId: 'user-123' }];
        const filteredLogger = new DebugLogger(mockTransport, 'debug', filters);

        filteredLogger.info('message 1', { userId: 'user-123' });
        filteredLogger.info('message 2', { userId: 'user-456' });
        filteredLogger.info('message 3', { userId: 'user-123' });

        expect(mockTransport.sentEntries).toHaveLength(2);
        expect(mockTransport.sentEntries[0].context?.userId).toBe('user-123');
        expect(mockTransport.sentEntries[1].context?.userId).toBe('user-123');
      });

      it('should not log when userId is undefined and filter expects a userId', () => {
        const filters: DebugLogFilter[] = [{ userId: 'user-123' }];
        const filteredLogger = new DebugLogger(mockTransport, 'debug', filters);

        filteredLogger.info('message without userId');

        expect(mockTransport.sentEntries).toHaveLength(0);
      });
    });

    describe('sessionId filtering', () => {
      it('should filter by specific sessionId', () => {
        const filters: DebugLogFilter[] = [{ sessionId: 'session-abc' }];
        const filteredLogger = new DebugLogger(mockTransport, 'debug', filters);

        filteredLogger.info('message 1', { sessionId: 'session-abc' });
        filteredLogger.info('message 2', { sessionId: 'session-xyz' });
        filteredLogger.info('message 3', { sessionId: 'session-abc' });

        expect(mockTransport.sentEntries).toHaveLength(2);
        expect(mockTransport.sentEntries[0].context?.sessionId).toBe('session-abc');
        expect(mockTransport.sentEntries[1].context?.sessionId).toBe('session-abc');
      });

      it('should not log when sessionId is undefined and filter expects a sessionId', () => {
        const filters: DebugLogFilter[] = [{ sessionId: 'session-abc' }];
        const filteredLogger = new DebugLogger(mockTransport, 'debug', filters);

        filteredLogger.info('message without sessionId');

        expect(mockTransport.sentEntries).toHaveLength(0);
      });
    });
    */

    describe('combined filtering', () => {
      it('should apply multiple filters with AND logic', () => {
        const filters: DebugLogFilter[] = [
          { level: 'error' },
          { source: 'auth-module' },
          { includePatterns: ['failed'] },
        ];
        const filteredLogger = new DebugLogger(mockTransport, 'debug', filters);

        filteredLogger.error('login failed', undefined, 'auth-module');
        filteredLogger.error('login successful', undefined, 'auth-module');
        filteredLogger.warn('login failed', undefined, 'auth-module');
        filteredLogger.error('login failed', undefined, 'other-module');

        expect(mockTransport.sentEntries).toHaveLength(1);
        expect(mockTransport.sentEntries[0].message).toBe('login failed');
        expect(mockTransport.sentEntries[0].level).toBe('error');
        expect(mockTransport.sentEntries[0].source).toBe('auth-module');
      });

      it('should handle empty filters array', () => {
        const filters: DebugLogFilter[] = [];
        const filteredLogger = new DebugLogger(mockTransport, 'debug', filters);

        filteredLogger.info('message 1');
        filteredLogger.warn('message 2');
        filteredLogger.error('message 3');

        expect(mockTransport.sentEntries).toHaveLength(3);
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

        // Allow async operations to complete
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
});
