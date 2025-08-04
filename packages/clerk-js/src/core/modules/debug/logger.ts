import type { DebugLogEntry, DebugLogFilter, DebugLogLevel, DebugTransport } from './types';

/**
 * Default log level for debug logging
 */
const DEFAULT_LOG_LEVEL: DebugLogLevel = 'debug';

/**
 * Minimal debug logger interface for engineers
 */
export class DebugLogger {
  private readonly transport: DebugTransport;
  private readonly logLevel: DebugLogLevel;
  private readonly filters?: DebugLogFilter[];

  constructor(transport: DebugTransport, logLevel?: DebugLogLevel, filters?: DebugLogFilter[]) {
    this.transport = transport;
    this.logLevel = logLevel ?? DEFAULT_LOG_LEVEL;
    this.filters = filters;
  }

  error(message: string, context?: Record<string, unknown>, source?: string): void {
    this.log('error', message, context, source);
  }

  warn(message: string, context?: Record<string, unknown>, source?: string): void {
    this.log('warn', message, context, source);
  }

  info(message: string, context?: Record<string, unknown>, source?: string): void {
    this.log('info', message, context, source);
  }

  debug(message: string, context?: Record<string, unknown>, source?: string): void {
    this.log('debug', message, context, source);
  }

  trace(message: string, context?: Record<string, unknown>, source?: string): void {
    this.log('trace', message, context, source);
  }

  private log(level: DebugLogLevel, message: string, context?: Record<string, unknown>, source?: string): void {
    if (!this.shouldLogLevel(level)) {
      return;
    }

    if (!this.shouldLogFilters(level, message, source)) {
      return;
    }

    const entry: DebugLogEntry = {
      id: crypto.randomUUID(),
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

      if (filter.source) {
        if (typeof filter.source === 'string') {
          if (source !== filter.source) {
            return false;
          }
        } else if (filter.source instanceof RegExp) {
          if (!source || !filter.source.test(source)) {
            return false;
          }
        }
      }

      if (filter.includePatterns && filter.includePatterns.length > 0) {
        const matchesInclude = filter.includePatterns.some(pattern => {
          if (typeof pattern === 'string') {
            return message.includes(pattern);
          }
          return pattern.test(message);
        });
        if (!matchesInclude) {
          return false;
        }
      }

      if (filter.excludePatterns && filter.excludePatterns.length > 0) {
        const matchesExclude = filter.excludePatterns.some(pattern => {
          if (typeof pattern === 'string') {
            return message.includes(pattern);
          }
          return pattern.test(message);
        });
        if (matchesExclude) {
          return false;
        }
      }

      return true;
    });
  }
}
