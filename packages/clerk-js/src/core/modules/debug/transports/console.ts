import type { DebugLogEntry, DebugTransport } from '../types';

/**
 * A transport that writes debug logs to the host environment's console
 * (e.g. browser devtools or Node.js stdout).
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

    const message = `[Clerk Debug] ${timestamp} ${level}${source}: ${entry.message}${context}`;

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
      default:
        console.log(message);
    }

    return Promise.resolve();
  }
}
