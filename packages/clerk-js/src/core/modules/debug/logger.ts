import type { DebugLogEntry, DebugLogLevel, DebugTransport } from './types';

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
  private readonly logLevel: DebugLogLevel;
  private readonly transport: DebugTransport;

  /**
   * Creates a new debug logger.
   *
   * @param transport - Transport used to send log entries
   * @param logLevel - Minimum log level to record. Defaults to `'debug'`
   */
  constructor(transport: DebugTransport, logLevel?: DebugLogLevel) {
    this.transport = transport;
    this.logLevel = logLevel ?? DEFAULT_LOG_LEVEL;
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

  // trace level removed

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
    const levels: DebugLogLevel[] = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }
}
