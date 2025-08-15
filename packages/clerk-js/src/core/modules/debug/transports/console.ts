import type { DebugLogEntry, DebugTransport } from '../types';

/**
 * ANSI color codes for console output
 */
const COLORS = {
  blue: '\x1b[34m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  gray: '\x1b[90m',
  green: '\x1b[32m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  white: '\x1b[37m',
  yellow: '\x1b[33m',
} as const;

/**
 * Color mapping for different log levels
 */
const LEVEL_COLORS = {
  debug: COLORS.green,
  error: COLORS.red,
  info: COLORS.blue,
  trace: COLORS.magenta,
  warn: COLORS.yellow,
} as const;

/**
 * A transport that writes debug logs to the host environment's console
 * (e.g. browser devtools or Node.js stdout) with ANSI color accents.
 *
 * @public
 */
export class ConsoleTransport implements DebugTransport {
  /**
   * Write a single log entry to the console, choosing the appropriate
   * console method based on the entry level.
   *
   * @param entry - The debug log entry to print
   */
  send(entry: DebugLogEntry): Promise<void> {
    const timestamp = new Date(entry.timestamp).toISOString();
    const level = entry.level.toUpperCase();
    const source = entry.source ? `[${entry.source}]` : '';
    const context = entry.context ? ` ${JSON.stringify(entry.context)}` : '';

    const levelColor = LEVEL_COLORS[entry.level] || COLORS.white;

    const prefix = `${COLORS.bright}${COLORS.cyan}[Clerk Debug]${COLORS.reset}`;
    const timestampColored = `${COLORS.dim}${timestamp}${COLORS.reset}`;
    const levelColored = `${levelColor}${level}${COLORS.reset}`;
    const sourceColored = source ? `${COLORS.gray}${source}${COLORS.reset}` : '';
    const messageColored = `${COLORS.white}${entry.message}${COLORS.reset}`;
    const contextColored = context ? `${COLORS.dim}${context}${COLORS.reset}` : '';

    const message = `${prefix} ${timestampColored} ${levelColored}${sourceColored}: ${messageColored}${contextColored}`;

    switch (entry.level) {
      case 'error':
        console.error(message);
        break;
      case 'warn':
        console.warn(message);
        break;
      case 'info':
        console.info(message);
        break;
      case 'debug':
        console.debug(message);
        break;
      case 'trace':
        console.trace(message);
        break;
      default:
        console.log(message);
    }

    return Promise.resolve();
  }
}
