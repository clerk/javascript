import type { DebugLogEntry, DebugLogFilter, DebugLogLevel, DebugTransport } from './types';

/**
 * Default log level for debug logging
 */
const DEFAULT_LOG_LEVEL: DebugLogLevel = 'debug';

/**
 * Minimal debug logger interface for engineers.
 *
 * @public
 */
export class DebugLogger {
  private readonly filters?: DebugLogFilter[];
  private readonly logLevel: DebugLogLevel;
  private readonly transport: DebugTransport;

  /**
   * Creates a new debug logger.
   *
   * @param transport - Transport used to send log entries
   * @param logLevel - Minimum log level to record. Defaults to `'debug'`
   * @param filters - Optional list of filters to include or exclude messages
   */
  constructor(transport: DebugTransport, logLevel?: DebugLogLevel, filters?: DebugLogFilter[]) {
    this.transport = transport;
    this.logLevel = logLevel ?? DEFAULT_LOG_LEVEL;
    this.filters = filters;
  }

  /**
   * Log a debug message.
   *
   * @param message - Text description of the event
   * @param context - Optional structured context to attach
   * @param source - Optional logical source identifier
   */
  debug(message: string, context?: Record<string, unknown>, source?: string): void {
    this.log('debug', message, context, source);
  }

  /**
   * Log an error message.
   *
   * @param message - Text description of the event
   * @param context - Optional structured context to attach
   * @param source - Optional logical source identifier
   */
  error(message: string, context?: Record<string, unknown>, source?: string): void {
    this.log('error', message, context, source);
  }

  /**
   * Log an informational message.
   *
   * @param message - Text description of the event
   * @param context - Optional structured context to attach
   * @param source - Optional logical source identifier
   */
  info(message: string, context?: Record<string, unknown>, source?: string): void {
    this.log('info', message, context, source);
  }

  /**
   * Log a trace message.
   *
   * @param message - Text description of the event
   * @param context - Optional structured context to attach
   * @param source - Optional logical source identifier
   */
  trace(message: string, context?: Record<string, unknown>, source?: string): void {
    this.log('trace', message, context, source);
  }

  /**
   * Log a warning message.
   *
   * @param message - Text description of the event
   * @param context - Optional structured context to attach
   * @param source - Optional logical source identifier
   */
  warn(message: string, context?: Record<string, unknown>, source?: string): void {
    this.log('warn', message, context, source);
  }

  private log(level: DebugLogLevel, message: string, context?: Record<string, unknown>, source?: string): void {
    if (!this.shouldLogLevel(level)) {
      return;
    }

    if (!this.shouldLogFilters(level, message, source)) {
      return;
    }

    const entry: DebugLogEntry = {
      timestamp: Date.now(),
      level,
      message,
      context,
      source,
    };

    this.transport.send(entry).catch(err => {
      console.error('Failed to send log entry:', err);
    });
  }

  private shouldLogLevel(level: DebugLogLevel): boolean {
    const levels: DebugLogLevel[] = ['error', 'warn', 'info', 'debug', 'trace'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  private shouldLogFilters(level: DebugLogLevel, message: string, source?: string): boolean {
    if (!this.filters || this.filters.length === 0) {
      return true;
    }

    return this.filters.every(filter => {
      if (filter.level && filter.level !== level) {
        return false;
      }

      if (filter.source && !this.matchesSource(filter.source, source)) {
        return false;
      }

      if (
        filter.includePatterns &&
        filter.includePatterns.length > 0 &&
        !this.shouldInclude(message, filter.includePatterns)
      ) {
        return false;
      }

      if (
        filter.excludePatterns &&
        filter.excludePatterns.length > 0 &&
        this.shouldExclude(message, filter.excludePatterns)
      ) {
        return false;
      }

      return true;
    });
  }

  /**
   * Checks if a source matches the given pattern (string or RegExp)
   */
  private matchesSource(pattern: string | RegExp, source?: string): boolean {
    if (typeof pattern === 'string') {
      return source === pattern;
    }
    return source !== undefined && pattern.test(source);
  }

  /**
   * Checks if a message should be included based on the given patterns
   */
  private shouldInclude(message: string, patterns: (string | RegExp)[]): boolean {
    return patterns.some(pattern => this.matchesPattern(message, pattern));
  }

  /**
   * Checks if a message should be excluded based on the given patterns
   */
  private shouldExclude(message: string, patterns: (string | RegExp)[]): boolean {
    return patterns.some(pattern => this.matchesPattern(message, pattern));
  }

  /**
   * Checks if a message matches a given pattern (string or RegExp)
   */
  private matchesPattern(message: string, pattern: string | RegExp): boolean {
    if (typeof pattern === 'string') {
      return message.includes(pattern);
    }
    return pattern.test(message);
  }
}
