import type { DebugLogEntry, DebugTransport } from '../types';

/**
 * ANSI color codes for console output
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
} as const;

/**
 * Color mapping for different log levels
 */
const levelColors = {
  error: colors.red,
  warn: colors.yellow,
  info: colors.blue,
  debug: colors.green,
  trace: colors.magenta,
} as const;

export class ConsoleTransport implements DebugTransport {
  async send(entry: DebugLogEntry): Promise<void> {
    const timestamp = new Date(entry.timestamp).toISOString();
    const level = entry.level.toUpperCase();
    const source = entry.source ? `[${entry.source}]` : '';
    const context = entry.context ? ` ${JSON.stringify(entry.context)}` : '';

    const levelColor = levelColors[entry.level] || colors.white;

    const prefix = `${colors.bright}${colors.cyan}[Clerk Debug]${colors.reset}`;
    const timestampColored = `${colors.dim}${timestamp}${colors.reset}`;
    const levelColored = `${levelColor}${level}${colors.reset}`;
    const sourceColored = source ? `${colors.gray}${source}${colors.reset}` : '';
    const messageColored = `${colors.white}${entry.message}${colors.reset}`;
    const contextColored = context ? `${colors.dim}${context}${colors.reset}` : '';

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
  }
}
