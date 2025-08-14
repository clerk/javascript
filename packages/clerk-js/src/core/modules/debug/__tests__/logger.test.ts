import { DebugLogger } from '../logger';
import type { DebugLogFilter } from '../types';

// Mock transport for testing
class MockTransport {
  public sentEntries: any[] = [];

  async send(entry: any): Promise<void> {
    this.sentEntries.push(entry);
  }

  reset(): void {
    this.sentEntries = [];
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
        const filters: DebugLogFilter[] = [{ includePatterns: ['error', 'failed'] }];
        const filteredLogger = new DebugLogger(mockTransport, 'debug', filters);

        filteredLogger.info('User login failed');
        filteredLogger.info('Operation completed successfully');
        filteredLogger.error('Database connection error');

        expect(mockTransport.sentEntries).toHaveLength(2);
        expect(mockTransport.sentEntries[0].message).toBe('User login failed');
        expect(mockTransport.sentEntries[1].message).toBe('Database connection error');
      });

      it('should include messages matching RegExp patterns', () => {
        const filters: DebugLogFilter[] = [{ includePatterns: [/error/i, /failed/i] }];
        const filteredLogger = new DebugLogger(mockTransport, 'debug', filters);

        filteredLogger.info('User login FAILED');
        filteredLogger.info('Operation completed successfully');
        filteredLogger.error('Database connection ERROR');

        expect(mockTransport.sentEntries).toHaveLength(2);
        expect(mockTransport.sentEntries[0].message).toBe('User login FAILED');
        expect(mockTransport.sentEntries[1].message).toBe('Database connection ERROR');
      });

      it('should include messages matching mixed string and RegExp patterns', () => {
        const filters: DebugLogFilter[] = [{ includePatterns: ['error', /failed/i] }];
        const filteredLogger = new DebugLogger(mockTransport, 'debug', filters);

        filteredLogger.info('User login FAILED');
        filteredLogger.info('Operation completed successfully');
        filteredLogger.error('Database connection error');

        expect(mockTransport.sentEntries).toHaveLength(2);
        expect(mockTransport.sentEntries[0].message).toBe('User login FAILED');
        expect(mockTransport.sentEntries[1].message).toBe('Database connection error');
      });

      it('should not log when no include patterns match', () => {
        const filters: DebugLogFilter[] = [{ includePatterns: ['error', 'failed'] }];
        const filteredLogger = new DebugLogger(mockTransport, 'debug', filters);

        filteredLogger.info('Operation completed successfully');
        filteredLogger.info('User logged in');

        expect(mockTransport.sentEntries).toHaveLength(0);
      });
    });

    describe('exclude pattern filtering', () => {
      it('should exclude messages matching string patterns', () => {
        const filters: DebugLogFilter[] = [{ excludePatterns: ['debug', 'trace'] }];
        const filteredLogger = new DebugLogger(mockTransport, 'debug', filters);

        filteredLogger.info('User login debug info');
        filteredLogger.info('Operation completed successfully');
        filteredLogger.error('Database connection error');

        expect(mockTransport.sentEntries).toHaveLength(2);
        expect(mockTransport.sentEntries[0].message).toBe('Operation completed successfully');
        expect(mockTransport.sentEntries[1].message).toBe('Database connection error');
      });

      it('should exclude messages matching RegExp patterns', () => {
        const filters: DebugLogFilter[] = [{ excludePatterns: [/debug/i, /trace/i] }];
        const filteredLogger = new DebugLogger(mockTransport, 'debug', filters);

        filteredLogger.info('User login DEBUG info');
        filteredLogger.info('Operation completed successfully');
        filteredLogger.error('Database connection error');

        expect(mockTransport.sentEntries).toHaveLength(2);
        expect(mockTransport.sentEntries[0].message).toBe('Operation completed successfully');
        expect(mockTransport.sentEntries[1].message).toBe('Database connection error');
      });

      it('should exclude messages matching mixed string and RegExp patterns', () => {
        const filters: DebugLogFilter[] = [{ excludePatterns: ['debug', /trace/i] }];
        const filteredLogger = new DebugLogger(mockTransport, 'debug', filters);

        filteredLogger.info('User login debug info');
        filteredLogger.info('Operation completed successfully');
        filteredLogger.error('Database connection error');

        expect(mockTransport.sentEntries).toHaveLength(2);
        expect(mockTransport.sentEntries[0].message).toBe('Operation completed successfully');
        expect(mockTransport.sentEntries[1].message).toBe('Database connection error');
      });

      it('should exclude messages containing error in the message', () => {
        const filters: DebugLogFilter[] = [{ excludePatterns: ['error'] }];
        const filteredLogger = new DebugLogger(mockTransport, 'debug', filters);

        filteredLogger.info('User login successful');
        filteredLogger.info('Operation completed successfully');
        filteredLogger.error('Database connection error');

        expect(mockTransport.sentEntries).toHaveLength(2);
        expect(mockTransport.sentEntries[0].message).toBe('User login successful');
        expect(mockTransport.sentEntries[1].message).toBe('Operation completed successfully');
      });
    });

    describe('complex filter combinations', () => {
      it('should apply multiple filters with AND logic', () => {
        const filters: DebugLogFilter[] = [{ level: 'error', source: 'auth-module' }, { includePatterns: ['failed'] }];
        const filteredLogger = new DebugLogger(mockTransport, 'debug', filters);

        filteredLogger.error('Login failed', undefined, 'auth-module');
        filteredLogger.error('Database error', undefined, 'auth-module');
        filteredLogger.info('Login failed', undefined, 'auth-module');
        filteredLogger.error('Login failed', undefined, 'other-module');

        expect(mockTransport.sentEntries).toHaveLength(1);
        expect(mockTransport.sentEntries[0].message).toBe('Login failed');
        expect(mockTransport.sentEntries[0].level).toBe('error');
        expect(mockTransport.sentEntries[0].source).toBe('auth-module');
      });

      it('should handle empty filter arrays', () => {
        const filteredLogger = new DebugLogger(mockTransport, 'debug', []);

        filteredLogger.info('test message');
        filteredLogger.warn('test warning');

        expect(mockTransport.sentEntries).toHaveLength(2);
      });

      it('should handle undefined filters', () => {
        const filteredLogger = new DebugLogger(mockTransport, 'debug', undefined);

        filteredLogger.info('test message');
        filteredLogger.warn('test warning');

        expect(mockTransport.sentEntries).toHaveLength(2);
      });
    });

    describe('edge cases', () => {
      it('should handle empty string patterns', () => {
        const filters: DebugLogFilter[] = [{ includePatterns: [''] }];
        const filteredLogger = new DebugLogger(mockTransport, 'debug', filters);

        filteredLogger.info('any message');

        expect(mockTransport.sentEntries).toHaveLength(1);
      });

      it('should handle empty RegExp patterns', () => {
        const filters: DebugLogFilter[] = [{ includePatterns: [/.*/] }];
        const filteredLogger = new DebugLogger(mockTransport, 'debug', filters);

        filteredLogger.info('any message');

        expect(mockTransport.sentEntries).toHaveLength(1);
      });

      it('should handle special RegExp characters in string patterns', () => {
        const filters: DebugLogFilter[] = [{ includePatterns: ['user.*login'] }];
        const filteredLogger = new DebugLogger(mockTransport, 'debug', filters);

        filteredLogger.info('user.*login attempt');
        filteredLogger.info('user login attempt');

        expect(mockTransport.sentEntries).toHaveLength(1);
        expect(mockTransport.sentEntries[0].message).toBe('user.*login attempt');
      });

      it('should handle case-sensitive RegExp patterns', () => {
        const filters: DebugLogFilter[] = [{ includePatterns: [/ERROR/] }];
        const filteredLogger = new DebugLogger(mockTransport, 'debug', filters);

        filteredLogger.info('Database ERROR');
        filteredLogger.info('Database error');

        expect(mockTransport.sentEntries).toHaveLength(1);
        expect(mockTransport.sentEntries[0].message).toBe('Database ERROR');
      });

      it('should handle multiple include and exclude patterns', () => {
        const filters: DebugLogFilter[] = [{ includePatterns: ['error', 'failed'], excludePatterns: ['debug'] }];
        const filteredLogger = new DebugLogger(mockTransport, 'debug', filters);

        filteredLogger.info('Login failed');
        filteredLogger.info('Database error debug info');
        filteredLogger.info('Operation completed successfully');

        expect(mockTransport.sentEntries).toHaveLength(1);
        expect(mockTransport.sentEntries[0].message).toBe('Login failed');
      });
    });
  });

  describe('log entry structure', () => {
    it('should generate proper log entry structure', () => {
      const context = { userId: '123' };
      const source = 'test-module';

      logger.info('test message', context, source);

      expect(mockTransport.sentEntries).toHaveLength(1);
      const entry = mockTransport.sentEntries[0];

      expect(entry).toHaveProperty('timestamp');
      expect(entry).toHaveProperty('level');
      expect(entry).toHaveProperty('message');
      expect(entry).toHaveProperty('context');
      expect(entry).toHaveProperty('source');

      expect(typeof entry.timestamp).toBe('number');
      expect(entry.level).toBe('info');
      expect(entry.message).toBe('test message');
      expect(entry.context).toEqual(context);
      expect(entry.source).toBe(source);
    });

    it('should use current timestamp for log entries', () => {
      const before = Date.now();
      logger.info('test message');
      const after = Date.now();

      expect(mockTransport.sentEntries).toHaveLength(1);
      const timestamp = mockTransport.sentEntries[0].timestamp;
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });
  });
});
