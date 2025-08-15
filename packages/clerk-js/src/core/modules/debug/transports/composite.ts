import type { DebugLogEntry, DebugLogFilter, DebugTransport } from '../types';

/**
 * Options for configuring a composite debug transport that fans out logs
 * to multiple underlying transports.
 *
 * @public
 */
export interface CompositeLoggerOptions {
  filters?: DebugLogFilter[];
  logLevel?: 'error' | 'warn' | 'info' | 'debug' | 'trace';
  transports: Array<{
    options?: Record<string, unknown>;
    transport: DebugTransport;
  }>;
}

/**
 * A transport that forwards each log entry to a list of child transports.
 * Failures in one transport do not block others.
 *
 * @public
 */
export class CompositeTransport implements DebugTransport {
  private readonly transports: DebugTransport[];

  /**
   * Create a composite transport.
   *
   * @param transports - Transports that will receive each log entry
   */
  constructor(transports: DebugTransport[]) {
    this.transports = transports;
  }

  /**
   * Send a log entry to all configured transports.
   * Errors from individual transports are caught and logged to the console.
   *
   * @param entry - The debug log entry to send
   */
  async send(entry: DebugLogEntry): Promise<void> {
    const promises = this.transports.map(transport =>
      transport.send(entry).catch(err => {
        console.error('Failed to send to transport:', err);
      }),
    );
    await Promise.allSettled(promises);
  }
}
