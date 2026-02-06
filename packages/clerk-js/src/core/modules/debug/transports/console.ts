import type { DebugLogEntry, DebugTransport } from '../types';

/**
 * A transport that writes debug logs to the host environment's console
 * (e.g. browser devtools or Node.js stdout).
 *
 * Currently disabled by default (noop).
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
  send(_entry: DebugLogEntry): Promise<void> {
    return Promise.resolve();
  }
}
